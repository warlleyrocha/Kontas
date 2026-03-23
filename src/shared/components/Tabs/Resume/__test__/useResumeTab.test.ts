import { act, renderHook } from "@testing-library/react-native";
import { useAccountActions } from "@/src/features/accounts/hooks/useAccountActions";
import { useAccountData } from "@/src/features/accounts/hooks/useAccountList/useAccountData";
import {
  StatusConta,
  type Conta,
} from "@/src/features/accounts/types/account.types";
import {
  StatusPagamento,
  type ContaMorador,
} from "@/src/features/accounts/types/accountResidents.types";
import { useRefresh } from "@/src/shared/contexts/RefreshContext";
import type { ResidentResponse } from "@/src/shared/types/resident.types";
import { useResumeTab } from "../useResumeTab";

jest.mock("@/src/features/accounts/hooks/useAccountActions", () => ({
  useAccountActions: jest.fn(),
}));

jest.mock(
  "@/src/features/accounts/hooks/useAccountList/useAccountData",
  () => ({
    useAccountData: jest.fn(),
  })
);

jest.mock("@/src/shared/contexts/RefreshContext", () => ({
  useRefresh: jest.fn(),
}));

const mockFetchAccounts = jest.fn();
const mockFetchContasPorMorador = jest.fn();
const mockRegisterRefresh = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  jest.mocked(useAccountActions).mockReturnValue({
    fetchContasPorMorador: mockFetchContasPorMorador,
  } as any);
  jest.mocked(useAccountData).mockReturnValue({
    fetchAccounts: mockFetchAccounts,
  } as any);
  jest.mocked(useRefresh).mockReturnValue({
    registerRefresh: mockRegisterRefresh,
  } as any);
  mockFetchAccounts.mockResolvedValue([]);
  mockFetchContasPorMorador.mockResolvedValue([]);
  mockRegisterRefresh.mockReturnValue(jest.fn());
});

// ─── Fixtures ────────────────────────────────────────────────────────────────

