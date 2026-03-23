import { act, renderHook } from "@testing-library/react-native";
import { accountService } from "@/src/features/accounts/services/account.service";
import { accountResidentsService } from "@/src/features/accounts/services/account-residents.service";
import { getErrorMessage } from "@/src/services/httpError";
import { showToast } from "@/src/shared/utils/showToast";
import type { Conta } from "../../types/account.types";
import type { ContaMorador } from "../../types/accountResidents.types";
import { useAccountData } from "../useAccountList/useAccountData";

jest.mock("@/src/features/accounts/services/account.service", () => ({
  accountService: { listarContasPorRepublica: jest.fn() },
}));
jest.mock(
  "@/src/features/accounts/services/account-residents.service",
  () => ({
    accountResidentsService: { listarContasMoradores: jest.fn() },
  })
);
jest.mock("@/src/services/httpError", () => ({
  getErrorMessage: jest.fn(),
}));
jest.mock("@/src/shared/utils/showToast", () => ({
  showToast: { success: jest.fn(), error: jest.fn() },
}));

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const mockConta: Conta = {
  id: "acc-1",
  descricao: "Aluguel",
  valor: 1200,
  vencimento: "2026-03-10T12:00:00",
  status: "PENDENTE" as any,
  republicaId: "rep-1",
  criadoPorId: "u-1",
  criadoPorNome: "Admin",
  metodoPagamento: null,
  pago: false,
  criadoEm: "2026-01-01",
  atualizadoEm: "2026-01-01",
};

const mockContaMorador: ContaMorador = {
  id: "cm-1",
  contaId: "acc-1",
  moradorId: "res-1",
  moradorNome: "Ana",
  status: "PENDENTE" as any,
  valor: 600,
  visivel: true,
  pagoEm: null,
  metodoPagamento: null,
  criadoEm: "2026-01-01",
  atualizadoEm: "2026-01-01",
};

// ─── Setup ────────────────────────────────────────────────────────────────────

let consoleErrorSpy: jest.SpyInstance;

beforeEach(() => {
  jest.clearAllMocks();
  jest.mocked(getErrorMessage).mockImplementation((_err, fallback) => fallback ?? "erro");
  consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  // Garante que erros inesperados reprovem o teste.
  // Testes que esperam console.error devem chamar consoleErrorSpy.mockClear() ao final.
  expect(consoleErrorSpy).not.toHaveBeenCalled();
  consoleErrorSpy.mockRestore();
});

// ─── useAccountData ───────────────────────────────────────────────────────────

describe("useAccountData — estado inicial", () => {
  it("contas começa como []", () => {
    const { result } = renderHook(() => useAccountData({ republicId: "rep-1" }));
    expect(result.current.contas).toEqual([]);
  });

  it("loading começa como true", () => {
    const { result } = renderHook(() => useAccountData({ republicId: "rep-1" }));
    expect(result.current.loading).toBe(true);
  });

  it("error começa como null", () => {
    const { result } = renderHook(() => useAccountData({ republicId: "rep-1" }));
    expect(result.current.error).toBeNull();
  });

  it("expõe fetchAccounts e fetchAccountResidents como funções", () => {
    const { result } = renderHook(() => useAccountData({ republicId: "rep-1" }));
    expect(typeof result.current.fetchAccounts).toBe("function");
    expect(typeof result.current.fetchAccountResidents).toBe("function");
  });
});

