import {
  keepPreviousData,
  useMutation,
  useQueries,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { useAuth } from "@/src/features/auth/hooks/useAuth";
import { accountService } from "../services/account.service";
import { accountResidentsService } from "../services/account-residents.service";
import type {
  Conta,
  CriarContaComMoradoresRequest,
  MarcarContaPaga,
} from "../types/account.types";
import type { ContaMorador, MoradorCustomizado } from "../types/accountResidents.types";
import { accountKeys } from "./account.keys";
import { accountResidentKeys } from "./accountResident.keys";

const ACCOUNT_QUERY_STALE_TIME_MS = 60_000;

interface AccountResidentsQueryResult {
  data: ContaMorador[][];
  isLoading: boolean;
  isFetching: boolean;
  errors: (Error | null)[];
}

interface AccountsByResidentQueryResult {
  data: ContaMorador[][];
  isLoading: boolean;
  isFetching: boolean;
  errors: (Error | null)[];
}

function findAccountInCache(
  queryClient: ReturnType<typeof useQueryClient>,
  accountId: string
): string | undefined {
  const queries = queryClient.getQueriesData<Conta[]>({
    queryKey: accountKeys.all,
  });

  for (const [, data] of queries) {
    const account = (data ?? []).find((a) => a.id === accountId);
    if (account) {
      return account.republicaId;
    }
  }

  return undefined;
}

async function invalidateAccountFeatureQueries(
  queryClient: ReturnType<typeof useQueryClient>,
  republicId?: string
) {
  await Promise.all([
    republicId
      ? queryClient.invalidateQueries({
          queryKey: accountKeys.byRepublic(republicId),
        })
      : queryClient.invalidateQueries({ queryKey: accountKeys.all }),
    republicId
      ? queryClient.invalidateQueries({
          queryKey: accountResidentKeys.byRepublic(republicId),
        })
      : queryClient.invalidateQueries({ queryKey: accountResidentKeys.all }),
  ]);
}

export function useAccountsByRepublicQuery(republicId: string) {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: accountKeys.byRepublic(republicId),
    queryFn: () => accountService.listarContasPorRepublica(republicId),
    enabled: isAuthenticated && Boolean(republicId),
    staleTime: ACCOUNT_QUERY_STALE_TIME_MS,
    placeholderData: keepPreviousData,
  });
}

export function useAccountResidentsByAccountQueries(
  republicId: string,
  accountIds: string[]
) {
  const { isAuthenticated } = useAuth();

  return useQueries({
    queries: accountIds.map((accountId) => ({
      queryKey: accountResidentKeys.byAccount(republicId, accountId),
      queryFn: () => accountResidentsService.listarContasMoradores(accountId),
      enabled: isAuthenticated && Boolean(accountId),
      staleTime: ACCOUNT_QUERY_STALE_TIME_MS,
      placeholderData: keepPreviousData,
    })),
    combine: (results): AccountResidentsQueryResult => ({
      data: results.map((r) => r.data ?? []),
      isLoading: results.some((r) => r.isLoading),
      isFetching: results.some((r) => r.isFetching),
      errors: results.map((r) => r.error),
    }),
  });
}

export function useAccountsByResidentQueries(
  republicId: string,
  moradorIds: string[]
) {
  const { isAuthenticated } = useAuth();

  return useQueries({
    queries: moradorIds.map((moradorId) => ({
      queryKey: accountResidentKeys.byResident(republicId, moradorId),
      queryFn: () => accountResidentsService.listarContasPorMorador(moradorId),
      enabled: isAuthenticated && Boolean(moradorId),
      staleTime: ACCOUNT_QUERY_STALE_TIME_MS,
      placeholderData: keepPreviousData,
    })),
    combine: (results): AccountsByResidentQueryResult => ({
      data: results.map((r) => r.data ?? []),
      isLoading: results.some((r) => r.isLoading),
      isFetching: results.some((r) => r.isFetching),
      errors: results.map((r) => r.error),
    }),
  });
}

