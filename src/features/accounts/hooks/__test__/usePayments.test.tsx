import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react-native";
import React from "react";
import { accountService } from "@/src/features/accounts/services/account.service";
import { accountResidentsService } from "@/src/features/accounts/services/account-residents.service";
import type { Conta } from "@/src/features/accounts/types/account.types";
import type { ContaMorador } from "@/src/features/accounts/types/accountResidents.types";
import { StatusPagamento } from "@/src/features/accounts/types/accountResidents.types";
import { getErrorMessage } from "@/src/services/httpError";
import { useRefresh } from "@/src/shared/contexts/RefreshContext";
import { showToast } from "@/src/shared/utils/showToast";
import { usePaymentsScreen } from "../usePayments";

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
    confirmarPagamentoAdmin: jest.fn(),
    recusarPagamentoAdmin: jest.fn(),
    listarContasMoradores: jest.fn(),
  },
}));
jest.mock("@/src/features/accounts/services/account.service", () => ({
  accountService: {
    listarContasPorRepublica: jest.fn(),
  },
}));
jest.mock("@/src/shared/hooks/useComponentLogger", () => ({
  useComponentLogger: jest.fn(),
}));
jest.mock("@/src/features/auth/hooks/useAuth", () => ({
  useAuth: jest.fn(() => ({ isAuthenticated: true, user: null })),
}));
jest.mock("@/src/features/user/hooks/useUserQueries", () => ({
  useCurrentUserQuery: jest.fn(() => ({
    data: { email: "admin@test.com" },
  })),
}));
jest.mock("@/src/features/residents/hooks/useResidents", () => ({
  useResidents: jest.fn(() => ({
    residents: [
      {
        id: "admin-1",
        email: "admin@test.com",
        nome: "Admin",
        role: "ADMIN",
        fotoPerfil: null,
        chavePix: null,
        telefone: null,
      },
    ],
    isLoading: false,
    fetchResidents: jest.fn(),
  })),
}));

const mockRefreshAll = jest.fn();
const mockListarContasPorRepublica = jest.mocked(
  accountService.listarContasPorRepublica
);
const mockListarContasMoradores = jest.mocked(
  accountResidentsService.listarContasMoradores
);

let consoleErrorSpy: jest.SpyInstance;

function mockConta(id: string, overrides?: Partial<Conta>): Conta {
  return {
    id,
    descricao: `Conta ${id}`,
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
    ...overrides,
  };
}

