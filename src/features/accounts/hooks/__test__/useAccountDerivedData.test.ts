import { renderHook } from "@testing-library/react-native";
import {
  StatusConta,
  type Conta,
} from "@/src/features/accounts/types/account.types";
import { useAccountDerivedData } from "../useAccountList/useAccountDerivedData";

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Reproduz exatamente o cálculo de mesReferencia do hook */
function mesRef(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function makeConta(
  overrides: Partial<Conta> & { id: string; vencimento: string }
): Conta {
  return {
    descricao: "Conta teste",
    valor: 100,
    status: StatusConta.PENDENTE,
    republicaId: "rep-1",
    criadoPorId: "u-1",
    criadoPorNome: "Admin",
    metodoPagamento: null,
    pago: false,
    criadoEm: "2026-01-01T12:00:00",
    atualizadoEm: "2026-01-01T12:00:00",
    ...overrides,
  };
}

// Usa horário meio-dia para evitar ambiguidade de fuso horário UTC
const CONTA_JAN = makeConta({ id: "c1", vencimento: "2026-01-15T12:00:00" });
const CONTA_JAN2 = makeConta({ id: "c2", vencimento: "2026-01-28T12:00:00" });
const CONTA_MAR = makeConta({ id: "c3", vencimento: "2026-03-10T12:00:00" });
const CONTA_PAGA = makeConta({
  id: "c4",
  vencimento: "2026-01-20T12:00:00",
  status: StatusConta.PAGA,
});

const MES_JAN = mesRef("2026-01-15T12:00:00");
const MES_MAR = mesRef("2026-03-10T12:00:00");

// ─── Setup ────────────────────────────────────────────────────────────────────

let consoleErrorSpy: jest.SpyInstance;

beforeEach(() => {
  consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  expect(consoleErrorSpy).not.toHaveBeenCalled();
  consoleErrorSpy.mockRestore();
});

// ─── useAccountDerivedData ────────────────────────────────────────────────────

describe("useAccountDerivedData — mesesDisponiveis", () => {
  it("retorna lista vazia quando não há contas", () => {
    const { result } = renderHook(() =>
      useAccountDerivedData({ contas: [], mesSelecionado: "todos" })
    );
    expect(result.current.mesesDisponiveis).toEqual([]);
  });

  it("retorna os meses únicos existentes nas contas", () => {
    const { result } = renderHook(() =>
      useAccountDerivedData({
        contas: [CONTA_JAN, CONTA_MAR],
        mesSelecionado: "todos",
      })
    );
    expect(result.current.mesesDisponiveis).toContain(MES_JAN);
    expect(result.current.mesesDisponiveis).toContain(MES_MAR);
  });

  it("não repete meses quando há múltiplas contas no mesmo mês", () => {
    const { result } = renderHook(() =>
      useAccountDerivedData({
        contas: [CONTA_JAN, CONTA_JAN2, CONTA_PAGA],
        mesSelecionado: "todos",
      })
    );
    const occurrences = result.current.mesesDisponiveis.filter(
      (m) => m === MES_JAN
    ).length;
    expect(occurrences).toBe(1);
  });

  it("retorna meses em ordem cronológica crescente", () => {
    const { result } = renderHook(() =>
      useAccountDerivedData({
        contas: [CONTA_MAR, CONTA_JAN],
        mesSelecionado: "todos",
      })
    );
    const [primeiro, segundo] = result.current.mesesDisponiveis;
    expect(primeiro < segundo).toBe(true);
  });
});

describe("useAccountDerivedData — mesReferencia por conta", () => {
  it("adiciona mesReferencia correto às contas adaptadas", () => {
    const { result } = renderHook(() =>
      useAccountDerivedData({ contas: [CONTA_JAN], mesSelecionado: "todos" })
    );
    const conta = result.current.contasOrdenadas.abertas[0];
    expect(conta.mesReferencia).toBe(MES_JAN);
  });
});

describe("useAccountDerivedData — contasOrdenadas com mesSelecionado='todos'", () => {
  it("abertas contém todas as contas não pagas", () => {
    const { result } = renderHook(() =>
      useAccountDerivedData({
        contas: [CONTA_JAN, CONTA_MAR, CONTA_PAGA],
        mesSelecionado: "todos",
      })
    );
    const ids = result.current.contasOrdenadas.abertas.map((c) => c.id);
    expect(ids).toContain("c1");
    expect(ids).toContain("c3");
    expect(ids).not.toContain("c4");
  });

  it("pagas contém apenas contas com status PAGA", () => {
    const { result } = renderHook(() =>
      useAccountDerivedData({
        contas: [CONTA_JAN, CONTA_PAGA],
        mesSelecionado: "todos",
      })
    );
    const ids = result.current.contasOrdenadas.pagas.map((c) => c.id);
    expect(ids).toEqual(["c4"]);
  });

  it("inclui status PENDENTE e ATRASADA em abertas", () => {
    const atrasada = makeConta({
      id: "c5",
      vencimento: "2026-02-10T12:00:00",
      status: StatusConta.ATRASADA,
    });
    const { result } = renderHook(() =>
      useAccountDerivedData({
        contas: [CONTA_JAN, atrasada],
        mesSelecionado: "todos",
      })
    );
    const ids = result.current.contasOrdenadas.abertas.map((c) => c.id);
    expect(ids).toContain("c1");
    expect(ids).toContain("c5");
  });
});

describe("useAccountDerivedData — contasOrdenadas com filtro de mês", () => {
  it("retorna apenas contas do mês selecionado", () => {
    const { result } = renderHook(() =>
      useAccountDerivedData({
        contas: [CONTA_JAN, CONTA_MAR],
        mesSelecionado: MES_JAN,
      })
    );
    const ids = result.current.contasOrdenadas.abertas.map((c) => c.id);
    expect(ids).toContain("c1");
    expect(ids).not.toContain("c3");
  });

  it("retorna listas vazias quando nenhuma conta pertence ao mês selecionado", () => {
    const { result } = renderHook(() =>
      useAccountDerivedData({
        contas: [CONTA_JAN],
        mesSelecionado: "2025-12",
      })
    );
    expect(result.current.contasOrdenadas.abertas).toHaveLength(0);
    expect(result.current.contasOrdenadas.pagas).toHaveLength(0);
  });

  it("filtra e separa corretamente abertas e pagas no mês selecionado", () => {
    const { result } = renderHook(() =>
      useAccountDerivedData({
        contas: [CONTA_JAN, CONTA_PAGA, CONTA_MAR],
        mesSelecionado: MES_JAN,
      })
    );
    expect(result.current.contasOrdenadas.abertas.map((c) => c.id)).toEqual([
      "c1",
    ]);
    expect(result.current.contasOrdenadas.pagas.map((c) => c.id)).toEqual([
      "c4",
    ]);
  });
});
