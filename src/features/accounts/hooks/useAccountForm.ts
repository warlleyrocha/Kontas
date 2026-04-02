import { useEffect, useMemo, useState } from "react";
import { Platform } from "react-native";
import { useResidents } from "@/src/features/residents/hooks/useResidents";
import { MetodoPagamento } from "../types/account.types";
import { formatBRL } from "@/src/shared/utils/formats";
import type { MoradorDivisao, TipoDivisao } from "../types/accountForm.types";
import {
  applySplitByType,
  parseCurrencyValue,
} from "../utils/accountForm.utils";

interface UseAccountFormParams {
  readonly republicId: string;
  readonly visible: boolean;
  readonly onClose: () => void;
}

interface AccountFormData {
  descricao: string;
  valorTotal: string;
  vencimento: Date;
  metodoPagamento: MetodoPagamento;
  tipoDivisao: TipoDivisao;
  moradoresDivisao: MoradorDivisao[];
}

function createInitialFormData(): AccountFormData {
  return {
    descricao: "",
    valorTotal: "",
    vencimento: new Date(),
    metodoPagamento: MetodoPagamento.PIX,
    tipoDivisao: "equal",
    moradoresDivisao: [],
  };
}

export function useAccountForm({
  republicId,
  onClose,
}: UseAccountFormParams) {
  const { residents } = useResidents(republicId);
  const [formData, setFormData] = useState<AccountFormData>(
    createInitialFormData
  );
  const [tempVencimento, setTempVencimento] = useState(formData.vencimento);
  const [showDatepicker, setShowDatepicker] = useState(false);

  // Atualizar moradoresDivisao quando residents mudar
  useEffect(() => {
    const moradores = residents.map((resident) => ({
      moradorId: resident.id,
      fotoPerfil: resident.fotoPerfil,
      role: resident.role,
      nome: resident.nome,
      checked: true,
      valor: "",
    }));

    setFormData((prev) => ({
      ...prev,
      moradoresDivisao: applySplitByType(
        moradores,
        prev.tipoDivisao,
        prev.valorTotal
      ),
    }));
  }, [residents]);

  const handleDateChange = (_: any, selectedDate?: Date) => {
    if (!selectedDate) return;

    if (Platform.OS === "android") {
      setFormData((prev) => ({ ...prev, vencimento: selectedDate }));
      setShowDatepicker(false);
      return;
    }

    setTempVencimento(selectedDate);
  };

  const handleOpenDatepicker = () => {
    setTempVencimento(formData.vencimento);
    setShowDatepicker(true);
  };

  const handleConfirmDate = () => {
    setFormData((prev) => ({ ...prev, vencimento: tempVencimento }));
    setShowDatepicker(false);
  };

  const handleCloseModal = () => {
    onClose();
  };

  const handleSetTipoDivisao = (type: TipoDivisao) => {
    setFormData((prev) => ({
      ...prev,
      tipoDivisao: type,
      moradoresDivisao: applySplitByType(
        prev.moradoresDivisao,
        type,
        prev.valorTotal
      ),
    }));
  };

  const handleToggleMorador = (moradorId: string) => {
    setFormData((prev) => {
      const updated = prev.moradoresDivisao.map((morador) =>
        morador.moradorId === moradorId
          ? { ...morador, checked: !morador.checked }
          : morador
      );

      return {
        ...prev,
        moradoresDivisao: applySplitByType(
          updated,
          prev.tipoDivisao,
          prev.valorTotal
        ),
      };
    });
  };

  const handleMoradorValorChange = (moradorId: string, value: string) => {
    const sanitized = value.replace(/[^\d.,]/g, "");
    setFormData((prev) => {
      const valorTotal = parseCurrencyValue(prev.valorTotal);
      const somaOutros = prev.moradoresDivisao.reduce((acc, m) => {
        if (!m.checked || m.moradorId === moradorId) return acc;
        return acc + parseCurrencyValue(m.valor);
      }, 0);
      const maxPermitido = Math.max(valorTotal - somaOutros, 0);
      const valorDigitado = parseCurrencyValue(sanitized);
      const valorFinal =
        valorDigitado > maxPermitido ? formatBRL(maxPermitido) : sanitized;

      return {
        ...prev,
        moradoresDivisao: prev.moradoresDivisao.map((morador) =>
          morador.moradorId === moradorId
            ? { ...morador, valor: valorFinal }
            : morador
        ),
      };
    });
  };

  const handleValorTotalChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      valorTotal: value,
      moradoresDivisao:
        prev.tipoDivisao === "equal"
          ? applySplitByType(prev.moradoresDivisao, "equal", value)
          : prev.moradoresDivisao,
    }));
  };

  const totalDivisaoPreenchido = useMemo(
    () =>
      formData.moradoresDivisao.reduce((acc, morador) => {
        if (!morador.checked) return acc;
        return acc + parseCurrencyValue(morador.valor);
      }, 0),
    [formData.moradoresDivisao]
  );

  return {
    formData,
    tempVencimento,
    showDatepicker,
    totalDivisaoPreenchido,

    setFormData,
    setTempVencimento,
    setShowDatepicker,

    handleValorTotalChange,
    handleCloseModal,
    handleConfirmDate,
    handleOpenDatepicker,
    handleDateChange,
    handleSetTipoDivisao,
    handleToggleMorador,
    handleMoradorValorChange,
  };
}
