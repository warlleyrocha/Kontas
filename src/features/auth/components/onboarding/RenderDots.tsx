import type { FC } from "react";
import { View } from "react-native";
import Animated, {
  Extrapolation,
  interpolate,
  type SharedValue,
  useAnimatedStyle,
} from "react-native-reanimated";

import type { OnboardingSlide } from "../../constants/slides";

interface RenderDotsProps {
  slides: OnboardingSlide[];
  scrollX: SharedValue<number>;
  currentIndex: number;
  width: number;
}

interface RenderDotItemProps {
  readonly slide: OnboardingSlide;
  readonly index: number;
  readonly scrollX: SharedValue<number>;
  readonly currentIndex: number;
  readonly width: number;
}

function RenderDotItem({
  slide,
  index,
  scrollX,
  currentIndex,
  width,
}: RenderDotItemProps) {
  const animatedStyle = useAnimatedStyle(() => {
    const inputRange = [
      (index - 1) * width,
      index * width,
      (index + 1) * width,
    ];

    return {
      width: interpolate(
        scrollX.value,
        inputRange,
        [8, 24, 8],
        Extrapolation.CLAMP
      ),
      opacity: interpolate(
        scrollX.value,
        inputRange,
        [0.3, 1, 0.3],
        Extrapolation.CLAMP
      ),
    };
  });

  return (
    <Animated.View
      className="mx-1 h-2 rounded-full"
      style={[
        animatedStyle,
        {
          backgroundColor:
            index === currentIndex ? slide.color : "#337176" + "40",
        },
      ]}
    />
  );
}

const RenderDots: FC<RenderDotsProps> = ({
  slides,
  scrollX,
  currentIndex,
  width,
}) => (
  <View className="mb-6 flex-row items-center justify-center">
    {slides.map((slide, index) => (
      <RenderDotItem
        key={slide.id}
        slide={slide}
        index={index}
        scrollX={scrollX}
        currentIndex={currentIndex}
        width={width}
      />
    ))}
  </View>
);

export default RenderDots;