describe("useAccountData — fetchAccounts (sucesso)", () => {
  it("chama accountService.listarContasPorRepublica com o republicId", async () => {
    jest.mocked(accountService.listarContasPorRepublica).mockResolvedValue([mockConta]);

    const { result } = renderHook(() => useAccountData({ republicId: "rep-1" }));
    await act(async () => {
      await result.current.fetchAccounts();
    });

    expect(jest.mocked(accountService.listarContasPorRepublica)).toHaveBeenCalledWith("rep-1");
  });

  it("atualiza contas com os dados retornados", async () => {
    jest.mocked(accountService.listarContasPorRepublica).mockResolvedValue([mockConta]);

    const { result } = renderHook(() => useAccountData({ republicId: "rep-1" }));
    await act(async () => {
      await result.current.fetchAccounts();
    });

    expect(result.current.contas).toEqual([mockConta]);
  });

  it("retorna os dados da API", async () => {
    jest.mocked(accountService.listarContasPorRepublica).mockResolvedValue([mockConta]);

    const { result } = renderHook(() => useAccountData({ republicId: "rep-1" }));
    let returned: Conta[] = [];
    await act(async () => {
      returned = await result.current.fetchAccounts();
    });

    expect(returned).toEqual([mockConta]);
  });

  it("loading fica false após o fetch completar", async () => {
    jest.mocked(accountService.listarContasPorRepublica).mockResolvedValue([]);

    const { result } = renderHook(() => useAccountData({ republicId: "rep-1" }));
    await act(async () => {
      await result.current.fetchAccounts();
    });

    expect(result.current.loading).toBe(false);
  });

  it("error fica null após fetch bem-sucedido", async () => {
    jest.mocked(accountService.listarContasPorRepublica).mockResolvedValue([]);

    const { result } = renderHook(() => useAccountData({ republicId: "rep-1" }));
    await act(async () => {
      await result.current.fetchAccounts();
    });

    expect(result.current.error).toBeNull();
  });

  it("segunda chamada não reativa loading (hasLoadedRef)", async () => {
    jest.mocked(accountService.listarContasPorRepublica).mockResolvedValue([]);

    const { result } = renderHook(() => useAccountData({ republicId: "rep-1" }));

    // Primeira chamada: ativa loading e marca hasLoadedRef
    await act(async () => {
      await result.current.fetchAccounts();
    });

    // Segunda chamada: começa sem reativar loading (loading fica false durante a busca)
    let loadingDuringSecondFetch = true;
    jest
      .mocked(accountService.listarContasPorRepublica)
      .mockImplementation(async () => {
        loadingDuringSecondFetch = result.current.loading;
        return [];
      });

    await act(async () => {
      await result.current.fetchAccounts();
    });

    expect(loadingDuringSecondFetch).toBe(false);
  });
});

describe("useAccountData — fetchAccounts (falha)", () => {
  it("retorna [] quando o serviço falha", async () => {
    jest
      .mocked(accountService.listarContasPorRepublica)
      .mockRejectedValue(new Error("Falha de rede"));

    const { result } = renderHook(() => useAccountData({ republicId: "rep-1" }));
    let returned: Conta[] = [mockConta];
    await act(async () => {
      returned = await result.current.fetchAccounts();
    });

    expect(returned).toEqual([]);
    consoleErrorSpy.mockClear();
  });

  it("define error com a instância do erro lançado", async () => {
    const err = new Error("Falha de rede");
    jest
      .mocked(accountService.listarContasPorRepublica)
      .mockRejectedValue(err);

    const { result } = renderHook(() => useAccountData({ republicId: "rep-1" }));
    await act(async () => {
      await result.current.fetchAccounts();
    });

    expect(result.current.error).toBe(err);
    consoleErrorSpy.mockClear();
  });

  it("esvazia contas ao falhar", async () => {
    jest
      .mocked(accountService.listarContasPorRepublica)
      .mockResolvedValueOnce([mockConta])
      .mockRejectedValueOnce(new Error("fail"));

    const { result } = renderHook(() => useAccountData({ republicId: "rep-1" }));

    await act(async () => {
      await result.current.fetchAccounts(); // sucesso
    });
    expect(result.current.contas).toEqual([mockConta]);

    await act(async () => {
      await result.current.fetchAccounts(); // falha
    });
    expect(result.current.contas).toEqual([]);
    consoleErrorSpy.mockClear();
  });

  it("loading fica false mesmo após falha", async () => {
    jest
      .mocked(accountService.listarContasPorRepublica)
      .mockRejectedValue(new Error("fail"));

    const { result } = renderHook(() => useAccountData({ republicId: "rep-1" }));
    await act(async () => {
      await result.current.fetchAccounts();
    });

    expect(result.current.loading).toBe(false);
    consoleErrorSpy.mockClear();
  });

  it("exibe toast de erro com a mensagem do getErrorMessage", async () => {
    const err = new Error("fail");
    jest
      .mocked(accountService.listarContasPorRepublica)
      .mockRejectedValue(err);
    jest
      .mocked(getErrorMessage)
      .mockReturnValue("Não foi possível carregar as contas.");

    const { result } = renderHook(() => useAccountData({ republicId: "rep-1" }));
    await act(async () => {
      await result.current.fetchAccounts();
    });

    expect(jest.mocked(showToast.error)).toHaveBeenCalledWith(
      "Não foi possível carregar as contas."
    );
    consoleErrorSpy.mockClear();
  });

  it("loga o erro no console.error", async () => {
    const err = new Error("fail");
    jest
      .mocked(accountService.listarContasPorRepublica)
      .mockRejectedValue(err);

    const { result } = renderHook(() => useAccountData({ republicId: "rep-1" }));
    await act(async () => {
      await result.current.fetchAccounts();
    });

    expect(consoleErrorSpy).toHaveBeenCalledWith("Erro ao buscar contas:", err);
    consoleErrorSpy.mockClear();
  });
});

