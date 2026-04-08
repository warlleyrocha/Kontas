import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook } from "@testing-library/react-native";
import React from "react";

import { getErrorMessage } from "@/src/services/httpError";
import { toast } from "@/src/shared/components/ui/sonner";
import { logger } from "@/src/shared/utils/logger";
import { showToast } from "@/src/shared/utils/showToast";

import { useAccountActions } from "../../hooks/useAccountActions";
import { accountService } from "../../services/account.service";
import { accountResidentsService } from "../../services/account-residents.service";
import {
  type CriarContaComMoradoresRequest,
  MetodoPagamento,
  StatusConta,
} from "../../types/account.types";

jest.mock("@/src/services/httpError", () => ({
  __esModule: true,
  getErrorMessage: jest.fn(),
}));

jest.mock("@/src/shared/components/ui/sonner", () => ({
  __esModule: true,
  toast: {
    custom: jest.fn(),
    dismiss: jest.fn(),
  },
}));

jest.mock("@/src/shared/utils/logger", () => ({
  __esModule: true,
  logger: {
    debug: jest.fn(),
    info: jest.fn(),
    error: jest.fn(),
    table: jest.fn(),
  },
}));

jest.mock("@/src/shared/utils/showToast", () => ({
  __esModule: true,
  showToast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

jest.mock("../../services/account.service", () => ({
  __esModule: true,
  accountService: {
    criarConta: jest.fn(),
    removerConta: jest.fn(),
    restaurarConta: jest.fn(),
    pagarConta: jest.fn(),
    listarContasPorRepublica: jest.fn(),
  },
}));

jest.mock("../../services/account-residents.service", () => ({
  __esModule: true,
  accountResidentsService: {
    vincularMoradores: jest.fn(),
    listarContasPorMorador: jest.fn(),
    confirmarPagamentoMorador: jest.fn(),
    confirmarPagamentoAdmin: jest.fn(),
    recusarPagamentoAdmin: jest.fn(),
  },
}));

jest.mock("@/src/features/auth/hooks/useAuth", () => ({
  useAuth: jest.fn(() => ({ isAuthenticated: true, user: null })),
}));

const mockGetErrorMessage = jest.mocked(getErrorMessage);
const mockToast = jest.mocked(toast);
const mockLogger = jest.mocked(logger);
const mockShowToast = jest.mocked(showToast);
const mockAccountService = jest.mocked(accountService);
const mockAccountResidentsService = jest.mocked(accountResidentsService);

function createPayload(
  overrides: Partial<CriarContaComMoradoresRequest> = {}
): CriarContaComMoradoresRequest {
  return {
    descricao: "Conta de luz",
    valor: 150,
    vencimento: "2026-03-20",
    republicaId: "republica-1",
    status: StatusConta.PENDENTE,
    metodoPagamento: MetodoPagamento.PIX,
    moradorIds: [],
    ...overrides,
  };
}

const queryClient = new QueryClient({
  defaultOptions: {
    mutations: { retry: false },
    queries: { retry: false },
  },
});

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

function loadUseAccountActionsWithPendingRefs({
  accountId = "pending-account",
  toastId = "pending-toast",
}: {
  accountId?: string;
  toastId?: string | number;
} = {}) {
  const timeoutId = setTimeout(() => {}, 1000);
  const pendingDeleteTimeouts = new Map<string, ReturnType<typeof setTimeout>>([
    [accountId, timeoutId],
  ]);
  const pendingDeleteToastIds = new Map<string, string | number>();

  if (toastId !== undefined) {
    pendingDeleteToastIds.set(accountId, toastId);
  }

  let isolatedUseAccountActions: typeof useAccountActions | undefined;
  let isolatedToast:
    | typeof import("@/src/shared/components/ui/sonner").toast
    | undefined;
  let isolatedShowToast:
    | typeof import("@/src/shared/utils/showToast").showToast
    | undefined;
  let isolatedAccountService:
    | typeof import("../../services/account.service").accountService
    | undefined;

  const stubMutation = {
    isPending: false,
    mutateAsync: jest.fn(),
  };

  jest.isolateModules(() => {
    jest.doMock("react", () => ({
      ...React,
      useRef: jest
        .fn()
        .mockReturnValueOnce({ current: pendingDeleteTimeouts })
        .mockReturnValueOnce({ current: pendingDeleteToastIds }),
    }));

    jest.doMock("../../hooks/useAccountQueries", () => ({
      useCreateAccountMutation: () => stubMutation,
      useDeleteAccountMutation: () => stubMutation,
      useRestoreAccountMutation: () => stubMutation,
      usePayAccountMutation: () => stubMutation,
    }));

    isolatedUseAccountActions = jest.requireActual(
      "../../hooks/useAccountActions"
    ).useAccountActions;
    isolatedToast = jest.requireMock("@/src/shared/components/ui/sonner").toast;
    isolatedShowToast = jest.requireMock(
      "@/src/shared/utils/showToast"
    ).showToast;
    isolatedAccountService = jest.requireMock(
      "../../services/account.service"
    ).accountService;
  });

  jest.dontMock("react");
  jest.dontMock("../../hooks/useAccountQueries");

  return {
    useAccountActions: isolatedUseAccountActions!,
    toast: isolatedToast!,
    showToast: isolatedShowToast!,
    accountService: isolatedAccountService!,
    accountId,
    timeoutId,
    pendingDeleteTimeouts,
    pendingDeleteToastIds,
  };
}

describe("useAccountActions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    queryClient.clear();
    jest.useFakeTimers();
    mockGetErrorMessage.mockReturnValue("erro tratado");
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  it("retorna os estados iniciais e permite abrir o modal", () => {
    const { result } = renderHook(() => useAccountActions(), { wrapper });

    expect(result.current.showAccountModal).toBe(false);
    expect(result.current.isSubmitting).toBe(false);
    expect(result.current.isDeleting).toBe(false);
    expect(result.current.isUpdating).toBe(false);

    act(() => {
      result.current.setShowAccountModal(true);
    });

    expect(result.current.showAccountModal).toBe(true);
  });

  it("submete uma conta sem moradores vinculados", async () => {
    const payload = createPayload();
    mockAccountService.criarConta.mockResolvedValue({
      id: "account-1",
    } as never);

    const { result } = renderHook(() => useAccountActions(), { wrapper });

    act(() => {
      result.current.setShowAccountModal(true);
    });

    await act(async () => {
      await result.current.handleSubmit(payload);
    });

    expect(mockLogger.debug).toHaveBeenCalledWith(
      "Accounts",
      "Payload de submit",
      { metodoPagamento: MetodoPagamento.PIX }
    );
    expect(mockAccountService.criarConta).toHaveBeenCalledWith({
      descricao: payload.descricao,
      valor: payload.valor,
      vencimento: payload.vencimento,
      republicaId: payload.republicaId,
      status: payload.status,
      metodoPagamento: payload.metodoPagamento,
    });
    expect(
      mockAccountResidentsService.vincularMoradores
    ).not.toHaveBeenCalled();
    expect(result.current.showAccountModal).toBe(false);
    expect(result.current.isSubmitting).toBe(false);

    act(() => {
      jest.advanceTimersByTime(300);
    });
    expect(mockShowToast.success).toHaveBeenCalledWith(
      "Conta criada com sucesso."
    );
  });

  it("submete uma conta e vincula moradores quando houver ids", async () => {
    const payload = createPayload({
      valor: 320,
      moradorIds: ["resident-1", "resident-2"],
    });
    mockAccountService.criarConta.mockResolvedValue({
      id: "account-9",
    } as never);
    mockAccountResidentsService.vincularMoradores.mockResolvedValue(
      [] as never
    );

    const { result } = renderHook(() => useAccountActions(), { wrapper });

    await act(async () => {
      await result.current.handleSubmit(payload);
    });

    expect(mockAccountResidentsService.vincularMoradores).toHaveBeenCalledWith({
      contaId: "account-9",
      moradorIds: ["resident-1", "resident-2"],
      valorTotal: 320,
    });
  });

  it("exibe erro ao falhar no submit", async () => {
    const error = new Error("falha no submit");
    mockGetErrorMessage.mockReturnValue("nao foi possivel criar");
    mockAccountService.criarConta.mockRejectedValue(error);

    const { result } = renderHook(() => useAccountActions(), { wrapper });

    await act(async () => {
      await result.current.handleSubmit(createPayload());
    });

    expect(mockGetErrorMessage).toHaveBeenCalledWith(
      error,
      "Não foi possível criar a conta."
    );
    expect(mockShowToast.error).toHaveBeenCalledWith("nao foi possivel criar");
    expect(result.current.isSubmitting).toBe(false);
  });

  it("remove a conta imediatamente", async () => {
    mockAccountService.removerConta.mockResolvedValue(undefined);

    const { result } = renderHook(() => useAccountActions(), { wrapper });

    await act(async () => {
      await result.current.handleDelete("account-2");
    });

    expect(mockAccountService.removerConta).toHaveBeenCalledWith({
      id: "account-2",
    });
    expect(mockShowToast.success).toHaveBeenCalledWith(
      "Conta removida com sucesso."
    );
    expect(result.current.isDeleting).toBe(false);
  });

  it("exibe erro ao falhar na remoção", async () => {
    const error = new Error("falha ao remover");
    mockGetErrorMessage.mockReturnValue("nao removeu");
    mockAccountService.removerConta.mockRejectedValue(error);

    const { result } = renderHook(() => useAccountActions(), { wrapper });

    await act(async () => {
      await result.current.handleDelete("account-3");
    });

    expect(mockGetErrorMessage).toHaveBeenCalledWith(
      error,
      "Não foi possível remover a conta."
    );
    expect(mockShowToast.error).toHaveBeenCalledWith("nao removeu");
    expect(result.current.isDeleting).toBe(false);
  });

  it("recupera a conta quando não há remoção pendente", async () => {
    mockAccountService.restaurarConta.mockResolvedValue(undefined);

    const { result } = renderHook(() => useAccountActions(), { wrapper });

    await act(async () => {
      await result.current.handleRecovery("account-4");
    });

    expect(mockAccountService.restaurarConta).toHaveBeenCalledWith("account-4");
    expect(mockShowToast.success).toHaveBeenCalledWith(
      "Conta recuperada com sucesso."
    );
    expect(result.current.isDeleting).toBe(false);
  });

  it("cancela a remoção pendente quando handleRecovery encontra timeout e toast", async () => {
    const clearTimeoutSpy = jest.spyOn(global, "clearTimeout");
    const {
      useAccountActions: isolatedUseAccountActions,
      toast: isolatedToast,
      showToast: isolatedShowToast,
      accountService: isolatedAccountService,
      accountId,
      timeoutId,
      pendingDeleteTimeouts,
      pendingDeleteToastIds,
    } = loadUseAccountActionsWithPendingRefs();
    const { result } = renderHook(() => isolatedUseAccountActions());

    await act(async () => {
      await result.current.handleRecovery(accountId);
    });

    expect(clearTimeoutSpy).toHaveBeenCalledWith(timeoutId);
    expect(isolatedToast.dismiss).toHaveBeenCalledWith("pending-toast");
    expect(isolatedShowToast.success).toHaveBeenCalledWith(
      "Remoção cancelada com sucesso."
    );
    expect(isolatedAccountService.restaurarConta).not.toHaveBeenCalled();
    expect(pendingDeleteTimeouts.has(accountId)).toBe(false);
    expect(pendingDeleteToastIds.has(accountId)).toBe(false);

    clearTimeoutSpy.mockRestore();
  });

  it("exibe erro ao falhar na recuperação da conta", async () => {
    const error = new Error("falha ao recuperar");
    mockGetErrorMessage.mockReturnValue("nao recuperou");
    mockAccountService.restaurarConta.mockRejectedValue(error);

    const { result } = renderHook(() => useAccountActions(), { wrapper });

    await act(async () => {
      await result.current.handleRecovery("account-5");
    });

    expect(mockGetErrorMessage).toHaveBeenCalledWith(
      error,
      "Não foi possível recuperar a conta."
    );
    expect(mockShowToast.error).toHaveBeenCalledWith("nao recuperou");
    expect(result.current.isDeleting).toBe(false);
  });

  it("marca a conta como paga com sucesso", async () => {
    mockAccountService.pagarConta.mockResolvedValue(undefined);

    const { result } = renderHook(() => useAccountActions(), { wrapper });

    await act(async () => {
      await result.current.handlePatch("account-6", MetodoPagamento.CARTAO);
    });

    expect(mockAccountService.pagarConta).toHaveBeenCalledWith({
      id: "account-6",
      metodoPagamento: MetodoPagamento.CARTAO,
    });
    expect(mockShowToast.success).toHaveBeenCalledWith(
      "Conta marcada como paga com sucesso!"
    );
    expect(result.current.isUpdating).toBe(false);
  });

  it("exibe erro inesperado ao falhar ao marcar a conta como paga", async () => {
    mockAccountService.pagarConta.mockRejectedValue("erro desconhecido");

    const { result } = renderHook(() => useAccountActions(), { wrapper });

    await act(async () => {
      await result.current.handlePatch("account-7", MetodoPagamento.DINHEIRO);
    });

    expect(mockShowToast.error).toHaveBeenCalledWith("Erro inesperado");
    expect(result.current.isUpdating).toBe(false);
  });

  it("exibe error.message quando handlePatch rejeita com instância de Error (L192)", async () => {
    mockAccountService.pagarConta.mockRejectedValue(
      new Error("falha no pagamento")
    );

    const { result } = renderHook(() => useAccountActions(), { wrapper });

    await act(async () => {
      await result.current.handlePatch("account-10", MetodoPagamento.PIX);
    });

    expect(mockShowToast.error).toHaveBeenCalledWith("falha no pagamento");
  });

  it("não dispara dismiss ao desmontar sem toasts pendentes", async () => {
    const { result, unmount } = renderHook(() => useAccountActions(), {
      wrapper,
    });

    await act(async () => {
      await result.current.handleDelete("account-8");
    });

    unmount();
    expect(mockToast.dismiss).not.toHaveBeenCalled();
  });

  it("limpa timeouts e toasts pendentes ao desmontar", () => {
    const clearTimeoutSpy = jest.spyOn(global, "clearTimeout");
    const {
      useAccountActions: isolatedUseAccountActions,
      toast: isolatedToast,
      timeoutId,
    } = loadUseAccountActionsWithPendingRefs();
    const { unmount } = renderHook(() => isolatedUseAccountActions());

    unmount();

    expect(clearTimeoutSpy).toHaveBeenCalledWith(timeoutId);
    expect(isolatedToast.dismiss).toHaveBeenCalledWith("pending-toast");

    clearTimeoutSpy.mockRestore();
  });

  it("cancela remoção pendente sem chamar dismiss quando não há toastId", async () => {
    const clearTimeoutSpy = jest.spyOn(global, "clearTimeout");
    const {
      useAccountActions: isolatedUseAccountActions,
      toast: isolatedToast,
      showToast: isolatedShowToast,
      accountService: isolatedAccountService,
      accountId,
      timeoutId,
      pendingDeleteTimeouts,
      pendingDeleteToastIds,
    } = loadUseAccountActionsWithPendingRefs();

    pendingDeleteToastIds.delete(accountId);

    const { result } = renderHook(() => isolatedUseAccountActions());

    await act(async () => {
      await result.current.handleRecovery(accountId);
    });

    expect(clearTimeoutSpy).toHaveBeenCalledWith(timeoutId);
    expect(isolatedToast.dismiss).not.toHaveBeenCalled();
    expect(isolatedShowToast.success).toHaveBeenCalledWith(
      "Remoção cancelada com sucesso."
    );
    expect(isolatedAccountService.restaurarConta).not.toHaveBeenCalled();
    expect(pendingDeleteTimeouts.has(accountId)).toBe(false);
    expect(pendingDeleteToastIds.has(accountId)).toBe(false);

    clearTimeoutSpy.mockRestore();
  });
});