export function useCreateAccountMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      data: CriarContaComMoradoresRequest
    ): Promise<Conta & { moradores: { igual: string[]; customizados: MoradorCustomizado[] } }> => {
      const { moradores, ...contaPayload } = data;
      const conta = await accountService.criarConta(contaPayload);

      const temDivisaoIgual = moradores.igual.length > 0;
      const temDivisaoCustomizada = moradores.customizados.length > 0;

      if (temDivisaoIgual || temDivisaoCustomizada) {
        await accountResidentsService.vincularMoradores({
          contaId: conta.id,
          valorTotal: contaPayload.valor,
          ...(temDivisaoIgual && { moradorIds: moradores.igual }),
          ...(temDivisaoCustomizada && { moradoresCustomizados: moradores.customizados }),
        });
      }

      return { ...conta, moradores };
    },
    onSuccess: async ({ republicaId }) => {
      await invalidateAccountFeatureQueries(queryClient, republicaId);
    },
  });
}

export function useDeleteAccountMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (accountId: string) => {
      const republicId = findAccountInCache(queryClient, accountId);

      await accountService.removerConta({ id: accountId });

      return { accountId, republicId };
    },
    onSuccess: async ({ republicId }) => {
      await invalidateAccountFeatureQueries(queryClient, republicId);
    },
  });
}

export function useRestoreAccountMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (accountId: string) => {
      const republicId = findAccountInCache(queryClient, accountId);

      await accountService.restaurarConta(accountId);

      return { republicId };
    },
    onSuccess: async ({ republicId }) => {
      await invalidateAccountFeatureQueries(queryClient, republicId);
    },
  });
}

export function usePayAccountMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      accountId,
      metodoPagamento,
    }: {
      accountId: string;
      metodoPagamento: MarcarContaPaga["metodoPagamento"];
    }) => {
      const republicId = findAccountInCache(queryClient, accountId);

      await accountService.pagarConta({
        id: accountId,
        metodoPagamento,
      });

      return { republicId };
    },
    onSuccess: async ({ republicId }) => {
      await invalidateAccountFeatureQueries(queryClient, republicId);
    },
  });
}

export function useConfirmResidentPaymentMutation() {
  const queryClient = useQueryClient();

  return useMutation<
    void,
    unknown,
    { accountId: string; accountResidentId: string }
  >({
    mutationFn: async ({ accountResidentId }) => {
      await accountResidentsService.confirmarPagamentoMorador({
        id: accountResidentId,
      });
    },
    onSuccess: async (_data, { accountId }) => {
      const republicId = findAccountInCache(queryClient, accountId);
      await invalidateAccountFeatureQueries(queryClient, republicId);
    },
  });
}

export function useConfirmResidentPaymentAdminMutation() {
  const queryClient = useQueryClient();

  return useMutation<
    ContaMorador,
    unknown,
    { accountId: string; accountResidentId: string }
  >({
    mutationFn: async ({ accountResidentId }) => {
      return accountResidentsService.confirmarPagamentoAdmin({
        id: accountResidentId,
      });
    },
    onSuccess: async (_data, { accountId }) => {
      const republicId = findAccountInCache(queryClient, accountId);
      await invalidateAccountFeatureQueries(queryClient, republicId);
    },
  });
}

export function useRefuseResidentPaymentAdminMutation() {
  const queryClient = useQueryClient();

  return useMutation<
    ContaMorador,
    unknown,
    { accountId: string; accountResidentId: string }
  >({
    mutationFn: async ({ accountResidentId }) => {
      return accountResidentsService.recusarPagamentoAdmin({
        id: accountResidentId,
      });
    },
    onSuccess: async (_data, { accountId }) => {
      const republicId = findAccountInCache(queryClient, accountId);
      await invalidateAccountFeatureQueries(queryClient, republicId);
    },
  });
}
