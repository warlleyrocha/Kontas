import { useCallback, useEffect, useMemo, useState } from "react";
import { Platform } from "react-native";
import { useResidents } from "@/src/features/residents/hooks/useResidents";

interface UseAccountFormParams {
  republicId: string;
  onClose: () => void;
}

type TipoDivisao = "equal" | "custom";

interface MoradorDivisao {
  moradorId: string;
  nome: string;
  checked: boolean;
  valor: string;
}

interface AccountFormData {
  descricao: string;
  valorTotal: string;
  vencimento: Date;
  metodoPagamento: string;
  tipoDivisao: TipoDivisao;
  moradoresDivisao: MoradorDivisao[];
}

function parseCurrencyValue(value: string): number {
  const normalized = value.replace(/\./g, "").replace(",", ".").trim();
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatCurrencyValue(value: number): string {
  return value.toFixed(2).replace(".", ",");
}

function splitEvenly(total: number, parts: number): number[] {
  if (!parts) return [];

  const cents = Math.round(total * 100);
  const base = Math.floor(cents / parts);
  let remainder = cents - base * parts;

  return Array.from({ length: parts }, () => {
    const current = base + (remainder > 0 ? 1 : 0);
    remainder = Math.max(0, remainder - 1);
    return current / 100;
  });
}

function createInitialFormData(): AccountFormData {
  return {
    descricao: "",
    valorTotal: "",
    vencimento: new Date(),
    metodoPagamento: "PIX",
    tipoDivisao: "equal",
    moradoresDivisao: [],
  };
}

export function useAccountForm({ republicId, onClose }: UseAccountFormParams) {
  const { residents, fetchResidents } = useResidents();
  const [formData, setFormData] = useState<AccountFormData>(
    createInitialFormData
  );
  const [tempVencimento, setTempVencimento] = useState(formData.vencimento);
  const [showDatepicker, setShowDatepicker] = useState(false);

  // Buscar moradores da API quando o componente montar
  useEffect(() => {
    const loadResidents = async () => {
      await fetchResidents(republicId);
    };
    loadResidents();
  }, [republicId, fetchResidents]);

  const applySplitByType = useCallback(
    (list: MoradorDivisao[], type: TipoDivisao, totalValue: string) => {
      const selected = list.filter((morador) => morador.checked);
      if (!selected.length)
        return list.map((morador) => ({ ...morador, valor: "" }));

      if (type === "custom") {
        return list.map((morador) => ({
          ...morador,
          valor:
            morador.checked && !morador.valor
              ? "0,00"
              : morador.checked
                ? morador.valor
                : "",
        }));
      }

      const total = parseCurrencyValue(totalValue);
      const values = splitEvenly(total, selected.length);
      let cursor = 0;

      return list.map((morador) => {
        if (!morador.checked) return { ...morador, valor: "" };

        const nextValue = values[cursor] ?? 0;
        cursor += 1;

        return {
          ...morador,
          valor: formatCurrencyValue(nextValue),
        };
      });
    },
    []
  );

  // Atualizar moradoresDivisao quando residents mudar
  useEffect(() => {
    const moradores = residents.map((resident) => ({
      moradorId: resident.id,
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
  }, [residents, applySplitByType]);

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
    setFormData((prev) => ({
      ...prev,
      moradoresDivisao: prev.moradoresDivisao.map((morador) =>
        morador.moradorId === moradorId
          ? { ...morador, valor: sanitized }
          : morador
      ),
    }));
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
