import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook } from "@testing-library/react-native";

import {
  useAccountsByRepublicQuery,
  useAccountsByResidentQueries,
} from "@/src/features/accounts/hooks/useAccountQueries";
import {
  StatusConta,
  type Conta,
} from "@/src/features/accounts/types/account.types";
import {
  StatusPagamento,
  type ContaMorador,
} from "@/src/features/accounts/types/accountResidents.types";
import type { ResidentResponse } from "@/src/shared/types/resident.types";

import { useResumeTab } from "../useResumeTab";

jest.mock("@/src/features/accounts/hooks/useAccountQueries", () => ({
  useAccountsByRepublicQuery: jest.fn(),
  useAccountsByResidentQueries: jest.fn(),
}));

const mockRegisterRefresh = jest.fn<void, [key: string, fn: () => void | Promise<void>]>(() => {});

jest.mock("@/src/shared/contexts/RefreshContext", () => ({
  useRefresh: () => ({ registerRefresh: mockRegisterRefresh }),
}));

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

function makeContaMorador(overrides: Partial<ContaMorador> = {}): ContaMorador {
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

// ─── Helpers ─────────────────────────────────────────────────────────────────

function mockRepublicQuery(overrides: object = {}) {
  jest.mocked(useAccountsByRepublicQuery).mockReturnValue({
    data: [],
    isLoading: false,
    ...overrides,
  } as any);
}

function mockResidentQueries(results: object = { data: [], isLoading: false }) {
  jest.mocked(useAccountsByResidentQueries).mockReturnValue(results as any);
}

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
});

function renderResumeTab(residents = mockResidents, republicId = "rep-1") {
  return renderHook(() => useResumeTab({ residents, republicId }), {
    wrapper: ({ children }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    ),
  });
}

// ─── Setup ───────────────────────────────────────────────────────────────────

beforeEach(() => {
  jest.clearAllMocks();
  mockRepublicQuery();
  mockResidentQueries({ data: [[], []], isLoading: false });
});

// ─── Tests ───────────────────────────────────────────────────────────────────

describe("useResumeTab", () => {
  describe("estado inicial", () => {
    it("retorna o estado inicial correto com queries vazias", () => {
      const { result } = renderResumeTab();

      expect(result.current.contas).toEqual([]);
      expect(result.current.dividas).toEqual({ "r-1": 0, "r-2": 0 });
      expect(result.current.totalValor).toBe(0);
      expect(result.current.totalPago).toBe(0);
      expect(result.current.totalPendente).toBe(0);
      expect(result.current.quantidadePagas).toBe(0);
      expect(result.current.quantidadePendentes).toBe(0);
      expect(result.current.isLoadingContas).toBe(false);
      expect(result.current.isLoadingDividas).toBe(false);
    });
  });

  describe("contas", () => {
    it("retorna contas quando a query retorna dados", () => {
      const contas = [makeConta(), makeConta({ id: "c-2", valor: 200 })];
      mockRepublicQuery({ data: contas, isLoading: false });

      const { result } = renderResumeTab();

      expect(result.current.contas).toEqual(contas);
      expect(result.current.isLoadingContas).toBe(false);
    });

    it("retorna isLoadingContas=true quando a query está carregando", () => {
      mockRepublicQuery({ data: undefined, isLoading: true });

      const { result } = renderResumeTab();

      expect(result.current.isLoadingContas).toBe(true);
    });
  });

  describe("dívidas", () => {
    it("calcula dívidas por morador a partir das queries de residentes", () => {
      mockResidentQueries({
        data: [
          [makeContaMorador({ moradorId: "r-1", valor: 30 })],
          [makeContaMorador({ moradorId: "r-2", valor: 70 })],
        ],
        isLoading: false,
      });

      const { result } = renderResumeTab();

      expect(result.current.dividas).toEqual({ "r-1": 30, "r-2": 70 });
    });

    it("retorna isLoadingDividas=true quando as queries estão carregando", () => {
      mockResidentQueries({
        data: [[], []],
        isLoading: true,
      });

      const { result } = renderResumeTab();

      expect(result.current.isLoadingDividas).toBe(true);
    });

    it("usa fallback [] quando dividasQueries.data[i] é undefined", () => {
      mockResidentQueries({
        data: [
          [makeContaMorador({ moradorId: "r-1", valor: 30 })],
          undefined,
        ],
        isLoading: false,
      } as any);

      const { result } = renderResumeTab();

      expect(result.current.dividas).toEqual({ "r-1": 30, "r-2": 0 });
    });
  });

  describe("valores calculados", () => {
    it("calcula totalValor corretamente", () => {
      const contas = [makeConta({ valor: 100 }), makeConta({ valor: 200 })];
      mockRepublicQuery({ data: contas });

      const { result } = renderResumeTab();

      expect(result.current.totalValor).toBe(300);
    });

    it("calcula totalPago corretamente", () => {
      const contas = [
        makeConta({ valor: 100, status: StatusConta.PAGA }),
        makeConta({ valor: 200, status: StatusConta.PENDENTE }),
      ];
      mockRepublicQuery({ data: contas });

      const { result } = renderResumeTab();

      expect(result.current.totalPago).toBe(100);
    });

    it("calcula totalPendente corretamente", () => {
      const contas = [
        makeConta({ valor: 100, status: StatusConta.PAGA }),
        makeConta({ valor: 200, status: StatusConta.PENDENTE }),
      ];
      mockRepublicQuery({ data: contas });

      const { result } = renderResumeTab();

      expect(result.current.totalPendente).toBe(200);
    });

    it("calcula quantidadePagas corretamente", () => {
      const contas = [
        makeConta({ status: StatusConta.PAGA }),
        makeConta({ status: StatusConta.PAGA }),
        makeConta({ status: StatusConta.PENDENTE }),
      ];
      mockRepublicQuery({ data: contas });

      const { result } = renderResumeTab();

      expect(result.current.quantidadePagas).toBe(2);
    });

    it("calcula quantidadePendentes corretamente", () => {
      const contas = [
        makeConta({ status: StatusConta.PAGA }),
        makeConta({ status: StatusConta.PENDENTE }),
        makeConta({ status: StatusConta.PENDENTE }),
      ];
      mockRepublicQuery({ data: contas });

      const { result } = renderResumeTab();

      expect(result.current.quantidadePendentes).toBe(2);
    });
  });

  describe("refresh", () => {
    it("registra refresh com chave contendo resume e republicId", () => {
      renderResumeTab();

      expect(mockRegisterRefresh).toHaveBeenCalledWith(
        expect.stringContaining("resume-rep-1-"),
        expect.any(Function),
      );
    });

    it("invalida as queries de contas e residentes ao chamar refresh", async () => {
      const invalidateSpy = jest.spyOn(queryClient, "invalidateQueries");

      renderResumeTab();

      const refreshFn = mockRegisterRefresh.mock.lastCall![1]!;

      await act(async () => {
        await refreshFn();
      });

      expect(invalidateSpy).toHaveBeenCalledTimes(2);
      expect(invalidateSpy).toHaveBeenNthCalledWith(1, {
        queryKey: expect.arrayContaining(["accounts", "republic", "rep-1"]),
      });
      expect(invalidateSpy).toHaveBeenNthCalledWith(2, {
        queryKey: expect.arrayContaining([
          "accountResidents",
          "republic",
          "rep-1",
        ]),
      });
    });
  });
});
