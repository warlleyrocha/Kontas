import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react-native";
import React from "react";
import { useRefresh } from "@/src/shared/contexts/RefreshContext";
import { accountService } from "../../../services/account.service";
import { accountResidentsService } from "../../../services/account-residents.service";
import { useAccountList } from "..";

jest.mock("@/src/features/auth/hooks/useAuth", () => ({
  useAuth: jest.fn(() => ({ isAuthenticated: true, user: null })),
}));

jest.mock("../../../services/account.service", () => ({
  accountService: {
    listarContasPorRepublica: jest.fn(),
  },
}));

jest.mock("../../../services/account-residents.service", () => ({
  accountResidentsService: {
    listarContasMoradores: jest.fn(),
    confirmarPagamentoMorador: jest.fn(),
  },
}));

jest.mock("@/src/shared/hooks/useComponentLogger", () => ({
  useComponentLogger: jest.fn(),
}));

jest.mock("@/src/shared/utils/showToast", () => ({
  showToast: { success: jest.fn(), error: jest.fn() },
}));

jest.mock("@/src/services/httpError", () => ({
  getErrorMessage: jest.fn((_err, fallback) => fallback),
}));

jest.mock("@/src/shared/contexts/RefreshContext", () => ({
  useRefresh: jest.fn(() => ({
    refreshAll: jest.fn(),
    refreshing: false,
    onRefresh: jest.fn(),
    registerRefresh: jest.fn(() => () => {}),
  })),
}));

const mockListarContasPorRepublica = jest.mocked(
  accountService.listarContasPorRepublica
);
const mockListarContasMoradores = jest.mocked(
  accountResidentsService.listarContasMoradores
);
const mockUseRefresh = jest.mocked(useRefresh);

const queryClient = new QueryClient({
  defaultOptions: {
    mutations: { retry: false },
    queries: { retry: false },
  },
});

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

