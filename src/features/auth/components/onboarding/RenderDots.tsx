import React from "react";
import { Animated, View } from "react-native";

interface RenderDotsProps {
  slides: any[];
  scrollX: Animated.Value;
  currentIndex: number;
  width: number;
}

const RenderDots: React.FC<RenderDotsProps> = ({
  slides,
  scrollX,
  currentIndex,
  width,
}) => (
  <View className="mb-6 flex-row items-center justify-center">
    {slides.map((slide, index) => {
      const inputRange = [
        (index - 1) * width,
        index * width,
        (index + 1) * width,
      ];

      // Animar largura dos dots (pill)
      const animatedWidth = scrollX.interpolate({
        inputRange,
        outputRange: [8, 24, 8], // inativo: 8px, ativo: 24px
        extrapolate: "clamp",
      });

      const dotOpacity = scrollX.interpolate({
        inputRange,
        outputRange: [0.3, 1, 0.3],
        extrapolate: "clamp",
      });

      return (
        <Animated.View
          key={slide.id}
          className="mx-1 h-2 rounded-full"
          style={{
            width: animatedWidth,
            opacity: dotOpacity,
            backgroundColor: index === currentIndex ? slide.color : "#6a6b5f",
          }}
        />
      );
    })}
  </View>
);

export default RenderDots;