describe("useAccountData — fetchAccountResidents (sucesso)", () => {
  it("chama listarContasMoradores com o accountId", async () => {
    jest
      .mocked(accountResidentsService.listarContasMoradores)
      .mockResolvedValue([mockContaMorador]);

    const { result } = renderHook(() => useAccountData({ republicId: "rep-1" }));
    await act(async () => {
      await result.current.fetchAccountResidents("acc-1");
    });

    expect(
      jest.mocked(accountResidentsService.listarContasMoradores)
    ).toHaveBeenCalledWith("acc-1");
  });

  it("retorna os moradores da conta", async () => {
    jest
      .mocked(accountResidentsService.listarContasMoradores)
      .mockResolvedValue([mockContaMorador]);

    const { result } = renderHook(() => useAccountData({ republicId: "rep-1" }));
    let returned: ContaMorador[] = [];
    await act(async () => {
      returned = await result.current.fetchAccountResidents("acc-1");
    });

    expect(returned).toEqual([mockContaMorador]);
  });
});

describe("useAccountData — fetchAccountResidents (falha)", () => {
  it("retorna [] quando o serviço falha", async () => {
    jest
      .mocked(accountResidentsService.listarContasMoradores)
      .mockRejectedValue(new Error("fail"));

    const { result } = renderHook(() => useAccountData({ republicId: "rep-1" }));
    let returned: ContaMorador[] = [mockContaMorador];
    await act(async () => {
      returned = await result.current.fetchAccountResidents("acc-1");
    });

    expect(returned).toEqual([]);
    consoleErrorSpy.mockClear();
  });

  it("exibe toast de erro ao falhar", async () => {
    const err = new Error("fail");
    jest
      .mocked(accountResidentsService.listarContasMoradores)
      .mockRejectedValue(err);
    jest
      .mocked(getErrorMessage)
      .mockReturnValue("Não foi possível carregar os moradores da conta.");

    const { result } = renderHook(() => useAccountData({ republicId: "rep-1" }));
    await act(async () => {
      await result.current.fetchAccountResidents("acc-1");
    });

    expect(jest.mocked(showToast.error)).toHaveBeenCalledWith(
      "Não foi possível carregar os moradores da conta."
    );
    consoleErrorSpy.mockClear();
  });

  it("loga o erro no console.error ao falhar", async () => {
    const err = new Error("fail");
    jest
      .mocked(accountResidentsService.listarContasMoradores)
      .mockRejectedValue(err);

    const { result } = renderHook(() => useAccountData({ republicId: "rep-1" }));
    await act(async () => {
      await result.current.fetchAccountResidents("acc-1");
    });

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Erro ao buscar moradores da conta:",
      err
    );
    consoleErrorSpy.mockClear();
  });
});
