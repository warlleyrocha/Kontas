import { useQuery } from "@apollo/client/react";
import { useState, useMemo } from "react";
import { adaptarContaGraphQL } from "@/src/utils/account.adapter";

import { GET_CONTAS_POR_REPUBLICA } from "@/src/graphql/queries/accounts";
import type { ContaGraphQL } from "@/src/graphql/types/account";

interface UseAccountsListProps {
  readonly republicId: string;
}

export function useAccountList({ republicId }: UseAccountsListProps) {
  const [mesSelecionado, setMesSelecionado] = useState<string>("todos");
  const [mostrarContasAbertas, setMostrarContasAbertas] = useState(true);
  const [mostrarContasPagas, setMostrarContasPagas] = useState(false);

  // Busca as contas do GraphQL
  const { data, loading, error } = useQuery<{
    contasPorRepublica: ContaGraphQL[];
  }>(GET_CONTAS_POR_REPUBLICA, {
    variables: { republicaId: republicId },
  });

  // Adapta os dados do GraphQL para o formato esperado pelo componente
  const contasAdaptadas = useMemo(() => {
    if (!data?.contasPorRepublica) return [];
    return data.contasPorRepublica.map(adaptarContaGraphQL);
  }, [data]);

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
          (conta) => conta.mesReferencia === mesSelecionado
        );

  // Organiza contas em abertas e pagas
  const contasOrdenadas = {
    abertas: contasFiltradas.filter((conta) => conta.status === "aberta"),
    pagas: contasFiltradas.filter((conta) => conta.status === "paga"),
  };

  return {
    data,
    loading,
    error,
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
