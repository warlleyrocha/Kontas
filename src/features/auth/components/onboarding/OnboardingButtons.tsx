import type { FC } from "react";
import { Text, TouchableOpacity, View } from "react-native";

import type { OnboardingSlide } from "../../constants/slides";

interface OnboardingButtonsProps {
  isLastSlide: boolean;
  currentIndex: number;
  slides: OnboardingSlide[];
  handleNext: () => void;
}

const OnboardingButtons: FC<OnboardingButtonsProps> = ({
  isLastSlide,
  currentIndex,
  slides,
  handleNext,
}) => {
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
    </View>
  );
};

export default OnboardingButtons;