function mockContaMorador(
  id: string,
  overrides?: Partial<ContaMorador>
): ContaMorador {
  return {
    id,
    contaId: "acc-1",
    moradorId: id,
    moradorNome: "Ana",
    status: StatusPagamento.AGUARDANDO_CONFIRMACAO,
    valor: 50,
    visivel: true,
    pagoEm: null,
    metodoPagamento: null,
    criadoEm: "2026-01-01",
    atualizadoEm: "2026-01-01",
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

beforeEach(() => {
  jest.clearAllMocks();
  queryClient.clear();

  jest.mocked(useRefresh).mockReturnValue({
    refreshAll: mockRefreshAll,
    refreshing: false,
    onRefresh: jest.fn(),
    registerRefresh: jest.fn(),
  } as any);

  jest
    .mocked(getErrorMessage)
    .mockImplementation((_err, fallback) => fallback ?? "erro");

  mockListarContasPorRepublica.mockResolvedValue([]);
  mockListarContasMoradores.mockResolvedValue([]);
  mockRefreshAll.mockResolvedValue(undefined);

  consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  consoleErrorSpy?.mockRestore();
  jest.restoreAllMocks();
});

function renderPayments() {
  return renderHook(() => usePaymentsScreen({ republicId: "rep-1" }), {
    wrapper,
  });
}

// ─── Estado inicial ──────────────────────────────────────────────────────────

describe("usePaymentsScreen — estado inicial", () => {
  it("retorna isLoading true e listas vazias no início", async () => {
    const { result } = renderPayments();

    expect(result.current.isLoading).toBe(true);
    expect(result.current.filteredPaymentAccounts).toEqual([]);
    expect(result.current.confirmingResidentById).toEqual({});
    expect(result.current.refusingResidentById).toEqual({});

    await act(async () => {});
  });

  it("define selectedStatus como AGUARDANDO_CONFIRMACAO por padrão", async () => {
    const { result } = renderPayments();
    expect(result.current.selectedStatus).toBe(
      StatusPagamento.AGUARDANDO_CONFIRMACAO
    );
    await act(async () => {});
  });

  it("retorna statusOptions com as três opções", async () => {
    const { result } = renderPayments();
    expect(result.current.statusOptions).toEqual([
      { label: "Pendentes", value: StatusPagamento.AGUARDANDO_CONFIRMACAO },
      { label: "Pago", value: StatusPagamento.PAGO },
      { label: "Todos", value: "todos" },
    ]);
    await act(async () => {});
  });
});

// ─── loadPayments ────────────────────────────────────────────────────────────

describe("usePaymentsScreen — loadPayments", () => {
  it("carrega contas e moradores ao montar", async () => {
    const morador = mockContaMorador("cm-1");
    mockListarContasPorRepublica.mockResolvedValue([mockConta("acc-1")]);
    mockListarContasMoradores.mockResolvedValue([morador]);

    const { result } = renderPayments();
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(mockListarContasPorRepublica).toHaveBeenCalled();
    expect(mockListarContasMoradores).toHaveBeenCalledWith("acc-1");
    expect(result.current.filteredPaymentAccounts).toHaveLength(1);
    expect(result.current.filteredPaymentAccounts[0]?.residents).toEqual([
      morador,
    ]);
  });

  it("filtra contas sem moradores relevantes", async () => {
    const moradorPendente = mockContaMorador("cm-1", {
      status: StatusPagamento.PENDENTE,
      pagoEm: null,
    });
    mockListarContasPorRepublica.mockResolvedValue([mockConta("acc-1")]);
    mockListarContasMoradores.mockResolvedValue([moradorPendente]);

    const { result } = renderPayments();
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.filteredPaymentAccounts).toHaveLength(0);
  });

  it("ordena contas por data de vencimento", async () => {
    const morador = mockContaMorador("cm-1");
    mockListarContasPorRepublica.mockResolvedValue([
      mockConta("acc-later", { vencimento: "2026-06-01" }),
      mockConta("acc-earlier", { vencimento: "2026-01-01" }),
    ]);
    mockListarContasMoradores.mockResolvedValue([morador]);

    const { result } = renderPayments();
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.filteredPaymentAccounts[0]?.id).toBe("acc-earlier");
    expect(result.current.filteredPaymentAccounts[1]?.id).toBe("acc-later");
  });

  it("define isLoading false após o carregamento", async () => {
    mockListarContasPorRepublica.mockResolvedValue([]);

    const { result } = renderPayments();
    await waitFor(() => expect(result.current.isLoading).toBe(false));
  });
});

// ─── filteredPaymentAccounts ─────────────────────────────────────────────────

describe("usePaymentsScreen — filteredPaymentAccounts", () => {
  it("filtra moradores pelo status selecionado", async () => {
    const moradorAguardando = mockContaMorador("cm-1", {
      status: StatusPagamento.AGUARDANDO_CONFIRMACAO,
    });
    const moradorPago = mockContaMorador("cm-2", {
      status: StatusPagamento.PAGO,
    });
    mockListarContasPorRepublica.mockResolvedValue([mockConta("acc-1")]);
    mockListarContasMoradores.mockResolvedValue([
      moradorAguardando,
      moradorPago,
    ]);

    const { result } = renderPayments();
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.filteredPaymentAccounts[0]?.residents).toEqual([
      moradorAguardando,
    ]);
  });

  it("retorna todos os moradores quando status é 'todos'", async () => {
    const moradorAguardando = mockContaMorador("cm-1", {
      status: StatusPagamento.AGUARDANDO_CONFIRMACAO,
    });
    const moradorPago = mockContaMorador("cm-2", {
      status: StatusPagamento.PAGO,
    });
    mockListarContasPorRepublica.mockResolvedValue([mockConta("acc-1")]);
    mockListarContasMoradores.mockResolvedValue([
      moradorAguardando,
      moradorPago,
    ]);

    const { result } = renderPayments();
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => {
      result.current.setSelectedStatus("todos");
    });

    expect(result.current.filteredPaymentAccounts[0]?.residents).toHaveLength(
      2
    );
  });

  it("remove contas sem moradores após filtro", async () => {
    const moradorPago = mockContaMorador("cm-1", {
      status: StatusPagamento.PAGO,
    });
    mockListarContasPorRepublica.mockResolvedValue([mockConta("acc-1")]);
    mockListarContasMoradores.mockResolvedValue([moradorPago]);

    const { result } = renderPayments();
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.filteredPaymentAccounts).toHaveLength(0);
  });
});

