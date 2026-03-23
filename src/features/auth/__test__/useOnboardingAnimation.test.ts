import { renderHook } from "@testing-library/react-native";

import { useOnboardingAnimation } from "../hooks/useOnboardingAnimation";

jest.mock("react-native-reanimated", () => {
  const actual = jest.requireActual("react-native-reanimated/mock");
  return {
    ...actual,
    useSharedValue: (initial: number) => ({ value: initial }),
    useAnimatedScrollHandler: (handlers: {
      onScroll?: (event: any) => void;
    }) => {
      return (event: any) => {
        handlers.onScroll?.(event);
      };
    },
  };
});

describe("useOnboardingAnimation", () => {
  it("retorna scrollX e handleScroll", () => {
    const { result } = renderHook(() => useOnboardingAnimation());
    expect(result.current.scrollX).toBeDefined();
    expect(typeof result.current.handleScroll).toBe("function");
  });

  it("scrollX inicia em 0", () => {
    const { result } = renderHook(() => useOnboardingAnimation());
    expect(result.current.scrollX.value).toBe(0);
  });

  it("atualiza scrollX.value ao chamar handleScroll (linha 11)", () => {
    const { result } = renderHook(() => useOnboardingAnimation());

    result.current.handleScroll({ contentOffset: { x: 390 } });

    expect(result.current.scrollX.value).toBe(390);
  });
});
