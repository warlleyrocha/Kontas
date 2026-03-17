import { LinearGradient } from "expo-linear-gradient";
import type { FC } from "react";
import { Image, Text, View } from "react-native";
import Animated, {
  Extrapolation,
  interpolate,
  type SharedValue,
  useAnimatedStyle,
} from "react-native-reanimated";

import type { OnboardingSlide } from "../../constants/slides";

interface RenderSlideProps {
  item: OnboardingSlide;
  index: number;
  width: number;
  height: number;
  scrollX: SharedValue<number>;
}

const RenderSlide: FC<RenderSlideProps> = ({
  item,
  index,
  width,
  height,
  scrollX,
}) => {
  const animatedStyle = useAnimatedStyle(() => {
    const inputRange = [
      (index - 1) * width,
      index * width,
      (index + 1) * width,
    ];

    return {
      transform: [
        {
          scale: interpolate(
            scrollX.value,
            inputRange,
            [0.8, 1, 0.8],
            Extrapolation.CLAMP
          ),
        },
      ],
      opacity: interpolate(
        scrollX.value,
        inputRange,
        [0.4, 1, 0.4],
        Extrapolation.CLAMP
      ),
    };
  });

  return (
    <View className="flex-1 items-center px-6" style={{ width }}>
      <Animated.View style={animatedStyle} className="mb-6 items-center">
        <View style={{ position: "relative" }}>
          <Image
            source={{ uri: item.image }}
            style={{
              width: width * 1,
              height: height * 0.51,
              borderBottomLeftRadius: 8,
              borderBottomRightRadius: 8,
            }}
            resizeMode="cover"
          />
          {/* Gradiente para fade out no bottom */}
          <LinearGradient
            colors={["transparent", "#FAFAFA"]}
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              bottom: 0,
              height: 80,
            }}
            pointerEvents="none"
          />
        </View>
      </Animated.View>

      <View className="items-center mt-12 px-4">
        <Text
          className="mb-3 text-center text-3xl font-bold"
          style={{ color: item.color }}
        >
          {item.title}
        </Text>
        <Text className="text-center text-lg leading-7 text-gray-500">
          {item.description}
        </Text>
      </View>
    </View>
  );
};

export default RenderSlide;
