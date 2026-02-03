import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Animated, Image, Text, View } from "react-native";

interface RenderSlideProps {
  item: any;
  index: number;
  width: number;
  height: number;
  scrollX: Animated.Value;
}

const RenderSlide: React.FC<RenderSlideProps> = ({
  item,
  index,
  width,
  height,
  scrollX,
}) => {
  const inputRange = [(index - 1) * width, index * width, (index + 1) * width];

  const scale = scrollX.interpolate({
    inputRange,
    outputRange: [0.8, 1, 0.8],
    extrapolate: "clamp",
  });

  const opacity = scrollX.interpolate({
    inputRange,
    outputRange: [0.4, 1, 0.4],
    extrapolate: "clamp",
  });

  return (
    <View className="flex-1 items-center px-6" style={{ width }}>
      <Animated.View
        style={{
          transform: [{ scale }],
          opacity,
        }}
        className="mb-6 items-center"
      >
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
