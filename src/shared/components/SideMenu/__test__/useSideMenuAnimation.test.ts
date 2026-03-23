import { act, renderHook } from "@testing-library/react-native";
import * as reanimated from "react-native-reanimated";
import { useSideMenuAnimation } from "../useSideMenuAnimation";

jest.mock("react-native-reanimated", () =>
  require("react-native-reanimated/mock")
);
jest.mock("react-native-worklets", () => ({
  // factory sem variável externa — evita problema de hoisting
  scheduleOnRN: jest.fn((fn: () => void) => fn()),
}));

// ─── Setup ────────────────────────────────────────────────────────────────────

let consoleErrorSpy: jest.SpyInstance;

beforeEach(() => {
  jest.clearAllMocks();
  consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  expect(consoleErrorSpy).not.toHaveBeenCalled();
  consoleErrorSpy.mockRestore();
});

// ─── L25 — guard de dupla chamada ─────────────────────────────────────────────

describe("useSideMenuAnimation — closeMenu (L25)", () => {
  it("não chama onRequestClose na segunda invocação enquanto o fechamento está em progresso", () => {
    const onRequestClose = jest.fn();
    const { result } = renderHook(() =>
      useSideMenuAnimation({ menuWidth: 300, onRequestClose })
    );

    act(() => {
      result.current.closeMenu();
    });
    const firstCallCount = onRequestClose.mock.calls.length;

    act(() => {
      result.current.closeMenu();
    });

    expect(onRequestClose.mock.calls.length).toBe(firstCallCount);
  });
});

// ─── L30 — callback do withTiming com finished=false ─────────────────────────

describe("useSideMenuAnimation — closeMenu (L30)", () => {
  it("não chama onRequestClose quando a animação termina com finished=false", () => {
    // useEffect chama withTiming(1, ...) sem callback;
    // closeMenu chama withTiming(0, ..., cb).
    // A spy invoca cb?.(false) — só o segundo call tem callback, e com false
    // onRequestClose não deve ser chamado.
    jest.spyOn(reanimated, "withTiming").mockImplementation(
      jest.fn((_toValue, _config, cb) => {
        cb?.(false);
        return 0;
      })
    );

    const onRequestClose = jest.fn();
    const { result } = renderHook(() =>
      useSideMenuAnimation({ menuWidth: 300, onRequestClose })
    );

    act(() => {
      result.current.closeMenu();
    });

    expect(onRequestClose).not.toHaveBeenCalled();
  });
});
