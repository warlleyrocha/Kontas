// contasAdaptadas, mesesDisponiveis, contasOrdenadas
import { useMemo } from "react";

import type { Conta } from "@/src/features/accounts/types/account.types";

interface UseAccountDerivedDataProps {
  contas: Conta[];
  mesSelecionado: string;
}

interface ContaAdaptada extends Conta {
  mesReferencia: string;
}

interface UseAccountDerivedDataReturn {
  mesesDisponiveis: string[];
  contasOrdenadas: {
    abertas: ContaAdaptada[];
    pagas: ContaAdaptada[];
  };
}

export function useAccountDerivedData({
  contas,
  mesSelecionado,
}: UseAccountDerivedDataProps): UseAccountDerivedDataReturn {
  const contasAdaptadas = useMemo<ContaAdaptada[]>(() => {
    return contas.map((conta) => {
      const vencimento = new Date(conta.vencimento);
      const mesReferencia = `${vencimento.getFullYear()}-${String(
        vencimento.getMonth() + 1,
      ).padStart(2, "0")}`;
      return { ...conta, mesReferencia };
    });
  }, [contas]);

  const mesesDisponiveis = useMemo<string[]>(() => {
    const meses = new Set(contasAdaptadas.map((c) => c.mesReferencia));
    return Array.from(meses).sort((a, b) => a.localeCompare(b));
  }, [contasAdaptadas]);

  const contasOrdenadas = useMemo(() => {
    const filtradas =
      mesSelecionado === "todos"
        ? contasAdaptadas
        : contasAdaptadas.filter((c) => c.mesReferencia === mesSelecionado);

    return {
      abertas: filtradas.filter((c) => !c.pago),
      pagas: filtradas.filter((c) => c.pago),
    };
  }, [contasAdaptadas, mesSelecionado]);

  return {
    mesesDisponiveis,
    contasOrdenadas,
  };
}
