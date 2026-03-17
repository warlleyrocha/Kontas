import type { FC } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import Animated, {
  Extrapolation,
  interpolate,
  type SharedValue,
  useAnimatedStyle,
} from "react-native-reanimated";

import type { OnboardingSlide } from "../../constants/slides";

interface OnboardingButtonsProps {
  isLastSlide: boolean;
  currentIndex: number;
  slides: OnboardingSlide[];
  handleNext: () => void;
  handleSkip: () => void;
  scrollX: SharedValue<number>;
  width: number;
}

const OnboardingButtons: FC<OnboardingButtonsProps> = ({
  isLastSlide,
  currentIndex,
  slides,
  handleNext,
  handleSkip,
  scrollX,
  width,
}) => {
  const skipAnimatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      scrollX.value,
      [0, width * 0.3, width * 0.7, width],
      [1, 0.7, 0.2, 0],
      Extrapolation.CLAMP
    ),
  }));

  return (
    <View className="gap-1">
      <TouchableOpacity
        className="w-full flex-row items-center justify-center rounded-2xl py-4 shadow-lg"
        style={{ backgroundColor: slides[currentIndex].color }}
        onPress={handleNext}
        activeOpacity={0.9}
      >
        <Text className="w-full text-center font-mulish-medium text-[16px] leading-[18px] text-white">
          {isLastSlide ? "Começar Agora" : "Continuar"}
        </Text>
      </TouchableOpacity>

      <Animated.View
        style={[
          skipAnimatedStyle,
          currentIndex === 0
            ? { overflow: "hidden" }
            : { height: 0, overflow: "hidden" },
        ]}
      >
        {currentIndex === 0 && (
          <TouchableOpacity
            className="w-full flex-row items-center justify-center rounded-full py-4"
            onPress={handleSkip}
            activeOpacity={0.7}
          >
            <Text className="w-full text-center font-mulish-medium text-[16px] leading-[18px] text-teal/60">
              Pular
            </Text>
          </TouchableOpacity>
        )}
      </Animated.View>
    </View>
  );
};

export default OnboardingButtons;
