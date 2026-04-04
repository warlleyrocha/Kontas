import {
  useMutation,
  useQueries,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { useCurrentUserQuery } from "@/src/features/user/hooks/useUserQueries";
import { accountService } from "../services/account.service";
import { accountResidentsService } from "../services/account-residents.service";
import type {
  Conta,
  CriarContaComMoradoresRequest,
  MarcarContaPaga,
} from "../types/account.types";
import { accountKeys } from "./account.keys";
import { accountResidentKeys } from "./accountResident.keys";

const ACCOUNT_QUERY_STALE_TIME_MS = 60_000;

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

function useIsAuthenticated() {
  const { data: user = null } = useCurrentUserQuery();
  return Boolean(user);
}

export function useAccountsByRepublicQuery(republicId: string) {
  const isAuthenticated = useIsAuthenticated();

  return useQuery({
    queryKey: accountKeys.byRepublic(republicId),
    queryFn: () => accountService.listarContasPorRepublica(republicId),
    enabled: isAuthenticated && Boolean(republicId),
    staleTime: ACCOUNT_QUERY_STALE_TIME_MS,
  });
}

export function useAccountResidentsByAccountQueries(accountIds: string[]) {
  const isAuthenticated = useIsAuthenticated();

  return useQueries({
    queries: accountIds.map((accountId) => ({
      queryKey: accountResidentKeys.byAccount(accountId),
      queryFn: () => accountResidentsService.listarContasMoradores(accountId),
      enabled: isAuthenticated && Boolean(accountId),
      staleTime: ACCOUNT_QUERY_STALE_TIME_MS,
    })),
  });
}

export function useAccountsByResidentQueries(moradorIds: string[]) {
  const isAuthenticated = useIsAuthenticated();

  return useQueries({
    queries: moradorIds.map((moradorId) => ({
      queryKey: accountResidentKeys.byResident(moradorId),
      queryFn: () => accountResidentsService.listarContasPorMorador(moradorId),
      enabled: isAuthenticated && Boolean(moradorId),
      staleTime: ACCOUNT_QUERY_STALE_TIME_MS,
    })),
  });
}

export function useCreateAccountMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CriarContaComMoradoresRequest): Promise<Conta> => {
      const { moradorIds, ...contaPayload } = data;
      const conta = await accountService.criarConta(contaPayload);

      if (moradorIds.length > 0) {
        await accountResidentsService.vincularMoradores({
          contaId: conta.id,
          moradorIds,
          valorTotal: contaPayload.valor,
        });
      }

      return conta;
    },
    onSuccess: async (conta) => {
      await invalidateAccountFeatureQueries(queryClient, conta.republicaId);
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
