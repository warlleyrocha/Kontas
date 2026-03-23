import type { ReactElement } from "react";
import { act, renderHook } from "@testing-library/react-native";
import { getErrorMessage } from "@/src/services/httpError";
import { toast } from "@/src/shared/components/ui/sonner";
import { logger } from "@/src/shared/utils/logger";
import { showToast } from "@/src/shared/utils/showToast";
import { AccountRecoveryToast } from "../components";
import { useAccountActions } from "../hooks/useAccountActions";
import { accountResidentsService } from "../services/account-residents.service";
import { accountService } from "../services/account.service";
import {
  MetodoPagamento,
  StatusConta,
  type CriarContaComMoradoresRequest,
} from "../types/account.types";

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

jest.mock("../components", () => ({
  __esModule: true,
  AccountRecoveryToast: jest.fn(() => null),
}));

jest.mock("../services/account.service", () => ({
  __esModule: true,
  accountService: {
    criarConta: jest.fn(),
    removerConta: jest.fn(),
    restaurarConta: jest.fn(),
    pagarConta: jest.fn(),
  },
}));

jest.mock("../services/account-residents.service", () => ({
  __esModule: true,
  accountResidentsService: {
    vincularMoradores: jest.fn(),
    listarContasPorMorador: jest.fn(),
  },
}));

const mockGetErrorMessage = jest.mocked(getErrorMessage);
const mockToast = jest.mocked(toast);
const mockLogger = jest.mocked(logger);
const mockShowToast = jest.mocked(showToast);
const mockAccountService = jest.mocked(accountService);
const mockAccountResidentsService = jest.mocked(accountResidentsService);
const mockAccountRecoveryToast = jest.mocked(AccountRecoveryToast);

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

async function flushAsyncWork() {
  await Promise.resolve();
  await Promise.resolve();
}

async function advanceRecoveryWindow() {
  await act(async () => {
    jest.advanceTimersByTime(10_000);
    await flushAsyncWork();
  });
}

