import { useEffect, useMemo, useState } from "react";
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

export function useAccountForm({ republicId, onClose }: UseAccountFormParams) {
  const { residents, fetchResidents } = useResidents();
  const [descricao, setDescricao] = useState("");
  const [valorTotal, setValorTotal] = useState("");
  const [vencimento, setVencimento] = useState(new Date());
  const [metodoPagamento, setMetodoPagamento] = useState("PIX");
  const [tempVencimento, setTempVencimento] = useState(new Date());
  const [showDatepicker, setShowDatepicker] = useState(false);
  const [tipoDivisao, setTipoDivisao] = useState<TipoDivisao>("equal");
  const [moradoresDivisao, setMoradoresDivisao] = useState<MoradorDivisao[]>(
    []
  );

  // Buscar moradores da API quando o componente montar
  useEffect(() => {
    const loadResidents = async () => {
      await fetchResidents(republicId);
    };
    loadResidents();
  }, [republicId, fetchResidents]);

  // Atualizar moradoresDivisao quando residents mudar
  useEffect(() => {
    if (residents.length > 0) {
      setMoradoresDivisao(
        residents.map((resident) => ({
          moradorId: resident.id,
          nome: resident.nome,
          checked: true,
          valor: "",
        }))
      );
    }
  }, [residents]);

  const applySplitByType = (
    list: MoradorDivisao[],
    type: TipoDivisao,
    totalValue: string
  ) => {
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
  };

  const handleDateChange = (_: any, selectedDate?: Date) => {
    if (!selectedDate) return;

    if (Platform.OS === "android") {
      setVencimento(selectedDate);
      setShowDatepicker(false);
      return;
    }

    setTempVencimento(selectedDate);
  };

  const handleOpenDatepicker = () => {
    setTempVencimento(vencimento);
    setShowDatepicker(true);
  };

  const handleConfirmDate = () => {
    setVencimento(tempVencimento);
    setShowDatepicker(false);
  };

  const handleCloseModal = () => {
    onClose();
  };

  const handleSetTipoDivisao = (type: TipoDivisao) => {
    setTipoDivisao(type);
    setMoradoresDivisao((prev) => applySplitByType(prev, type, valorTotal));
  };

  const handleToggleMorador = (moradorId: string) => {
    setMoradoresDivisao((prev) => {
      const updated = prev.map((morador) =>
        morador.moradorId === moradorId
          ? { ...morador, checked: !morador.checked }
          : morador
      );

      return applySplitByType(updated, tipoDivisao, valorTotal);
    });
  };

  const handleMoradorValorChange = (moradorId: string, value: string) => {
    const sanitized = value.replace(/[^\d.,]/g, "");
    setMoradoresDivisao((prev) =>
      prev.map((morador) =>
        morador.moradorId === moradorId
          ? { ...morador, valor: sanitized }
          : morador
      )
    );
  };

  useEffect(() => {
    if (tipoDivisao !== "equal") return;
    setMoradoresDivisao((prev) => applySplitByType(prev, "equal", valorTotal));
  }, [tipoDivisao, valorTotal]);

  const totalDivisaoPreenchido = useMemo(
    () =>
      moradoresDivisao.reduce((acc, morador) => {
        if (!morador.checked) return acc;
        return acc + parseCurrencyValue(morador.valor);
      }, 0),
    [moradoresDivisao]
  );

  return {
    descricao,
    valorTotal,
    vencimento,
    metodoPagamento,
    tempVencimento,
    showDatepicker,
    tipoDivisao,
    moradoresDivisao,
    totalDivisaoPreenchido,

    setDescricao,
    setValorTotal,
    setVencimento,
    setMetodoPagamento,
    setTempVencimento,
    setShowDatepicker,

    handleCloseModal,
    handleConfirmDate,
    handleOpenDatepicker,
    handleDateChange,
    handleSetTipoDivisao,
    handleToggleMorador,
    handleMoradorValorChange,
  };
}