function makeConta(overrides: Partial<Conta> = {}): Conta {
  return {
    id: "c-1",
    descricao: "Conta de luz",
    valor: 100,
    vencimento: "2026-03-20",
    status: StatusConta.PENDENTE,
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

function makeContaMorador(
  overrides: Partial<ContaMorador> = {}
): ContaMorador {
  return {
    id: "cm-1",
    contaId: "c-1",
    moradorId: "r-1",
    moradorNome: "Ana",
    status: StatusPagamento.PENDENTE,
    valor: 50,
    visivel: true,
    pagoEm: null,
    metodoPagamento: null,
    criadoEm: "2026-01-01",
    atualizadoEm: "2026-01-01",
    ...overrides,
  };
}

const mockResidents: ResidentResponse[] = [
  {
    id: "r-1",
    nome: "Ana",
    email: "ana@email.com",
    fotoPerfil: null,
    chavePix: null,
    telefone: null,
    role: "MORADOR" as any,
  },
  {
    id: "r-2",
    nome: "Bruno",
    email: "bruno@email.com",
    fotoPerfil: null,
    chavePix: null,
    telefone: null,
    role: "MORADOR" as any,
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function renderResumeTab(residents = mockResidents, republicId = "rep-1") {
  return renderHook(() => useResumeTab({ residents, republicId }));
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("useResumeTab", () => {
  describe("estado inicial e montagem", () => {
    it("retorna o estado inicial correto antes dos efeitos", async () => {
      const { result } = renderResumeTab();

      // Estado antes dos effects assíncronos resolverem
      expect(result.current.contas).toEqual([]);
      expect(result.current.dividas).toEqual({});
      expect(result.current.totalValor).toBe(0);
      expect(result.current.totalPago).toBe(0);
      expect(result.current.totalPendente).toBe(0);
      expect(result.current.quantidadePagas).toBe(0);
      expect(result.current.quantidadePendentes).toBe(0);

      await act(async () => {});
    });

    it("chama fetchAccounts ao montar", async () => {
      renderResumeTab();
      await act(async () => {});
      expect(mockFetchAccounts).toHaveBeenCalledTimes(1);
    });

    it("chama fetchContasPorMorador para cada morador ao montar", async () => {
      renderResumeTab();
      await act(async () => {});
      expect(mockFetchContasPorMorador).toHaveBeenCalledWith("r-1");
      expect(mockFetchContasPorMorador).toHaveBeenCalledWith("r-2");
    });

    it("registra o refresh com a chave correta", async () => {
      renderResumeTab(mockResidents, "rep-42");
      await act(async () => {});
      expect(mockRegisterRefresh).toHaveBeenCalledWith(
        "resume-rep-42",
        expect.any(Function)
      );
    });

    it("cancela o registro de refresh ao desmontar", async () => {
      const mockUnregister = jest.fn();
      mockRegisterRefresh.mockReturnValue(mockUnregister);
      const { unmount } = renderResumeTab();
      await act(async () => {});
      unmount();
      expect(mockUnregister).toHaveBeenCalledTimes(1);
    });
  });

  describe("fetchContas", () => {
    it("define contas após fetchAccounts resolver", async () => {
      const contas = [makeConta({ id: "c-1" }), makeConta({ id: "c-2" })];
      mockFetchAccounts.mockResolvedValue(contas);

      const { result } = renderResumeTab();
      await act(async () => {});

      expect(result.current.contas).toEqual(contas);
    });

    it("define isLoadingContas como true durante o fetch e false após", async () => {
      let resolveContas!: (v: Conta[]) => void;
      mockFetchAccounts.mockReturnValue(
        new Promise<Conta[]>((r) => { resolveContas = r; })
      );

      const { result } = renderResumeTab();

      await act(async () => {
        await Promise.resolve();
      });

      expect(result.current.isLoadingContas).toBe(true);

      await act(async () => {
        resolveContas([]);
      });

      expect(result.current.isLoadingContas).toBe(false);
    });
  });

  describe("fetchDividas", () => {
    it("não chama fetchContasPorMorador quando residents está vazio", async () => {
      renderResumeTab([]);
      await act(async () => {});
      expect(mockFetchContasPorMorador).not.toHaveBeenCalled();
    });

    it("define isLoadingDividas como true durante o fetch e false após", async () => {
      let resolveDividas!: (v: ContaMorador[]) => void;
      mockFetchContasPorMorador.mockReturnValue(
        new Promise<ContaMorador[]>((r) => { resolveDividas = r; })
      );

      const { result } = renderResumeTab();

      await act(async () => {
        await Promise.resolve();
      });

      expect(result.current.isLoadingDividas).toBe(true);

      await act(async () => {
        resolveDividas([]);
      });

      expect(result.current.isLoadingDividas).toBe(false);
    });

    it("constrói o mapa de dívidas somando apenas contas PENDENTE e AGUARDANDO_CONFIRMACAO", async () => {
      mockFetchContasPorMorador.mockImplementation((moradorId: string) => {
        if (moradorId === "r-1") {
          return Promise.resolve([
            makeContaMorador({ status: StatusPagamento.PENDENTE, valor: 80 }),
            makeContaMorador({
              status: StatusPagamento.AGUARDANDO_CONFIRMACAO,
              valor: 20,
            }),
            makeContaMorador({ status: StatusPagamento.PAGO, valor: 999 }),
          ]);
        }
        return Promise.resolve([
          makeContaMorador({ status: StatusPagamento.PAGO, valor: 200 }),
        ]);
      });

      const { result } = renderResumeTab();
      await act(async () => {});

      expect(result.current.dividas["r-1"]).toBe(100); // 80 + 20
      expect(result.current.dividas["r-2"]).toBe(0);   // só PAGO, não conta
    });

    it("atribui 0 quando morador não possui contas pendentes", async () => {
      mockFetchContasPorMorador.mockResolvedValue([]);

      const { result } = renderResumeTab([mockResidents[0]]);
      await act(async () => {});

      expect(result.current.dividas["r-1"]).toBe(0);
    });
  });

  describe("valores calculados", () => {
    it("calcula totalValor somando todos os valores das contas", async () => {
      mockFetchAccounts.mockResolvedValue([
        makeConta({ valor: 100, status: StatusConta.PAGA }),
        makeConta({ id: "c-2", valor: 200, status: StatusConta.PENDENTE }),
      ]);

      const { result } = renderResumeTab();
      await act(async () => {});

      expect(result.current.totalValor).toBe(300);
    });

    it("calcula totalPago somando apenas contas com status PAGA", async () => {
      mockFetchAccounts.mockResolvedValue([
        makeConta({ valor: 100, status: StatusConta.PAGA }),
        makeConta({ id: "c-2", valor: 200, status: StatusConta.PAGA }),
        makeConta({ id: "c-3", valor: 50, status: StatusConta.PENDENTE }),
      ]);

      const { result } = renderResumeTab();
      await act(async () => {});

      expect(result.current.totalPago).toBe(300);
    });

    it("calcula totalPendente somando contas sem status PAGA", async () => {
      mockFetchAccounts.mockResolvedValue([
        makeConta({ valor: 50, status: StatusConta.PAGA }),
        makeConta({ id: "c-2", valor: 80, status: StatusConta.PENDENTE }),
        makeConta({ id: "c-3", valor: 70, status: StatusConta.ATRASADA }),
      ]);

      const { result } = renderResumeTab();
      await act(async () => {});

      expect(result.current.totalPendente).toBe(150);
    });

    it("calcula quantidadePagas corretamente", async () => {
      mockFetchAccounts.mockResolvedValue([
        makeConta({ status: StatusConta.PAGA }),
        makeConta({ id: "c-2", status: StatusConta.PAGA }),
        makeConta({ id: "c-3", status: StatusConta.PENDENTE }),
      ]);

      const { result } = renderResumeTab();
      await act(async () => {});

      expect(result.current.quantidadePagas).toBe(2);
    });

    it("calcula quantidadePendentes corretamente", async () => {
      mockFetchAccounts.mockResolvedValue([
        makeConta({ status: StatusConta.PAGA }),
        makeConta({ id: "c-2", status: StatusConta.PENDENTE }),
        makeConta({ id: "c-3", status: StatusConta.ATRASADA }),
      ]);

      const { result } = renderResumeTab();
      await act(async () => {});

      expect(result.current.quantidadePendentes).toBe(2);
    });
  });

  describe("fetchAll via registerRefresh", () => {
    it("chama fetchContas e fetchDividas ao executar o callback de refresh", async () => {
      let registeredCallback!: () => Promise<void>;
      mockRegisterRefresh.mockImplementation(
        (_key: string, cb: () => Promise<void>) => {
          registeredCallback = cb;
          return jest.fn();
        }
      );

      renderResumeTab();
      await act(async () => {});

      mockFetchAccounts.mockClear();
      mockFetchContasPorMorador.mockClear();

      await act(async () => {
        await registeredCallback();
      });

      expect(mockFetchAccounts).toHaveBeenCalledTimes(1);
      expect(mockFetchContasPorMorador).toHaveBeenCalledTimes(
        mockResidents.length
      );
    });
  });
});
