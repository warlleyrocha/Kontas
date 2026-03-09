import {
  useAnimatedScrollHandler,
  useSharedValue,
} from "react-native-reanimated";

export function useOnboardingAnimation() {
  const scrollX = useSharedValue(0);

  const handleScroll = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollX.value = event.contentOffset.x;
    },
  });

  return {
    scrollX,
    handleScroll,
  };
}