// ─── subtitle ────────────────────────────────────────────────────────────────

describe("usePaymentsScreen — subtitle", () => {
  it("retorna subtítulo para AGUARDANDO_CONFIRMACAO com 0 pagamentos", async () => {
    mockListarContasPorRepublica.mockResolvedValue([]);

    const { result } = renderPayments();
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.subtitle).toBe(
      "Nenhum pagamento aguardando confirmação"
    );
  });

  it("retorna subtítulo para AGUARDANDO_CONFIRMACAO com 1 pagamento", async () => {
    const morador = mockContaMorador("cm-1", {
      status: StatusPagamento.AGUARDANDO_CONFIRMACAO,
    });
    mockListarContasPorRepublica.mockResolvedValue([mockConta("acc-1")]);
    mockListarContasMoradores.mockResolvedValue([morador]);

    const { result } = renderPayments();
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.subtitle).toBe("1 pagamento aguardando confirmação");
  });

  it("retorna subtítulo para AGUARDANDO_CONFIRMACAO com múltiplos pagamentos", async () => {
    const moradores = [
      mockContaMorador("cm-1", {
        status: StatusPagamento.AGUARDANDO_CONFIRMACAO,
      }),
      mockContaMorador("cm-2", {
        status: StatusPagamento.AGUARDANDO_CONFIRMACAO,
      }),
    ];
    mockListarContasPorRepublica.mockResolvedValue([mockConta("acc-1")]);
    mockListarContasMoradores.mockResolvedValue(moradores);

    const { result } = renderPayments();
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.subtitle).toBe("2 pagamentos aguardando confirmação");
  });

  it("retorna subtítulo para PAGO com 0 pagamentos", async () => {
    mockListarContasPorRepublica.mockResolvedValue([]);

    const { result } = renderPayments();
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => {
      result.current.setSelectedStatus(StatusPagamento.PAGO);
    });

    expect(result.current.subtitle).toBe("Nenhum pagamento aprovado");
  });

  it("retorna subtítulo para PAGO com 1 pagamento", async () => {
    const moradorPago = mockContaMorador("cm-1", {
      status: StatusPagamento.PAGO,
    });
    mockListarContasPorRepublica.mockResolvedValue([mockConta("acc-1")]);
    mockListarContasMoradores.mockResolvedValue([moradorPago]);

    const { result } = renderPayments();
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => {
      result.current.setSelectedStatus(StatusPagamento.PAGO);
    });

    expect(result.current.subtitle).toBe("1 pagamento aprovado");
  });

  it("retorna subtítulo para PAGO com múltiplos pagamentos", async () => {
    const moradores = [
      mockContaMorador("cm-1", { status: StatusPagamento.PAGO }),
      mockContaMorador("cm-2", { status: StatusPagamento.PAGO }),
    ];
    mockListarContasPorRepublica.mockResolvedValue([mockConta("acc-1")]);
    mockListarContasMoradores.mockResolvedValue(moradores);

    const { result } = renderPayments();
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => {
      result.current.setSelectedStatus(StatusPagamento.PAGO);
    });

    expect(result.current.subtitle).toBe("2 pagamentos marcados como PAGO");
  });

  it("retorna subtítulo para 'todos' com 0 pagamentos", async () => {
    mockListarContasPorRepublica.mockResolvedValue([]);

    const { result } = renderPayments();
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => {
      result.current.setSelectedStatus("todos");
    });

    expect(result.current.subtitle).toBe("Nenhum pagamento encontrado");
  });

  it("retorna subtítulo para 'todos' com 1 pagamento", async () => {
    const morador = mockContaMorador("cm-1", {
      status: StatusPagamento.AGUARDANDO_CONFIRMACAO,
    });
    mockListarContasPorRepublica.mockResolvedValue([mockConta("acc-1")]);
    mockListarContasMoradores.mockResolvedValue([morador]);

    const { result } = renderPayments();
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => {
      result.current.setSelectedStatus("todos");
    });

    expect(result.current.subtitle).toBe("1 pagamento encontrado");
  });

  it("retorna subtítulo para 'todos' com múltiplos pagamentos", async () => {
    const moradores = [
      mockContaMorador("cm-1", {
        status: StatusPagamento.AGUARDANDO_CONFIRMACAO,
      }),
      mockContaMorador("cm-2", { status: StatusPagamento.PAGO }),
    ];
    mockListarContasPorRepublica.mockResolvedValue([mockConta("acc-1")]);
    mockListarContasMoradores.mockResolvedValue(moradores);

    const { result } = renderPayments();
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => {
      result.current.setSelectedStatus("todos");
    });

    expect(result.current.subtitle).toBe("2 pagamentos encontrados");
  });
});