describe("useAccountActions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    mockToast.custom.mockReturnValue("toast-id");
    mockGetErrorMessage.mockReturnValue("erro tratado");
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  it("retorna os estados iniciais e permite abrir o modal", () => {
    const { result } = renderHook(() => useAccountActions());

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
    const onRefresh = jest.fn();
    const payload = createPayload();
    mockAccountService.criarConta.mockResolvedValue({
      id: "account-1",
    } as never);

    const { result } = renderHook(() => useAccountActions({ onRefresh }));

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
    expect(mockAccountResidentsService.vincularMoradores).not.toHaveBeenCalled();
    expect(mockShowToast.success).toHaveBeenCalledWith(
      "Conta criada com sucesso."
    );
    expect(onRefresh).toHaveBeenCalledTimes(1);
    expect(result.current.showAccountModal).toBe(false);
    expect(result.current.isSubmitting).toBe(false);
  });

  it("submete uma conta e vincula moradores quando houver ids", async () => {
    const payload = createPayload({
      valor: 320,
      moradorIds: ["resident-1", "resident-2"],
    });
    mockAccountService.criarConta.mockResolvedValue({
      id: "account-9",
    } as never);
    mockAccountResidentsService.vincularMoradores.mockResolvedValue([] as never);

    const { result } = renderHook(() => useAccountActions());

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
    const onRefresh = jest.fn();
    const error = new Error("falha no submit");
    mockGetErrorMessage.mockReturnValue("nao foi possivel criar");
    mockAccountService.criarConta.mockRejectedValue(error);

    const { result } = renderHook(() => useAccountActions({ onRefresh }));

    await act(async () => {
      await result.current.handleSubmit(createPayload());
    });

    expect(mockGetErrorMessage).toHaveBeenCalledWith(
      error,
      "Não foi possível criar a conta."
    );
    expect(mockShowToast.error).toHaveBeenCalledWith("nao foi possivel criar");
    expect(onRefresh).not.toHaveBeenCalled();
    expect(result.current.isSubmitting).toBe(false);
  });

  it("cria o toast de recuperação uma única vez e cancela a remoção ao recuperar", async () => {
    const { result } = renderHook(() => useAccountActions());

    await act(async () => {
      await result.current.handleDelete("account-1");
      await result.current.handleDelete("account-1");
    });

    expect(mockToast.custom).toHaveBeenCalledTimes(1);
    expect(mockToast.custom.mock.calls[0]?.[1]).toEqual({ duration: 10_000 });

    const recoveryToast = mockToast.custom.mock.calls[0]?.[0] as ReactElement<{
      message: string;
      onRecover: () => void;
      durationMs: number;
    }>;

    expect(recoveryToast.props).toMatchObject({
      message: "Conta apagada",
      durationMs: 10_000,
    });

    await act(async () => {
      recoveryToast.props.onRecover();
      await flushAsyncWork();
    });

    await advanceRecoveryWindow();

    expect(mockToast.dismiss).toHaveBeenCalledWith("toast-id");
    expect(mockAccountService.removerConta).not.toHaveBeenCalled();
    expect(mockAccountService.restaurarConta).not.toHaveBeenCalled();
    expect(mockShowToast.success).toHaveBeenCalledWith(
      "Remoção cancelada com sucesso."
    );
    expect(mockAccountRecoveryToast).not.toHaveBeenCalled();
  });

  it("remove a conta após o timeout de recuperação", async () => {
    const onRefresh = jest.fn();
    mockAccountService.removerConta.mockResolvedValue(undefined);

    const { result } = renderHook(() => useAccountActions({ onRefresh }));

    await act(async () => {
      await result.current.handleDelete("account-2");
    });

    await advanceRecoveryWindow();

    expect(mockAccountService.removerConta).toHaveBeenCalledWith({
      id: "account-2",
    });
    expect(mockToast.dismiss).toHaveBeenCalledWith("toast-id");
    expect(mockShowToast.success).toHaveBeenCalledWith(
      "Conta removida com sucesso."
    );
    expect(onRefresh).toHaveBeenCalledTimes(1);
    expect(result.current.isDeleting).toBe(false);
  });

  it("exibe erro ao falhar na remoção após o timeout", async () => {
    const onRefresh = jest.fn();
    const error = new Error("falha ao remover");
    mockGetErrorMessage.mockReturnValue("nao removeu");
    mockAccountService.removerConta.mockRejectedValue(error);

    const { result } = renderHook(() => useAccountActions({ onRefresh }));

    await act(async () => {
      await result.current.handleDelete("account-3");
    });

    await advanceRecoveryWindow();

    expect(mockGetErrorMessage).toHaveBeenCalledWith(
      error,
      "Não foi possível remover a conta."
    );
    expect(mockShowToast.error).toHaveBeenCalledWith("nao removeu");
    expect(onRefresh).not.toHaveBeenCalled();
    expect(result.current.isDeleting).toBe(false);
  });

  it("recupera a conta quando não há remoção pendente", async () => {
    const onRefresh = jest.fn();
    mockAccountService.restaurarConta.mockResolvedValue(undefined);

    const { result } = renderHook(() => useAccountActions({ onRefresh }));

    await act(async () => {
      await result.current.handleRecovery("account-4");
    });

    expect(mockAccountService.restaurarConta).toHaveBeenCalledWith("account-4");
    expect(mockShowToast.success).toHaveBeenCalledWith(
      "Conta recuperada com sucesso."
    );
    expect(onRefresh).toHaveBeenCalledTimes(1);
    expect(result.current.isDeleting).toBe(false);
  });

  it("exibe erro ao falhar na recuperação da conta", async () => {
    const error = new Error("falha ao recuperar");
    mockGetErrorMessage.mockReturnValue("nao recuperou");
    mockAccountService.restaurarConta.mockRejectedValue(error);

    const { result } = renderHook(() => useAccountActions());

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

    const { result } = renderHook(() => useAccountActions());

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

    const { result } = renderHook(() => useAccountActions());

    await act(async () => {
      await result.current.handlePatch("account-7", MetodoPagamento.DINHEIRO);
    });

    expect(mockShowToast.error).toHaveBeenCalledWith("Erro inesperado");
    expect(result.current.isUpdating).toBe(false);
  });

  it("exibe error.message quando handlePatch rejeita com instância de Error (L192)", async () => {
    mockAccountService.pagarConta.mockRejectedValue(new Error("falha no pagamento"));

    const { result } = renderHook(() => useAccountActions());

    await act(async () => {
      await result.current.handlePatch("account-10", MetodoPagamento.PIX);
    });

    expect(mockShowToast.error).toHaveBeenCalledWith("falha no pagamento");
  });

  it("não chama toast.dismiss quando toastId é undefined em handleRecovery (L109)", async () => {
    mockToast.custom.mockReturnValue(undefined as any);

    const { result } = renderHook(() => useAccountActions());

    await act(async () => {
      await result.current.handleDelete("account-11");
    });

    await act(async () => {
      await result.current.handleRecovery("account-11");
    });

    expect(mockToast.dismiss).not.toHaveBeenCalled();
    expect(mockShowToast.success).toHaveBeenCalledWith("Remoção cancelada com sucesso.");
  });

  it("não chama toast.dismiss quando toastId é undefined no callback do setTimeout (L144)", async () => {
    mockToast.custom.mockReturnValue(undefined as any);
    mockAccountService.removerConta.mockResolvedValue(undefined);

    const { result } = renderHook(() => useAccountActions());

    await act(async () => {
      await result.current.handleDelete("account-12");
    });

    await advanceRecoveryWindow();

    expect(mockToast.dismiss).not.toHaveBeenCalled();
    expect(mockAccountService.removerConta).toHaveBeenCalledWith({ id: "account-12" });
  });

  it("busca contas por morador", async () => {
    const contas = [
      {
        id: "resident-account-1",
        contaId: "account-1",
      },
    ];
    mockAccountResidentsService.listarContasPorMorador.mockResolvedValue(
      contas as never
    );

    const { result } = renderHook(() => useAccountActions());

    let response;
    await act(async () => {
      response = await result.current.fetchContasPorMorador("resident-9");
    });

    expect(mockAccountResidentsService.listarContasPorMorador).toHaveBeenCalledWith(
      "resident-9"
    );
    expect(response).toEqual(contas);
  });

  it("limpa timeouts e toasts pendentes ao desmontar o hook", async () => {
    const { result, unmount } = renderHook(() => useAccountActions());

    await act(async () => {
      await result.current.handleDelete("account-8");
    });

    unmount();

    await advanceRecoveryWindow();

    expect(mockToast.dismiss).toHaveBeenCalledWith("toast-id");
    expect(mockAccountService.removerConta).not.toHaveBeenCalled();
  });
});
