// src/hooks/useAddConta.ts

import type { Conta, Republica, Responsavel } from "@/src/types/resume";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, Platform } from "react-native";

/* Helpers puros (exportados para testes) */
export const toNumber = (s?: string) =>
  Number.parseFloat(
    (s ?? "0")
      .toString()
      .replace(",", ".")
      .replaceAll(/[^\d.-]/g, "")
  ) ?? 0;

export const formatNumber = (n: number) => Number(n).toFixed(2);

export const computeEqualSplit = (total: number, ids: string[]) => {
  const map: Record<string, string> = {};
  if (ids.length === 0) return map;
  const split = Number((total / ids.length).toFixed(2));
  ids.forEach((id, i) => {
    if (i === ids.length - 1) {
      const somaPrev = split * (ids.length - 1);
      const last = Number((total - somaPrev).toFixed(2));
      map[id] = formatNumber(last);
    } else {
      map[id] = formatNumber(split);
    }
  });
  return map;
};

type TipoDivisao = "equal" | "custom";

interface UseAddContaParams {
  republica: Republica;
  setRepublica: (r: Republica) => void;
  onClose?: () => void;
  visible?: boolean;
  contaParaEditar?: Conta | null;
  userLoggedId?: string;
}

export interface UseAddContaReturn {
  descricao: string;
  setDescricao: (s: string) => void;
  valorStr: string;
  setValorStr: (s: string) => void;
  vencimento: Date;
  setVencimento: (d: Date) => void;
  showDatepicker: boolean;
  setShowDatepicker: (b: boolean) => void;
  metodoPagamento: string;
  setMetodoPagamento: (m: string) => void;
  responsavelId: string | null;
  setResponsavelId: (id: string | null) => void;
  tipoDivisao: "equal" | "custom";
  setTipoDivisao: (t: "equal" | "custom") => void;
  selectedIds: string[];
  toggleSelectMorador: (id: string) => void;
  valoresByMorador: Record<string, string>;
  setValorMorador: (id: string, val: string) => void;
  somaResponsaveis: number;
  limpar: () => void;
  salvar: () => Promise<boolean>; // true = sucesso
  handleDateChange: (event: any, date?: Date) => void;
}

/**
 * Hook centralizando a lógica do AddContaModal.
 * Mantém todos os estados e oferece handlers prontos para uso no componente.
 */