// ─── handleConfirmResidentPayment ────────────────────────────────────────────

describe("usePaymentsScreen — handleConfirmResidentPayment", () => {
  it("confirma pagamento e exibe toast de sucesso", async () => {
    const morador = mockContaMorador("cm-1", {
      status: StatusPagamento.AGUARDANDO_CONFIRMACAO,
    });
    mockListarContasPorRepublica.mockResolvedValue([mockConta("acc-1")]);
    mockListarContasMoradores.mockResolvedValue([morador]);
    jest
      .mocked(accountResidentsService.confirmarPagamentoAdmin)
      .mockResolvedValue(undefined as any);

    const { result } = renderPayments();
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.handleConfirmResidentPayment("acc-1", "cm-1");
    });

    expect(
      jest.mocked(accountResidentsService.confirmarPagamentoAdmin)
    ).toHaveBeenCalledWith({ id: "cm-1" });
    expect(jest.mocked(showToast.success)).toHaveBeenCalled();
    expect(jest.mocked(showToast.success)).toHaveBeenCalledWith(
      "Pagamento aprovado."
    );
  });

  it("exibe toast de erro quando serviço falha", async () => {
    mockListarContasPorRepublica.mockResolvedValue([]);
    jest
      .mocked(accountResidentsService.confirmarPagamentoAdmin)
      .mockRejectedValue(new Error("fail"));
    jest
      .mocked(getErrorMessage)
      .mockReturnValue("Não foi possível atualizar o pagamento.");

    const { result } = renderPayments();
    await act(async () => {});

    await act(async () => {
      await result.current.handleConfirmResidentPayment("acc-1", "cm-1");
    });

    expect(jest.mocked(showToast.error)).toHaveBeenCalledWith(
      "Não foi possível atualizar o pagamento."
    );
  });

  it("limpa confirmingResidentById após sucesso", async () => {
    mockListarContasPorRepublica.mockResolvedValue([]);
    jest
      .mocked(accountResidentsService.confirmarPagamentoAdmin)
      .mockResolvedValue(undefined as any);

    const { result } = renderPayments();
    await act(async () => {});

    await act(async () => {
      await result.current.handleConfirmResidentPayment("acc-1", "cm-1");
    });

    expect(result.current.confirmingResidentById["cm-1"]).toBeUndefined();
  });

  it("limpa confirmingResidentById após erro", async () => {
    mockListarContasPorRepublica.mockResolvedValue([]);
    jest
      .mocked(accountResidentsService.confirmarPagamentoAdmin)
      .mockRejectedValue(new Error("fail"));

    const { result } = renderPayments();
    await act(async () => {});

    await act(async () => {
      await result.current.handleConfirmResidentPayment("acc-1", "cm-1");
    });

    expect(result.current.confirmingResidentById["cm-1"]).toBeUndefined();
  });

  it("bloqueia chamada simultânea para o mesmo residente", async () => {
    mockListarContasPorRepublica.mockResolvedValue([]);

    let resolveFirst!: (value?: unknown) => void;
    jest
      .mocked(accountResidentsService.confirmarPagamentoAdmin)
      .mockImplementation(
        () =>
          new Promise<any>((resolve) => {
            resolveFirst = resolve;
          })
      );

    const { result } = renderPayments();
    await act(async () => {});

    act(() => {
      void result.current.handleConfirmResidentPayment("acc-1", "cm-1");
    });

    await act(async () => {
      await result.current.handleConfirmResidentPayment("acc-1", "cm-1");
    });

    expect(
      jest.mocked(accountResidentsService.confirmarPagamentoAdmin)
    ).toHaveBeenCalledTimes(1);

    await act(async () => {
      resolveFirst();
      await Promise.resolve();
    });
  });
});

