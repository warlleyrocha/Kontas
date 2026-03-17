import type { ResidentResponse } from "@/src/shared/types/resident.types";

import { useEffect, useRef, useState } from "react";
import {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

export function useResidentCard(
  morador: ResidentResponse,
  onCopyPix: (morador: ResidentResponse) => void
) {
  const [expanded, setExpanded] = useState(false);
  const [copiado, setCopiado] = useState(false);
  const [imageError, setImageError] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const animatedHeight = useSharedValue(0);
  const animatedOpacity = useSharedValue(0);
  const animatedStyle = useAnimatedStyle(
    () => ({
      maxHeight: animatedHeight.value,
      opacity: animatedOpacity.value,
      overflow: "hidden",
    }),
    [animatedHeight, animatedOpacity],
  );

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  function toggleExpanded() {
    const nextExpanded = !expanded;
    setExpanded(nextExpanded);
    animatedHeight.value = withTiming(nextExpanded ? 500 : 0, { duration: 300 });
    animatedOpacity.value = withTiming(nextExpanded ? 1 : 0, { duration: 250 });
  }

  function handleCopyPix() {
    onCopyPix(morador);
    setCopiado(true);
    timeoutRef.current = setTimeout(() => setCopiado(false), 2000);
  }

  return {
    expanded,
    copiado,
    imageError,
    animatedStyle,
    toggleExpanded,
    handleCopyPix,
    setImageError,
  };
}