beforeEach(() => {
  jest.clearAllMocks();
  queryClient.clear();
  mockListarContasPorRepublica.mockResolvedValue([]);
  mockListarContasMoradores.mockResolvedValue([]);
  mockUseRefresh.mockReturnValue({
    refreshAll: jest.fn(),
    refreshing: false,
    onRefresh: jest.fn(),
    registerRefresh: jest.fn(() => () => {}),
  });
  jest.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe("useAccountList — composição dos sub-hooks", () => {
  it("passa republicId para useAccountData", () => {
    renderHook(() => useAccountList({ republicId: "rep-42" }), { wrapper });
    expect(mockListarContasPorRepublica).toHaveBeenCalledWith("rep-42");
  });

  it("passa fetchAccountResidents para useAccountResidents", async () => {
    renderHook(() => useAccountList({ republicId: "rep-1" }), { wrapper });
    await act(async () => {});

    expect(mockListarContasMoradores).not.toHaveBeenCalled();
  });

  it("passa contas e mesSelecionado para useAccountDerivedData", () => {
    renderHook(() => useAccountList({ republicId: "rep-1" }), { wrapper });

    expect(mockListarContasPorRepublica).toHaveBeenCalledWith("rep-1");
  });
});

describe("useAccountList — estado retornado", () => {
  it("expõe loading e error de useAccountData", async () => {
    const { result } = renderHook(
      () => useAccountList({ republicId: "rep-1" }),
      { wrapper }
    );

    expect(result.current.loading).toBe(true);

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBeNull();
  });

  it("expõe os filtros de useAccountFilters", async () => {
    const { result } = renderHook(
      () => useAccountList({ republicId: "rep-1" }),
      { wrapper }
    );

    await act(async () => {});

    expect(result.current.mesSelecionado).toBe("todos");
    expect(result.current.mostrarContasAbertas).toBe(true);
    expect(result.current.mostrarContasPagas).toBe(false);
    expect(typeof result.current.setMesSelecionado).toBe("function");
    expect(typeof result.current.setMostrarContasAbertas).toBe("function");
    expect(typeof result.current.setMostrarContasPagas).toBe("function");
  });

  it("expõe contasOrdenadas e mesesDisponiveis de useAccountDerivedData", async () => {
    const { result } = renderHook(
      () => useAccountList({ republicId: "rep-1" }),
      { wrapper }
    );

    await act(async () => {});

    expect(Array.isArray(result.current.mesesDisponiveis)).toBe(true);
    expect(result.current.contasOrdenadas).toEqual({
      abertas: [],
      pagas: [],
    });
  });

  it("expõe accountResidentsById e confirmResidentPayment de useAccountResidents", async () => {
    const { result } = renderHook(
      () => useAccountList({ republicId: "rep-1" }),
      { wrapper }
    );

    await act(async () => {});

    expect(result.current.accountResidentsById).toEqual({});
    expect(typeof result.current.confirmResidentPayment).toBe("function");
  });
});

describe("useAccountList — refresh automático ao montar", () => {
  it("chama fetchAccounts ao montar", async () => {
    renderHook(() => useAccountList({ republicId: "rep-1" }), { wrapper });
    await act(async () => {});

    expect(mockListarContasPorRepublica).toHaveBeenCalledTimes(1);
  });

  it("passa o resultado de fetchAccounts para loadResidents", async () => {
    const contas = [
      {
        id: "acc-1",
        descricao: "Conta 1",
        valor: 100,
        vencimento: "2026-03-20",
        status: "PENDENTE" as any,
        republicaId: "rep-1",
        criadoPorId: "u-1",
        criadoPorNome: "Admin",
        metodoPagamento: null,
        pago: false,
        criadoEm: "2026-01-01",
        atualizadoEm: "2026-01-01",
      },
    ];
    mockListarContasPorRepublica.mockResolvedValue(contas);

    renderHook(() => useAccountList({ republicId: "rep-1" }), { wrapper });
    await waitFor(() =>
      expect(mockListarContasMoradores).toHaveBeenCalledWith("acc-1")
    );
  });
});

describe("useAccountList — registro no RefreshContext", () => {
  it("registra refresh com chave contendo republicId", async () => {
    const mockRegisterRefresh = jest.fn(() => () => {});
    mockUseRefresh.mockReturnValue({
      refreshAll: jest.fn(),
      refreshing: false,
      onRefresh: jest.fn(),
      registerRefresh: mockRegisterRefresh,
    });

    renderHook(() => useAccountList({ republicId: "rep-99" }), { wrapper });
    await act(async () => {});

    expect(mockRegisterRefresh).toHaveBeenCalledWith(
      expect.stringContaining("accounts-rep-99-"),
      expect.any(Function)
    );
  });

  it("passa a função refresh como callback de registro", async () => {
    const mockRegisterRefresh = jest.fn(() => () => {});
    mockUseRefresh.mockReturnValue({
      refreshAll: jest.fn(),
      refreshing: false,
      onRefresh: jest.fn(),
      registerRefresh: mockRegisterRefresh,
    });

    renderHook(() => useAccountList({ republicId: "rep-1" }), { wrapper });
    await act(async () => {});

    const registeredFn = (mockRegisterRefresh.mock.calls[0] as unknown[])[1];
    expect(typeof registeredFn).toBe("function");
  });
});

describe("useAccountList — refresh público", () => {
  it("refresh chama fetchAccounts e depois loadResidents", async () => {
  const contas = [
    {
      id: "acc-1",
      descricao: "Conta 1",
      valor: 100,
      vencimento: "2026-03-20",
      status: "PENDENTE" as any,
      republicaId: "rep-1",
      criadoPorId: "u-1",
      criadoPorNome: "Admin",
      metodoPagamento: null,
      pago: false,
      criadoEm: "2026-01-01",
      atualizadoEm: "2026-01-01",
    },
  ];

  mockListarContasPorRepublica.mockResolvedValue(contas);

  const { result } = renderHook(
    () => useAccountList({ republicId: "rep-1" }),
    { wrapper }
  );

  await act(async () => {});

  mockListarContasPorRepublica.mockClear();
  mockListarContasMoradores.mockClear();

  await act(async () => {
    await result.current.refresh();
  });

  await waitFor(() => {
    expect(mockListarContasPorRepublica).toHaveBeenCalledTimes(1);
    expect(mockListarContasMoradores).toHaveBeenCalledWith("acc-1");
  });
});
});
