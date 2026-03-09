import { useCallback, useEffect, useRef } from "react";
import {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";

interface UseSideMenuAnimationParams {
  readonly menuWidth: number;
  readonly onRequestClose: () => void;
}

export function useSideMenuAnimation({
  menuWidth,
  onRequestClose,
}: UseSideMenuAnimationParams) {
  const progress = useSharedValue(0);
  const isClosingRef = useRef(false);

  const closeMenu = useCallback(() => {
    if (isClosingRef.current) {
      return;
    }

    isClosingRef.current = true;
    progress.value = withTiming(0, { duration: 250 }, (finished) => {
      if (finished) {
        scheduleOnRN(onRequestClose);
      }
    });
  }, [onRequestClose, progress]);

  useEffect(() => {
    isClosingRef.current = false;
    progress.value = withTiming(1, { duration: 300 });
  }, [progress]);

  const backdropAnimatedStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
  }));

  const panelAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: interpolate(
          progress.value,
          [0, 1],
          [-menuWidth, 0],
          Extrapolation.CLAMP,
        ),
      },
    ],
  }));

  return {
    closeMenu,
    backdropAnimatedStyle,
    panelAnimatedStyle,
  };
}
