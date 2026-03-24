import { act, renderHook } from "@testing-library/react-native";

import { type CopyFeedbackMap, useCopyFeedback } from "./useCopyFeedback";

const feedbackMap: CopyFeedbackMap = {
  idle: {
    accessibilityLabel: "Copiar",
    icon: null,
    text: "Copiar",
  },
  success: {
    accessibilityLabel: "Copiado",
    icon: null,
    text: "Copiado",
  },
  error: {
    accessibilityLabel: "Erro ao copiar",
    icon: null,
    text: "Erro",
  },
};

describe("useCopyFeedback", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  it("define status de erro e retorna false quando onCopy lança exceção", async () => {
    const onCopy = jest.fn(async () => {
      throw new Error("clipboard");
    });

    const { result } = renderHook(() => useCopyFeedback(onCopy, feedbackMap));
    let copied = true;

    await act(async () => {
      copied = await result.current.handleCopy();
    });

    expect(copied).toBe(false);
    expect(result.current.status).toBe("error");
    expect(result.current.isSuccess).toBe(false);
    expect(result.current.copyFeedback.accessibilityLabel).toBe(
      "Erro ao copiar"
    );
  });

  it("reinicia o timeout de reset quando handleCopy é chamado novamente", async () => {
    const onCopy = jest.fn(async () => true);
    const { result } = renderHook(() =>
      useCopyFeedback(onCopy, feedbackMap, 100)
    );

    await act(async () => {
      await result.current.handleCopy();
    });

    act(() => {
      jest.advanceTimersByTime(50);
    });

    await act(async () => {
      await result.current.handleCopy();
    });

    act(() => {
      jest.advanceTimersByTime(60);
    });

    expect(result.current.status).toBe("success");

    act(() => {
      jest.advanceTimersByTime(40);
    });

    expect(result.current.status).toBe("idle");
  });
});
