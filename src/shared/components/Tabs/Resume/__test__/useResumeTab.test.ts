import { renderHook } from "@testing-library/react-native";

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

function mockResidentQueries(results: object[] = []) {
  jest.mocked(useAccountsByResidentQueries).mockReturnValue(
    results as any
  );
}

function renderResumeTab(residents = mockResidents, republicId = "rep-1") {
  return renderHook(() => useResumeTab({ residents, republicId }));
}

// ─── Setup ───────────────────────────────────────────────────────────────────

beforeEach(() => {
  jest.clearAllMocks();
  mockRepublicQuery();
  mockResidentQueries([{ data: [], isLoading: false }, { data: [], isLoading: false }]);
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
    });

    it("repassa republicId para useAccountsByRepublicQuery", () => {
      renderResumeTab(mockResidents, "rep-42");

      expect(jest.mocked(useAccountsByRepublicQuery)).toHaveBeenCalledWith(
        "rep-42"
      );
    });

    it("passa os ids dos moradores para useAccountsByResidentQueries", () => {
      renderResumeTab();

      expect(jest.mocked(useAccountsByResidentQueries)).toHaveBeenCalledWith([
        "r-1",
        "r-2",
      ]);
    });
  });

  describe("contas", () => {
    it("repassa contas da query de república", () => {
      const contas = [makeConta({ id: "c-1" }), makeConta({ id: "c-2" })];
      mockRepublicQuery({ data: contas });

      const { result } = renderResumeTab();

      expect(result.current.contas).toEqual(contas);
    });

    it("repassa isLoading da query de república como isLoadingContas", () => {
      mockRepublicQuery({ isLoading: true });

      const { result } = renderResumeTab();

      expect(result.current.isLoadingContas).toBe(true);
    });
  });

  describe("dividas", () => {
    it("não chama useAccountsByResidentQueries com ids quando residents está vazio", () => {
      mockResidentQueries([]);

      renderResumeTab([]);

      expect(jest.mocked(useAccountsByResidentQueries)).toHaveBeenCalledWith(
        []
      );
    });

    it("é true quando alguma query de morador ainda está carregando", () => {
      mockResidentQueries([
        { data: [], isLoading: true },
        { data: [], isLoading: false },
      ]);

      const { result } = renderResumeTab();

      expect(result.current.isLoadingDividas).toBe(true);
    });

    it("é false quando todas as queries de morador terminaram", () => {
      mockResidentQueries([
        { data: [], isLoading: false },
        { data: [], isLoading: false },
      ]);

      const { result } = renderResumeTab();

      expect(result.current.isLoadingDividas).toBe(false);
    });

    it("constrói o mapa de dívidas somando apenas PENDENTE e AGUARDANDO_CONFIRMACAO", () => {
      mockResidentQueries([
        {
          data: [
            makeContaMorador({ status: StatusPagamento.PENDENTE, valor: 80 }),
            makeContaMorador({
              status: StatusPagamento.AGUARDANDO_CONFIRMACAO,
              valor: 20,
            }),
            makeContaMorador({ status: StatusPagamento.PAGO, valor: 999 }),
          ],
          isLoading: false,
        },
        {
          data: [makeContaMorador({ status: StatusPagamento.PAGO, valor: 200 })],
          isLoading: false,
        },
      ]);

      const { result } = renderResumeTab();

      expect(result.current.dividas["r-1"]).toBe(100); // 80 + 20
      expect(result.current.dividas["r-2"]).toBe(0); // só PAGO, não conta
    });

    it("atribui 0 quando morador não possui contas pendentes", () => {
      mockResidentQueries([{ data: [], isLoading: false }]);

      const { result } = renderResumeTab([mockResidents[0]]);

      expect(result.current.dividas["r-1"]).toBe(0);
    });
  });

  describe("valores calculados", () => {
    it("calcula totalValor somando todos os valores das contas", () => {
      mockRepublicQuery({
        data: [
          makeConta({ valor: 100, status: StatusConta.PAGA }),
          makeConta({ id: "c-2", valor: 200, status: StatusConta.PENDENTE }),
        ],
      });

      const { result } = renderResumeTab();

      expect(result.current.totalValor).toBe(300);
    });

    it("calcula totalPago somando apenas contas com status PAGA", () => {
      mockRepublicQuery({
        data: [
          makeConta({ valor: 100, status: StatusConta.PAGA }),
          makeConta({ id: "c-2", valor: 200, status: StatusConta.PAGA }),
          makeConta({ id: "c-3", valor: 50, status: StatusConta.PENDENTE }),
        ],
      });

      const { result } = renderResumeTab();

      expect(result.current.totalPago).toBe(300);
    });

    it("calcula totalPendente somando contas sem status PAGA", () => {
      mockRepublicQuery({
        data: [
          makeConta({ valor: 50, status: StatusConta.PAGA }),
          makeConta({ id: "c-2", valor: 80, status: StatusConta.PENDENTE }),
          makeConta({ id: "c-3", valor: 70, status: StatusConta.ATRASADA }),
        ],
      });

      const { result } = renderResumeTab();

      expect(result.current.totalPendente).toBe(150);
    });

    it("calcula quantidadePagas corretamente", () => {
      mockRepublicQuery({
        data: [
          makeConta({ status: StatusConta.PAGA }),
          makeConta({ id: "c-2", status: StatusConta.PAGA }),
          makeConta({ id: "c-3", status: StatusConta.PENDENTE }),
        ],
      });

      const { result } = renderResumeTab();

      expect(result.current.quantidadePagas).toBe(2);
    });

    it("calcula quantidadePendentes corretamente", () => {
      mockRepublicQuery({
        data: [
          makeConta({ status: StatusConta.PAGA }),
          makeConta({ id: "c-2", status: StatusConta.PENDENTE }),
          makeConta({ id: "c-3", status: StatusConta.ATRASADA }),
        ],
      });

      const { result } = renderResumeTab();

      expect(result.current.quantidadePendentes).toBe(2);
    });
  });
});
