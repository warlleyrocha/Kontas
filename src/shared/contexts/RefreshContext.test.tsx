import type { ReactNode } from "react";
import { act, renderHook, waitFor } from "@testing-library/react-native";
import { RefreshProvider, useRefresh } from "./RefreshContext";

function createWrapper() {
  return function Wrapper({ children }: { children: ReactNode }) {
    return <RefreshProvider>{children}</RefreshProvider>;
  };
}

function createDeferred() {
  let resolve!: () => void;
  const promise = new Promise<void>((res) => {
    resolve = res;
  });

  return { promise, resolve };
}

describe("RefreshContext", () => {
  it("retorna o valor padrão fora do provider", async () => {
    const { result } = renderHook(() => useRefresh());

    expect(result.current.refreshing).toBe(false);

    await act(async () => {
      await result.current.onRefresh();
      await result.current.refreshAll();
    });

    const unregister = result.current.registerRefresh("key", async () => {});

    expect(typeof unregister).toBe("function");
    unregister();
  });

  it("executa callbacks registrados no onRefresh e controla o estado refreshing", async () => {
    const deferred = createDeferred();
    const refreshCallback = jest.fn(() => deferred.promise);
    const { result } = renderHook(() => useRefresh(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.registerRefresh("dashboard", refreshCallback);
    });

    let refreshPromise!: Promise<void>;
    act(() => {
      refreshPromise = result.current.onRefresh();
    });

    expect(refreshCallback).toHaveBeenCalledTimes(1);
    expect(result.current.refreshing).toBe(true);

    await act(async () => {
      deferred.resolve();
      await refreshPromise;
    });

    expect(result.current.refreshing).toBe(false);
  });

  it("executa refreshAll com múltiplos callbacks e tolera rejeição", async () => {
    const successCallback = jest.fn().mockResolvedValue(undefined);
    const failureCallback = jest.fn().mockRejectedValue(new Error("falha"));
    const { result } = renderHook(() => useRefresh(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.registerRefresh("success", successCallback);
      result.current.registerRefresh("failure", failureCallback);
    });

    await act(async () => {
      await result.current.refreshAll();
    });

    expect(successCallback).toHaveBeenCalledTimes(1);
    expect(failureCallback).toHaveBeenCalledTimes(1);
    expect(result.current.refreshing).toBe(false);
  });

  it("remove callback registrado ao chamar unregister", async () => {
    const firstCallback = jest.fn().mockResolvedValue(undefined);
    const secondCallback = jest.fn().mockResolvedValue(undefined);
    const { result } = renderHook(() => useRefresh(), {
      wrapper: createWrapper(),
    });

    let unregister!: () => void;
    act(() => {
      unregister = result.current.registerRefresh("first", firstCallback);
      result.current.registerRefresh("second", secondCallback);
    });

    act(() => {
      unregister();
    });

    await act(async () => {
      await result.current.onRefresh();
    });

    await waitFor(() => {
      expect(firstCallback).not.toHaveBeenCalled();
      expect(secondCallback).toHaveBeenCalledTimes(1);
    });
  });
});
