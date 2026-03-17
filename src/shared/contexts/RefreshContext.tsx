import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";

interface RefreshContextValue {
  refreshing: boolean;
  onRefresh: () => Promise<void>;
  refreshAll: () => Promise<void>;
  registerRefresh: (key: string, fn: () => Promise<void>) => () => void;
}

const RefreshContext = createContext<RefreshContextValue>({
  refreshing: false,
  onRefresh: async () => {},
  refreshAll: async () => {},
  registerRefresh: () => () => {},
});

export function RefreshProvider({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const [refreshing, setRefreshing] = useState(false);
  const callbacks = useRef<Map<string, () => Promise<void>>>(new Map());

  const refreshAll = useCallback(async () => {
    await Promise.allSettled([...callbacks.current.values()].map((fn) => fn()));
  }, []);

  const registerRefresh = useCallback(
    (key: string, fn: () => Promise<void>) => {
      callbacks.current.set(key, fn);
      return () => {
        callbacks.current.delete(key);
      };
    },
    []
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refreshAll();
    } finally {
      setRefreshing(false);
    }
  }, [refreshAll]);

  const value = useMemo(
    () => ({ refreshing, onRefresh, refreshAll, registerRefresh }),
    [refreshing, onRefresh, refreshAll, registerRefresh]
  );

  return (
    <RefreshContext.Provider value={value}>{children}</RefreshContext.Provider>
  );
}

export function useRefresh() {
  return useContext(RefreshContext);
}
