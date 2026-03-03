// biome-ignore assist/source/organizeImports: <explanation>
import { useState, useMemo, useCallback } from "react";

import { accountService } from "../services/account.service";
import type { Conta } from "../types/account.types";
import { showToast } from "@/src/utils/showToast";
import { getErrorMessage } from "@/src/services/httpError";

interface UseAccountsListProps {
  readonly republicId: string;
}

export function useAccountList({ republicId }: UseAccountsListProps) {
  const [contas, setContas] = useState<Conta[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [mesSelecionado, setMesSelecionado] = useState<string>("todos");
  const [mostrarContasAbertas, setMostrarContasAbertas] = useState(true);
  const [mostrarContasPagas, setMostrarContasPagas] = useState(false);

  // Buscar lista de contas
  const fetchAccounts = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const contas = await accountService.listarContasPorRepublica(republicId);
      setContas(contas);

      return contas;
    } catch (error) {
      const message = getErrorMessage(
        error,
        "Não foi possível carregar as contas.",
      );

      console.error("Erro ao buscar contas:", error);
      showToast.error(message);
      setError(error instanceof Error ? error : new Error(message));
      setContas([]);
      return [];
    } finally {
      setLoading(false);
      console.log("Busca de contas finalizada.");
    }
  }, [republicId]);

  // Lista todos os moradores e status de pagamento de uma conta
  const fetchAccountResidents = useCallback(async (accountId: string) => {
    try {
      const moradores =
        await accountService.listarContasPorMoradores(accountId);
      return moradores;
    } catch (error) {
      const message = getErrorMessage(
        error,
        "Não foi possível carregar os moradores da conta.",
      );
      console.error("Erro ao buscar moradores da conta:", error);
      showToast.error(message);
      return [];
    }
  }, []);

  // Adapta os dados para o formato do componente
  const contasAdaptadas = useMemo(() => {
    return contas.map((conta) => {
      const vencimento = new Date(conta.vencimento);
      const mesReferencia = `${vencimento.getFullYear()}-${String(
        vencimento.getMonth() + 1,
      ).padStart(2, "0")}`;
      return {
        ...conta,
        mesReferencia,
      };
    });
  }, [contas]);

  // Extrai meses disponíveis das contas
  const mesesDisponiveis = useMemo(() => {
    const meses = new Set(contasAdaptadas.map((c) => c.mesReferencia));
    return Array.from(meses).sort((a, b) => a.localeCompare(b));
  }, [contasAdaptadas]);

  // Filtra contas por mês
  const contasFiltradas =
    mesSelecionado === "todos"
      ? contasAdaptadas
      : contasAdaptadas.filter(
          (conta) => conta.mesReferencia === mesSelecionado,
        );

  // Organiza contas em abertas e pagas
  const contasOrdenadas = {
    abertas: contasFiltradas.filter((c) => !c.pago),
    pagas: contasFiltradas.filter((c) => c.pago),
  };

  return {
    loading,
    error,
    fetchAccounts,
    fetchAccountResidents,
    contas,
    mesSelecionado,
    mostrarContasAbertas,
    mostrarContasPagas,
    setMesSelecionado,
    setMostrarContasPagas,
    setMostrarContasAbertas,
    mesesDisponiveis,
    contasOrdenadas,
  };
}
