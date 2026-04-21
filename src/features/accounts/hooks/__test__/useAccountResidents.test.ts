import { act, renderHook } from "@testing-library/react-native";
import { accountResidentsService } from "@/src/features/accounts/services/account-residents.service";
import { getErrorMessage } from "@/src/services/httpError";
import { useRefresh } from "@/src/shared/contexts/RefreshContext";
import { showToast } from "@/src/shared/utils/showToast";
import type { Conta } from "../../types/account.types";
import type { ContaMorador } from "../../types/accountResidents.types";
import { useAccountResidents } from "../useAccountResidents";

jest.mock("@/src/shared/contexts/RefreshContext", () => ({
  useRefresh: jest.fn(),
}));
jest.mock("@/src/shared/utils/showToast", () => ({
  showToast: { success: jest.fn(), error: jest.fn() },
}));
jest.mock("@/src/services/httpError", () => ({
  getErrorMessage: jest.fn(),
}));
jest.mock("@/src/features/accounts/services/account-residents.service", () => ({
  accountResidentsService: {
    confirmarPagamentoMorador: jest.fn(),
  },
}));

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const mockRefreshAll = jest.fn();
const mockFetchAccountResidents = jest.fn();

const mockConta = (id: string): Conta => ({
  id,
  descricao: `Conta ${id}`,
  valor: 100,
  vencimento: "2026-01-01",
  status: "PENDENTE" as any,
  republicaId: "rep-1",
  criadoPorId: "u-1",
  criadoPorNome: "Admin",
  metodoPagamento: null,
  pago: false,
  criadoEm: "2026-01-01",
  atualizadoEm: "2026-01-01",
});

const mockContaMorador = (id: string): ContaMorador => ({
  id,
  contaId: "acc-1",
  moradorId: "res-1",
  moradorNome: "Ana",
  status: "PENDENTE" as any,
  valor: 50,
  visivel: true,
  pagoEm: null,
  metodoPagamento: null,
  criadoEm: "2026-01-01",
  atualizadoEm: "2026-01-01",
});

// ─── Setup ────────────────────────────────────────────────────────────────────

let consoleErrorSpy: jest.SpyInstance;

beforeEach(() => {
  jest.clearAllMocks();
  jest.mocked(useRefresh).mockReturnValue({
    refreshAll: mockRefreshAll,
    refreshing: false,
    onRefresh: jest.fn(),
    registerRefresh: jest.fn(),
  } as any);
  jest
    .mocked(getErrorMessage)
    .mockImplementation((_err, fallback) => fallback ?? "erro");

  consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  expect(consoleErrorSpy).not.toHaveBeenCalled();
  consoleErrorSpy.mockRestore();
});

function renderResidents() {
  return renderHook(() =>
    useAccountResidents({ fetchAccountResidents: mockFetchAccountResidents })
  );
}

// ─── useAccountResidents ──────────────────────────────────────────────────────

describe("useAccountResidents — estado inicial", () => {
  it("todos os mapas começam vazios", () => {
    const { result } = renderResidents();
    expect(result.current.accountResidentsById).toEqual({});
    expect(result.current.loadingResidentsById).toEqual({});
    expect(result.current.errorResidentsById).toEqual({});
    expect(result.current.updatingResidentById).toEqual({});
  });

  it("expõe loadResidents e confirmResidentPayment como funções", () => {
    const { result } = renderResidents();
    expect(typeof result.current.loadResidents).toBe("function");
    expect(typeof result.current.confirmResidentPayment).toBe("function");
  });
});

describe("useAccountResidents — loadResidents", () => {
  it("reseta os mapas e retorna imediatamente quando lista de contas é vazia", async () => {
    const { result } = renderResidents();
    await act(async () => {
      await result.current.loadResidents([]);
    });
    expect(result.current.accountResidentsById).toEqual({});
    expect(result.current.loadingResidentsById).toEqual({});
    expect(result.current.errorResidentsById).toEqual({});
    expect(mockFetchAccountResidents).not.toHaveBeenCalled();
  });

  it("busca os moradores de cada conta em paralelo", async () => {
    const moradores = [mockContaMorador("cm-1")];
    mockFetchAccountResidents.mockResolvedValue(moradores);
    const contas = [mockConta("acc-1"), mockConta("acc-2")];

    const { result } = renderResidents();
    await act(async () => {
      await result.current.loadResidents(contas);
    });

    expect(mockFetchAccountResidents).toHaveBeenCalledTimes(2);
    expect(mockFetchAccountResidents).toHaveBeenCalledWith("acc-1");
    expect(mockFetchAccountResidents).toHaveBeenCalledWith("acc-2");
  });

  it("preenche accountResidentsById com moradores de contas bem-sucedidas", async () => {
    const moradores = [mockContaMorador("cm-1")];
    mockFetchAccountResidents.mockResolvedValue(moradores);
    const contas = [mockConta("acc-1")];

    const { result } = renderResidents();
    await act(async () => {
      await result.current.loadResidents(contas);
    });

    expect(result.current.accountResidentsById).toEqual({ "acc-1": moradores });
  });

  it("limpa loadingResidentsById após o carregamento", async () => {
    mockFetchAccountResidents.mockResolvedValue([]);
    const contas = [mockConta("acc-1")];

    const { result } = renderResidents();
    await act(async () => {
      await result.current.loadResidents(contas);
    });

    expect(result.current.loadingResidentsById).toEqual({});
  });

  it("preenche errorResidentsById para contas com falha", async () => {
    mockFetchAccountResidents.mockRejectedValue(new Error("fail"));
    const contas = [mockConta("acc-1")];

    const { result } = renderResidents();
    await act(async () => {
      await result.current.loadResidents(contas);
    });

    expect(result.current.errorResidentsById).toEqual({ "acc-1": true });
  });

  it("separa corretamente sucessos e falhas em carga parcial", async () => {
    mockFetchAccountResidents
      .mockResolvedValueOnce([mockContaMorador("cm-1")]) // acc-1 ok
      .mockRejectedValueOnce(new Error("fail")); // acc-2 falha

    const contas = [mockConta("acc-1"), mockConta("acc-2")];

    const { result } = renderResidents();
    await act(async () => {
      await result.current.loadResidents(contas);
    });

    expect(result.current.accountResidentsById["acc-1"]).toHaveLength(1);
    expect(result.current.errorResidentsById["acc-2"]).toBe(true);
    expect(result.current.accountResidentsById["acc-2"]).toBeUndefined();
  });
});

