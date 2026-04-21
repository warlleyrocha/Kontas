import { act, renderHook } from "@testing-library/react-native";
import { useAccountFilters } from "../useAccountFilters";

// ─── Setup ────────────────────────────────────────────────────────────────────

let consoleErrorSpy: jest.SpyInstance;

beforeEach(() => {
  consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  expect(consoleErrorSpy).not.toHaveBeenCalled();
  consoleErrorSpy.mockRestore();
});

// ─── useAccountFilters ────────────────────────────────────────────────────────

describe("useAccountFilters — estado inicial", () => {
  it("mesSelecionado começa como 'todos'", () => {
    const { result } = renderHook(() => useAccountFilters());
    expect(result.current.mesSelecionado).toBe("todos");
  });

  it("mostrarContasAbertas começa como true", () => {
    const { result } = renderHook(() => useAccountFilters());
    expect(result.current.mostrarContasAbertas).toBe(true);
  });

  it("mostrarContasPagas começa como false", () => {
    const { result } = renderHook(() => useAccountFilters());
    expect(result.current.mostrarContasPagas).toBe(false);
  });

  it("expõe os três setters como funções", () => {
    const { result } = renderHook(() => useAccountFilters());
    expect(typeof result.current.setMesSelecionado).toBe("function");
    expect(typeof result.current.setMostrarContasAbertas).toBe("function");
    expect(typeof result.current.setMostrarContasPagas).toBe("function");
  });
});

describe("useAccountFilters — setMesSelecionado", () => {
  it("atualiza mesSelecionado para um mês específico", () => {
    const { result } = renderHook(() => useAccountFilters());
    act(() => {
      result.current.setMesSelecionado("2026-03");
    });
    expect(result.current.mesSelecionado).toBe("2026-03");
  });

  it("atualiza mesSelecionado de volta para 'todos'", () => {
    const { result } = renderHook(() => useAccountFilters());
    act(() => {
      result.current.setMesSelecionado("2026-03");
    });
    act(() => {
      result.current.setMesSelecionado("todos");
    });
    expect(result.current.mesSelecionado).toBe("todos");
  });
});

describe("useAccountFilters — setMostrarContasAbertas", () => {
  it("atualiza mostrarContasAbertas para false", () => {
    const { result } = renderHook(() => useAccountFilters());
    act(() => {
      result.current.setMostrarContasAbertas(false);
    });
    expect(result.current.mostrarContasAbertas).toBe(false);
  });

  it("restaura mostrarContasAbertas para true", () => {
    const { result } = renderHook(() => useAccountFilters());
    act(() => {
      result.current.setMostrarContasAbertas(false);
    });
    act(() => {
      result.current.setMostrarContasAbertas(true);
    });
    expect(result.current.mostrarContasAbertas).toBe(true);
  });
});

describe("useAccountFilters — setMostrarContasPagas", () => {
  it("atualiza mostrarContasPagas para true", () => {
    const { result } = renderHook(() => useAccountFilters());
    act(() => {
      result.current.setMostrarContasPagas(true);
    });
    expect(result.current.mostrarContasPagas).toBe(true);
  });

  it("restaura mostrarContasPagas para false", () => {
    const { result } = renderHook(() => useAccountFilters());
    act(() => {
      result.current.setMostrarContasPagas(true);
    });
    act(() => {
      result.current.setMostrarContasPagas(false);
    });
    expect(result.current.mostrarContasPagas).toBe(false);
  });
});
