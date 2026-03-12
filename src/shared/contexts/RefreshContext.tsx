import React, {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from "react";

interface RefreshContextValue {
  refreshing: boolean;
  onRefresh: () => Promise<void>;
  registerRefresh: (key: string, fn: () => Promise<void>) => () => void;
}

const RefreshContext = createContext<RefreshContextValue>({
  refreshing: false,
  onRefresh: async () => {},
  registerRefresh: () => () => {},
});

export function RefreshProvider({ children }: { children: React.ReactNode }) {
  const [refreshing, setRefreshing] = useState(false);
  const callbacks = useRef<Map<string, () => Promise<void>>>(new Map());

  const registerRefresh = useCallback(
    (key: string, fn: () => Promise<void>) => {
      callbacks.current.set(key, fn);
      return () => {
        callbacks.current.delete(key);
      };
    },
    [],
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([...callbacks.current.values()].map((fn) => fn()));
    setRefreshing(false);
  }, []);

  return (
    <RefreshContext.Provider value={{ refreshing, onRefresh, registerRefresh }}>
      {children}
    </RefreshContext.Provider>
  );
}

export function useRefresh() {
  return useContext(RefreshContext);
}
