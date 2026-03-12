import { useAccountActions } from "@/src/features/accounts/hooks/useAccountActions";
import { useAccountData } from "@/src/features/accounts/hooks/useAccountList/useAccountData";
import { StatusPagamento } from "@/src/features/accounts/types/accountResidents.types";
import type { Conta, ListarContasResponse } from "@/src/features/accounts/types/account.types";
import type { ResidentResponse } from "@/src/shared/types/resident.types";
import { useRefresh } from "@/src/shared/contexts/RefreshContext";
import { useCallback, useEffect, useState } from "react";

const STATUS_PENDENTE = [
  StatusPagamento.PENDENTE,
  StatusPagamento.AGUARDANDO_CONFIRMACAO,
];

async function calcularDividaMorador(
  moradorId: string,
  fetchContasPorMorador: (id: string) => Promise<ListarContasResponse>,
): Promise<{ id: string; total: number }> {
  const contas = await fetchContasPorMorador(moradorId);
  const total = contas
    .filter((c) => STATUS_PENDENTE.includes(c.status))
    .reduce((sum, c) => sum + c.valor, 0);
  return { id: moradorId, total };
}

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
  const { fetchContasPorMorador } = useAccountActions();
  const { fetchAccounts } = useAccountData({ republicId });
  const { registerRefresh } = useRefresh();

  const [contas, setContas] = useState<Conta[]>([]);
  const [isLoadingContas, setIsLoadingContas] = useState(false);
  const [dividas, setDividas] = useState<Record<string, number>>({});
  const [isLoadingDividas, setIsLoadingDividas] = useState(false);

  const fetchContas = useCallback(async () => {
    setIsLoadingContas(true);
    try {
      const data = await fetchAccounts();
      setContas(data);
    } finally {
      setIsLoadingContas(false);
    }
  }, [fetchAccounts]);

  const fetchDividas = useCallback(async () => {
    if (residents.length === 0) return;
    setIsLoadingDividas(true);
    try {
      const results = await Promise.all(
        residents.map((morador) =>
          calcularDividaMorador(morador.id, fetchContasPorMorador),
        ),
      );
      const map: Record<string, number> = {};
      for (const { id, total } of results) {
        map[id] = total;
      }
      setDividas(map);
    } finally {
      setIsLoadingDividas(false);
    }
  }, [residents, fetchContasPorMorador]);

  useEffect(() => {
    void fetchContas();
  }, [fetchContas]);

  useEffect(() => {
    void fetchDividas();
  }, [fetchDividas]);

  const fetchAll = useCallback(async () => {
    await Promise.all([fetchContas(), fetchDividas()]);
  }, [fetchContas, fetchDividas]);

  useEffect(() => {
    return registerRefresh(`resume-${republicId}`, fetchAll);
  }, [registerRefresh, republicId, fetchAll]);

  const contasPagas = contas.filter((c) => c.pago);
  const contasPendentes = contas.filter((c) => !c.pago);

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
