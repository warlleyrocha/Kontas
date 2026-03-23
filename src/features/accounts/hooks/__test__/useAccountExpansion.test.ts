import { act, renderHook } from "@testing-library/react-native";
import { useAccountExpansion } from "../useAccountExpansion";

// ─── Setup ────────────────────────────────────────────────────────────────────

let consoleErrorSpy: jest.SpyInstance;

beforeEach(() => {
  consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  expect(consoleErrorSpy).not.toHaveBeenCalled();
  consoleErrorSpy.mockRestore();
});

// ─── useAccountExpansion ──────────────────────────────────────────────────────

describe("useAccountExpansion — estado inicial", () => {
  it("expandedAccountId começa como null", () => {
    const { result } = renderHook(() =>
      useAccountExpansion({ republicId: "rep-1" })
    );
    expect(result.current.expandedAccountId).toBeNull();
  });

  it("expõe handleToggleExpand como função", () => {
    const { result } = renderHook(() =>
      useAccountExpansion({ republicId: "rep-1" })
    );
    expect(typeof result.current.handleToggleExpand).toBe("function");
  });
});

describe("useAccountExpansion — handleToggleExpand", () => {
  it("expande a conta ao receber seu id", () => {
    const { result } = renderHook(() =>
      useAccountExpansion({ republicId: "rep-1" })
    );
    act(() => {
      result.current.handleToggleExpand("acc-1");
    });
    expect(result.current.expandedAccountId).toBe("acc-1");
  });

  it("colapsa a conta ao receber o mesmo id uma segunda vez", () => {
    const { result } = renderHook(() =>
      useAccountExpansion({ republicId: "rep-1" })
    );
    act(() => {
      result.current.handleToggleExpand("acc-1");
    });
    act(() => {
      result.current.handleToggleExpand("acc-1");
    });
    expect(result.current.expandedAccountId).toBeNull();
  });

  it("troca para outra conta quando um id diferente é fornecido", () => {
    const { result } = renderHook(() =>
      useAccountExpansion({ republicId: "rep-1" })
    );
    act(() => {
      result.current.handleToggleExpand("acc-1");
    });
    act(() => {
      result.current.handleToggleExpand("acc-2");
    });
    expect(result.current.expandedAccountId).toBe("acc-2");
  });
});

describe("useAccountExpansion — troca de república", () => {
  it("reseta expandedAccountId quando republicId muda", () => {
    const { result, rerender } = renderHook(
      ({ republicId }) => useAccountExpansion({ republicId }),
      { initialProps: { republicId: "rep-1" } }
    );

    act(() => {
      result.current.handleToggleExpand("acc-1");
    });
    expect(result.current.expandedAccountId).toBe("acc-1");

    rerender({ republicId: "rep-2" });
    expect(result.current.expandedAccountId).toBeNull();
  });

  it("mantém expandedAccountId quando republicId não muda", () => {
    const { result, rerender } = renderHook(
      ({ republicId }) => useAccountExpansion({ republicId }),
      { initialProps: { republicId: "rep-1" } }
    );

    act(() => {
      result.current.handleToggleExpand("acc-1");
    });
    rerender({ republicId: "rep-1" });
    expect(result.current.expandedAccountId).toBe("acc-1");
  });
});
