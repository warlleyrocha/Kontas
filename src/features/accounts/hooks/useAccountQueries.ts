import {
  useMutation,
  useQueries,
  useQuery,
  keepPreviousData,
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
import type { ContaMorador } from "../types/accountResidents.types";
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
    queryClient.invalidateQueries({ queryKey: accountResidentKeys.all }),
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

export function useAccountResidentsByAccountQueries(accountIds: string[]) {
  const { isAuthenticated } = useAuth();

  return useQueries({
    queries: accountIds.map((accountId) => ({
      queryKey: accountResidentKeys.byAccount(accountId),
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

export function useAccountsByResidentQueries(moradorIds: string[]) {
  const { isAuthenticated } = useAuth();

  return useQueries({
    queries: moradorIds.map((moradorId) => ({
      queryKey: accountResidentKeys.byResident(moradorId),
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
    ): Promise<Conta & { moradorIds: string[] }> => {
      const { moradorIds, ...contaPayload } = data;
      const conta = await accountService.criarConta(contaPayload);

      if (moradorIds.length > 0) {
        await accountResidentsService.vincularMoradores({
          contaId: conta.id,
          moradorIds,
          valorTotal: contaPayload.valor,
        });
      }

      return { ...conta, moradorIds };
    },
    onSuccess: async ({ republicaId, moradorIds, id: contaId }) => {
      await Promise.all([
        invalidateAccountFeatureQueries(queryClient, republicaId),
        queryClient.invalidateQueries({
          queryKey: accountResidentKeys.byAccount(contaId),
        }),
        ...moradorIds.map((moradorId) =>
          queryClient.invalidateQueries({
            queryKey: accountResidentKeys.byResident(moradorId),
          })
        ),
      ]);
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

  return useMutation({
    mutationFn: async ({
      accountResidentId,
    }: {
      accountId: string;
      accountResidentId: string;
    }) => {
      await accountResidentsService.confirmarPagamentoMorador({
        id: accountResidentId,
      });
    },
    onSuccess: async () => {
      await invalidateAccountFeatureQueries(queryClient);
    },
  });
}

export function useConfirmResidentPaymentAdminMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      accountResidentId,
    }: {
      accountId: string;
      accountResidentId: string;
    }) => {
      return accountResidentsService.confirmarPagamentoAdmin({
        id: accountResidentId,
      });
    },
    onSuccess: async () => {
      await invalidateAccountFeatureQueries(queryClient);
    },
  });
}

export function useRefuseResidentPaymentAdminMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      accountResidentId,
    }: {
      accountId: string;
      accountResidentId: string;
    }) => {
      return accountResidentsService.recusarPagamentoAdmin({
        id: accountResidentId,
      });
    },
    onSuccess: async () => {
      await invalidateAccountFeatureQueries(queryClient);
    },
  });
}
