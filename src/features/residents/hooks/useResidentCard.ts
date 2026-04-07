import { useState } from "react";
import {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { residentCopyFeedback } from "@/src/shared/constants/pixCopyFeedback";
import { useCopyFeedback } from "@/src/shared/hooks/useCopyFeedback";
import type { ResidentResponse } from "@/src/shared/types/resident.types";

export function useResidentCard(
  morador: ResidentResponse,
  onCopyPix: (morador: ResidentResponse) => boolean | Promise<boolean>
) {
  const [expanded, setExpanded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const { handleCopy, copyFeedback } = useCopyFeedback(
    () => onCopyPix(morador),
    residentCopyFeedback
  );
  const animatedHeight = useSharedValue(0);
  const animatedOpacity = useSharedValue(0);
  const animatedStyle = useAnimatedStyle(
    () => ({
      maxHeight: animatedHeight.value,
      opacity: animatedOpacity.value,
      overflow: "hidden",
    }),
    [animatedHeight, animatedOpacity]
  );

  function toggleExpanded() {
    const nextExpanded = !expanded;
    setExpanded(nextExpanded);
    animatedHeight.value = withTiming(nextExpanded ? 500 : 0, {
      duration: 300,
    });
    animatedOpacity.value = withTiming(nextExpanded ? 1 : 0, { duration: 250 });
  }

  return {
    expanded,
    handleCopyPix: handleCopy,
    copyFeedback,
    imageError,
    animatedStyle,
    toggleExpanded,

    setImageError,
  };
}
