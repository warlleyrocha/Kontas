import { useCallback, useEffect, useId, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";

import {
  useAccountsByRepublicQuery,
  useAccountsByResidentQueries,
} from "@/src/features/accounts/hooks/useAccountQueries";
import { accountKeys } from "@/src/features/accounts/hooks/account.keys";
import { accountResidentKeys } from "@/src/features/accounts/hooks/accountResident.keys";
import {
  type Conta,
  StatusConta,
} from "@/src/features/accounts/types/account.types";
import { StatusPagamento } from "@/src/features/accounts/types/accountResidents.types";
import { useRefresh } from "@/src/shared/contexts/RefreshContext";
import type { ResidentResponse } from "@/src/shared/types/resident.types";

const STATUS_PENDENTE = [
  StatusPagamento.PENDENTE,
  StatusPagamento.AGUARDANDO_CONFIRMACAO,
];

interface UseResumeTabProps {
  residents: ResidentResponse[];
  republicId: string;
}

interface UseResumeTabReturn {
  contas: Conta[];
  isLoadingContas: boolean;
  dividas: Record<string, number>;
  isLoadingDividas: boolean;
  totalValor: number;
  totalPago: number;
  totalPendente: number;
  quantidadePagas: number;
  quantidadePendentes: number;
}

export function useResumeTab({
  residents,
  republicId,
}: UseResumeTabProps): UseResumeTabReturn {
  const refreshRegistrationId = useId();
  const queryClient = useQueryClient();
  const { data: contas = [], isLoading: isLoadingContas } =
    useAccountsByRepublicQuery(republicId);

  const moradorIds = useMemo(() => residents.map((r) => r.id), [residents]);
  const dividasQueries = useAccountsByResidentQueries(republicId, moradorIds);
  const { registerRefresh } = useRefresh();

  const refresh = useCallback(async () => {
    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: accountKeys.byRepublic(republicId),
      }),
      queryClient.invalidateQueries({
        queryKey: accountResidentKeys.byRepublic(republicId),
      }),
    ]);
  }, [queryClient, republicId]);

  useEffect(() => {
    return registerRefresh(
      `resume-${republicId}-${refreshRegistrationId}`,
      refresh
    );
  }, [refresh, refreshRegistrationId, registerRefresh, republicId]);

  const isLoadingDividas = dividasQueries.isLoading;

  const dividas = useMemo(() => {
    const map: Record<string, number> = {};
    residents.forEach((resident, i) => {
      const data = dividasQueries.data[i] ?? [];
      const total = data
        .filter((c) => STATUS_PENDENTE.includes(c.status))
        .reduce((sum, c) => sum + c.valor, 0);
      map[resident.id] = total;
    });
    return map;
  }, [residents, dividasQueries.data]);

  const contasPagas = contas.filter((c) => c.status === StatusConta.PAGA);
  const contasPendentes = contas.filter((c) => c.status !== StatusConta.PAGA);

  return {
    contas,
    isLoadingContas,
    dividas,
    isLoadingDividas,
    totalValor: contas.reduce((sum, c) => sum + c.valor, 0),
    totalPago: contasPagas.reduce((sum, c) => sum + c.valor, 0),
    totalPendente: contasPendentes.reduce((sum, c) => sum + c.valor, 0),
    quantidadePagas: contasPagas.length,
    quantidadePendentes: contasPendentes.length,
  };
}