describe("useAccountResidents — confirmResidentPayment", () => {
  it("confirma o pagamento e atualiza os moradores da conta", async () => {
    const updatedMoradores = [mockContaMorador("cm-updated")];
    jest
      .mocked(accountResidentsService.confirmarPagamentoMorador)
      .mockResolvedValue(undefined as any);
    mockFetchAccountResidents.mockResolvedValue(updatedMoradores);
    mockRefreshAll.mockResolvedValue(undefined);

    const { result } = renderResidents();
    await act(async () => {
      await result.current.confirmResidentPayment("acc-1", "res-1");
    });

    expect(
      jest.mocked(accountResidentsService.confirmarPagamentoMorador)
    ).toHaveBeenCalledWith({ id: "res-1" });
    expect(mockFetchAccountResidents).toHaveBeenCalledWith("acc-1");
    expect(result.current.accountResidentsById["acc-1"]).toEqual(
      updatedMoradores
    );
  });

  it("chama refreshAll após confirmar pagamento com sucesso", async () => {
    jest
      .mocked(accountResidentsService.confirmarPagamentoMorador)
      .mockResolvedValue(undefined as any);
    mockFetchAccountResidents.mockResolvedValue([]);
    mockRefreshAll.mockResolvedValue(undefined);

    const { result } = renderResidents();
    await act(async () => {
      await result.current.confirmResidentPayment("acc-1", "res-1");
    });

    expect(mockRefreshAll).toHaveBeenCalledTimes(1);
  });

  it("exibe toast de sucesso após confirmar pagamento", async () => {
    jest
      .mocked(accountResidentsService.confirmarPagamentoMorador)
      .mockResolvedValue(undefined as any);
    mockFetchAccountResidents.mockResolvedValue([]);
    mockRefreshAll.mockResolvedValue(undefined);

    const { result } = renderResidents();
    await act(async () => {
      await result.current.confirmResidentPayment("acc-1", "res-1");
    });

    expect(jest.mocked(showToast.success)).toHaveBeenCalledWith(
      "Pagamento enviado para confirmação"
    );
  });

  it("exibe toast de erro quando o serviço falha", async () => {
    const error = new Error("fail");
    jest
      .mocked(accountResidentsService.confirmarPagamentoMorador)
      .mockRejectedValue(error);
    jest
      .mocked(getErrorMessage)
      .mockReturnValue("Não foi possível confirmar pagamento do morador.");

    const { result } = renderResidents();
    await act(async () => {
      await result.current.confirmResidentPayment("acc-1", "res-1");
    });

    expect(jest.mocked(showToast.error)).toHaveBeenCalledWith(
      "Não foi possível confirmar pagamento do morador."
    );
  });

  it("remove o residente de updatingResidentById ao finalizar (sucesso)", async () => {
    jest
      .mocked(accountResidentsService.confirmarPagamentoMorador)
      .mockResolvedValue(undefined as any);
    mockFetchAccountResidents.mockResolvedValue([]);
    mockRefreshAll.mockResolvedValue(undefined);

    const { result } = renderResidents();
    await act(async () => {
      await result.current.confirmResidentPayment("acc-1", "res-1");
    });

    expect(result.current.updatingResidentById["res-1"]).toBeUndefined();
  });

  it("remove o residente de updatingResidentById ao finalizar (erro)", async () => {
    jest
      .mocked(accountResidentsService.confirmarPagamentoMorador)
      .mockRejectedValue(new Error("fail"));

    const { result } = renderResidents();
    await act(async () => {
      await result.current.confirmResidentPayment("acc-1", "res-1");
    });

    expect(result.current.updatingResidentById["res-1"]).toBeUndefined();
  });

  it("bloqueia segunda chamada simultânea para o mesmo residente", async () => {
    let resolveFirst!: (value?: unknown) => void;
    jest
      .mocked(accountResidentsService.confirmarPagamentoMorador)
      .mockImplementation(
        () =>
          new Promise<any>((resolve) => {
            resolveFirst = resolve;
          })
      );

    const { result } = renderResidents();

    // Inicia a primeira chamada (fica suspensa no serviço)
    act(() => {
      void result.current.confirmResidentPayment("acc-1", "res-1");
    });

    // Neste ponto, updatingResidentById["res-1"] = true (set síncrono antes do await)
    // Segunda chamada deve ser bloqueada pelo guard
    await act(async () => {
      await result.current.confirmResidentPayment("acc-1", "res-1");
    });

    expect(
      jest.mocked(accountResidentsService.confirmarPagamentoMorador)
    ).toHaveBeenCalledTimes(1);

    // Libera a primeira promise para não deixar tarefas pendentes
    mockFetchAccountResidents.mockResolvedValue([]);
    mockRefreshAll.mockResolvedValue(undefined);
    await act(async () => {
      resolveFirst();
    });
  });
});