// ─── handleRefuseResidentPayment ─────────────────────────────────────────────

describe("usePaymentsScreen — handleRefuseResidentPayment", () => {
  it("recusa pagamento e exibe toast de sucesso", async () => {
    const morador = mockContaMorador("cm-1", {
      status: StatusPagamento.AGUARDANDO_CONFIRMACAO,
    });
    mockListarContasPorRepublica.mockResolvedValue([mockConta("acc-1")]);
    mockListarContasMoradores.mockResolvedValue([morador]);
    jest
      .mocked(accountResidentsService.recusarPagamentoAdmin)
      .mockResolvedValue(undefined as any);

    const { result } = renderPayments();
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.handleRefuseResidentPayment("acc-1", "cm-1");
    });

    expect(
      jest.mocked(accountResidentsService.recusarPagamentoAdmin)
    ).toHaveBeenCalledWith({ id: "cm-1" });
    expect(jest.mocked(showToast.success)).toHaveBeenCalled();
    expect(jest.mocked(showToast.success)).toHaveBeenCalledWith(
      "Pagamento recusado."
    );
  });

  it("exibe toast de erro quando serviço falha", async () => {
    mockListarContasPorRepublica.mockResolvedValue([]);
    jest
      .mocked(accountResidentsService.recusarPagamentoAdmin)
      .mockRejectedValue(new Error("fail"));
    jest
      .mocked(getErrorMessage)
      .mockReturnValue("Não foi possível recusar o pagamento.");

    const { result } = renderPayments();
    await act(async () => {});

    await act(async () => {
      await result.current.handleRefuseResidentPayment("acc-1", "cm-1");
    });

    expect(jest.mocked(showToast.error)).toHaveBeenCalledWith(
      "Não foi possível recusar o pagamento."
    );
  });

  it("limpa refusingResidentById após sucesso", async () => {
    mockListarContasPorRepublica.mockResolvedValue([]);
    jest
      .mocked(accountResidentsService.recusarPagamentoAdmin)
      .mockResolvedValue(undefined as any);

    const { result } = renderPayments();
    await act(async () => {});

    await act(async () => {
      await result.current.handleRefuseResidentPayment("acc-1", "cm-1");
    });

    expect(result.current.refusingResidentById["cm-1"]).toBeUndefined();
  });

  it("limpa refusingResidentById após erro", async () => {
    mockListarContasPorRepublica.mockResolvedValue([]);
    jest
      .mocked(accountResidentsService.recusarPagamentoAdmin)
      .mockRejectedValue(new Error("fail"));

    const { result } = renderPayments();
    await act(async () => {});

    await act(async () => {
      await result.current.handleRefuseResidentPayment("acc-1", "cm-1");
    });

    expect(result.current.refusingResidentById["cm-1"]).toBeUndefined();
  });

  it("bloqueia chamada simultânea para o mesmo residente", async () => {
    mockListarContasPorRepublica.mockResolvedValue([]);

    let resolveFirst!: (value?: unknown) => void;
    jest
      .mocked(accountResidentsService.recusarPagamentoAdmin)
      .mockImplementation(
        () =>
          new Promise<any>((resolve) => {
            resolveFirst = resolve;
          })
      );

    const { result } = renderPayments();
    await act(async () => {});

    act(() => {
      void result.current.handleRefuseResidentPayment("acc-1", "cm-1");
    });

    await act(async () => {
      await result.current.handleRefuseResidentPayment("acc-1", "cm-1");
    });

    expect(
      jest.mocked(accountResidentsService.recusarPagamentoAdmin)
    ).toHaveBeenCalledTimes(1);

    await act(async () => {
      resolveFirst();
      await Promise.resolve();
    });
  });
});

// ─── loadPayments manual refresh ─────────────────────────────────────────────

describe("usePaymentsScreen — refresh manual", () => {
  it("loadPayments com isManualRefresh dispara REFRESH_START", async () => {
    mockListarContasPorRepublica.mockResolvedValue([]);

    const { result } = renderPayments();
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.loadPayments(true);
    });

    expect(result.current.isRefreshing).toBe(false);
    expect(result.current.isLoading).toBe(false);
  });
});