export default function useAddConta({
  republica,
  setRepublica,
  onClose,
  visible = false,
  contaParaEditar,
  userLoggedId,
}: UseAddContaParams): UseAddContaReturn {
  const [descricao, setDescricao] = useState("");
  const [valorStr, setValorStr] = useState("");
  const [vencimento, setVencimento] = useState<Date>(new Date());
  const [showDatepicker, setShowDatepicker] = useState(false);
  const [metodoPagamento, setMetodoPagamento] = useState("PIX");
  const [responsavelId, setResponsavelId] = useState<string | null>(
    userLoggedId ?? republica.moradores[0]?.id ?? null
  );
  const [edicaoManual, setEdicaoManual] = useState(false);

  const [tipoDivisao, setTipoDivisao] = useState<TipoDivisao>("equal");
  const [selectedIds, setSelectedIds] = useState<string[]>(
    republica.moradores.map((m) => m.id)
  );
  const [valoresByMorador, setValoresByMorador] = useState<
    Record<string, string>
  >({});

  // Preencher dados quando for edição
  useEffect(() => {
    if (contaParaEditar && visible) {
      setDescricao(contaParaEditar.descricao);
      setValorStr(contaParaEditar.valor.toString());
      setVencimento(new Date(contaParaEditar.vencimento));
      setMetodoPagamento(contaParaEditar.metodoPagamento ?? "PIX");
      setResponsavelId(contaParaEditar.responsavelId);

      const ids = contaParaEditar.responsaveis.map((r) => r.moradorId);
      setSelectedIds(ids);

      const valores: Record<string, string> = {};
      contaParaEditar.responsaveis.forEach((r) => {
        valores[r.moradorId] = r.valor.toFixed(2);
      });
      setValoresByMorador(valores);

      // Detectar se a divisão é igual ou customizada
      const total = contaParaEditar.valor;
      const isEqual = contaParaEditar.responsaveis.every((r, i, arr) => {
        if (arr.length === 0) return true;
        const expectedEqual = Number((total / arr.length).toFixed(2));
        // Último pode ter ajuste de centavos
        if (i === arr.length - 1) {
          const somaPrev = expectedEqual * (arr.length - 1);
          const expectedLast = Number((total - somaPrev).toFixed(2));
          return Math.abs(r.valor - expectedLast) < 0.01;
        }
        return Math.abs(r.valor - expectedEqual) < 0.01;
      });

      setTipoDivisao(isEqual ? "equal" : "custom");
    } else if (visible && !contaParaEditar) {
      // Quando não há conta para editar (modo criação), resetar para o usuário logado
      setResponsavelId(userLoggedId ?? republica.moradores[0]?.id ?? null);
    }
  }, [contaParaEditar, visible, userLoggedId, republica.moradores]);

  const setValorMorador = useCallback((id: string, val: string) => {
    setValoresByMorador((prev) => ({ ...prev, [id]: val }));

    // Marcar que houve edição manual
    setEdicaoManual(true);

    // Se estava em "equal", mudar para "custom"
    setTipoDivisao("custom");
  }, []);
  /* Recalcula valores por morador quando necessário.
  Mantém lógica de 'equal' vs 'custom' aqui. */
  useEffect(() => {
    if (!visible) return;

    const total = toNumber(valorStr);
    const ids =
      selectedIds.length > 0
        ? selectedIds
        : republica.moradores.map((m) => m.id);

    // Se apenas 1 morador selecionado, mudar para custom automaticamente
    if (ids.length === 1 && tipoDivisao === "equal") {
      setTipoDivisao("custom");
      setEdicaoManual(false); // Reset da flag
    }

    // Se voltar a ter múltiplos moradores e estava em custom (por ter tido 1 só),
    // voltar para equal
    if (ids.length > 1 && tipoDivisao === "custom" && !edicaoManual) {
      setTipoDivisao("equal");
    }

    if (!edicaoManual) {
      if (
        !Number.isNaN(total) &&
        total > 0 &&
        tipoDivisao === "equal" &&
        ids.length > 0
      ) {
        setValoresByMorador(() => computeEqualSplit(total, ids));
      } else if (tipoDivisao === "custom") {
        // No modo custom, começar com valores divididos igualmente
        if (!Number.isNaN(total) && total > 0 && ids.length > 0) {
          setValoresByMorador(() => computeEqualSplit(total, ids));
        } else {
          const zeros: Record<string, string> = {};
          ids.forEach((id) => (zeros[id] = "0.00"));
          setValoresByMorador(zeros);
        }
      }
    }
  }, [
    visible,
    valorStr,
    selectedIds,
    tipoDivisao,
    republica.moradores,
    edicaoManual,
  ]);

  const toggleSelectMorador = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const exists = prev.includes(id);
      if (exists) return prev.filter((p) => p !== id);
      return [...prev, id];
    });
  }, []);

  const somaResponsaveis = useMemo(
    () =>
      Object.values(valoresByMorador).reduce((acc, s) => {
        const n = toNumber(s);
        return acc + (Number.isNaN(n) ? 0 : n);
      }, 0),
    [valoresByMorador]
  );

  const limpar = useCallback(() => {
    setDescricao("");
    setValorStr("");
    setVencimento(new Date());
    setMetodoPagamento("PIX");
    setResponsavelId(userLoggedId ?? republica.moradores[0]?.id ?? null);
    setTipoDivisao("equal");
    setSelectedIds(republica.moradores.map((m) => m.id));
    setValoresByMorador({});
    setEdicaoManual(false);
  }, [republica.moradores, userLoggedId]);

  /**
   * salvar: valida, constrói responsaveis, ajusta diferença, atualiza republica.
   * retorna true se sucesso, false se validação falhar.
   */
  const salvar = useCallback(async (): Promise<boolean> => {
    const valor = toNumber(valorStr);

    if (!descricao.trim()) {
      Alert.alert("Preencha a descrição");
      return false;
    }
    if (Number.isNaN(valor) ?? valor <= 0) {
      Alert.alert("Informe um valor válido");
      return false;
    }
    if (!responsavelId) {
      Alert.alert("Selecione um morador responsável");
      return false;
    }
    if (selectedIds.length === 0) {
      Alert.alert("Selecione ao menos 1 morador para dividir");
      return false;
    }

    // monta responsaveis a partir dos selecionados
    let responsaveis: Responsavel[] = selectedIds.map((id) => ({
      moradorId: id,
      valor: toNumber(valoresByMorador[id]),
    }));

    const soma = responsaveis.reduce((s, r) => s + r.valor, 0);

    // ajusta diferença no último
    if (
      responsaveis.length > 0 &&
      Number(soma.toFixed(2)) !== Number(valor.toFixed(2))
    ) {
      const diff = Number((valor - soma).toFixed(2));
      const lastIndex = responsaveis.length - 1;
      responsaveis[lastIndex].valor = Number(
        (responsaveis[lastIndex].valor + diff).toFixed(2)
      );
    }

    const novaConta: Conta = {
      id: contaParaEditar?.id ?? Date.now().toString(),
      descricao: descricao.trim(),
      valor: Number(valor.toFixed(2)),
      vencimento: vencimento.toISOString(),
      pago: contaParaEditar?.pago ?? false,
      pagoEm: contaParaEditar?.pagoEm,
      responsavelId,
      responsaveis,
      metodoPagamento: metodoPagamento ?? undefined,
    };

    if (contaParaEditar) {
      // Modo edição: atualizar conta existente
      setRepublica({
        ...republica,
        contas: republica.contas.map((c) =>
          c.id === contaParaEditar.id ? novaConta : c
        ),
      });
      Alert.alert("Conta atualizada");
    } else {
      // Modo criação: adicionar nova conta
      setRepublica({
        ...republica,
        contas: [...republica.contas, novaConta],
      });
      Alert.alert("Conta adicionada");
    }
    limpar();
    try {
      onClose?.();
    } catch {
      // ignore onClose errors
    }
    return true;
  }, [
    descricao,
    valorStr,
    vencimento,
    metodoPagamento,
    responsavelId,
    selectedIds,
    valoresByMorador,
    republica,
    setRepublica,
    limpar,
    onClose,
    contaParaEditar,
  ]);

  const handleDateChange = useCallback((_: any, date?: Date) => {
    if (Platform.OS === "android") setShowDatepicker(false);
    if (date) setVencimento(date);
  }, []);

  // ✅ Adicionar handler para quando usuário clica nos botões de tipo de divisão
  const handleSetTipoDivisao = useCallback((tipo: "equal" | "custom") => {
    setTipoDivisao(tipo);
    if (tipo === "equal") {
      setEdicaoManual(false); // Reset quando volta para equal manualmente
    }
  }, []);

  return {
    descricao,
    setDescricao,
    valorStr,
    setValorStr,
    vencimento,
    setVencimento,
    showDatepicker,
    setShowDatepicker,
    metodoPagamento,
    setMetodoPagamento,
    responsavelId,
    setResponsavelId,
    tipoDivisao,
    setTipoDivisao: handleSetTipoDivisao,
    selectedIds,
    toggleSelectMorador,
    valoresByMorador,
    setValorMorador,
    somaResponsaveis,
    limpar,
    salvar,
    handleDateChange,
  };
}
