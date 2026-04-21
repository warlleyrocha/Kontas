import { type ReactNode, useEffect, useRef, useState } from "react";

type CopyHandler = () => boolean | Promise<boolean>;

type CopyStatus = "idle" | "success" | "error";

type CopyFeedbackItem = {
  accessibilityLabel: string;
  icon: ReactNode;
  text: string;
};

export type CopyFeedbackMap = Record<CopyStatus, CopyFeedbackItem>;

export function useCopyFeedback(
  onCopy: CopyHandler,
  feedbackMap: CopyFeedbackMap,
  resetDelay = 2000
) {
  const [status, setStatus] = useState<CopyStatus>("idle");
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  function scheduleReset(nextStatus: CopyStatus) {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    setStatus(nextStatus);

    timeoutRef.current = setTimeout(() => {
      setStatus("idle");
    }, resetDelay);
  }

  async function handleCopy() {
    try {
      const success = await onCopy();

      if (!success) {
        scheduleReset("error");
        return false;
      }
    } catch {
      scheduleReset("error");
      return false;
    }

    scheduleReset("success");
    return true;
  }

  return {
    status,
    isSuccess: status === "success",
    handleCopy,
    copyFeedback: feedbackMap[status],
  };
}
