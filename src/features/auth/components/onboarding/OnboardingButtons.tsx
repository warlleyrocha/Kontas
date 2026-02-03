import React from "react";
import { Animated, Text, TouchableOpacity, View } from "react-native";

interface OnboardingButtonsProps {
  isLastSlide: boolean;
  currentIndex: number;
  slides: any[];
  handleNext: () => void;
  handleSkip: () => void;
  scrollX: Animated.Value;
  width: number;
}

const OnboardingButtons: React.FC<OnboardingButtonsProps> = ({
  isLastSlide,
  currentIndex,
  slides,
  handleNext,
  handleSkip,
  scrollX,
  width,
}) => (
  <View className="gap-1">
    <TouchableOpacity
      className="flex-row items-center justify-center rounded-2xl py-4 shadow-lg w-full"
      style={{ backgroundColor: slides[currentIndex].color }}
      onPress={handleNext}
      activeOpacity={0.9}
    >
      <Text className="text-center text-[16px] leading-[18px] font-mulish-medium text-white w-full">
        {isLastSlide ? "Começar Agora" : "Continuar"}
      </Text>
    </TouchableOpacity>

    <Animated.View
      style={{
        opacity: scrollX.interpolate({
          inputRange: [0, width * 0.3, width * 0.7, width],
          outputRange: [1, 0.7, 0.2, 0],
          extrapolate: "clamp",
        }),
        height: currentIndex === 0 ? undefined : 0,
        overflow: "hidden",
      }}
    >
      {currentIndex === 0 && (
        <TouchableOpacity
          className="flex-row items-center justify-center rounded-full py-4 w-full"
          onPress={handleSkip}
          activeOpacity={0.7}
        >
          <Text className="text-center text-[16px] leading-[18px] font-mulish-medium text-slate-500 w-full">
            Pular
          </Text>
        </TouchableOpacity>
      )}
    </Animated.View>
  </View>
);

export default OnboardingButtons;
