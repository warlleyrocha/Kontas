import { useCallback, useEffect, useRef, useState } from "react";

interface UseAccountExpansionProps {
  readonly republicId: string;
}

interface UseAccountExpansionReturn {
  expandedAccountId: string | null;
  handleToggleExpand: (accountId: string) => void;
}

export function useAccountExpansion({
  republicId,
}: UseAccountExpansionProps): UseAccountExpansionReturn {
  const [expandedAccountId, setExpandedAccountId] = useState<string | null>(
    null,
  );
  const previousRepublicIdRef = useRef(republicId);

  useEffect(() => {
    if (previousRepublicIdRef.current === republicId) {
      return;
    }

    previousRepublicIdRef.current = republicId;
    setExpandedAccountId(null);
  }, [republicId]);

  const handleToggleExpand = useCallback((accountId: string) => {
    setExpandedAccountId((current) =>
      current === accountId ? null : accountId,
    );
  }, []);

  return {
    expandedAccountId,
    handleToggleExpand,
  };
}
