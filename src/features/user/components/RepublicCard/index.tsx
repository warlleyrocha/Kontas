import type { RepublicResponse } from "@/src/features/republic/types/republic.types";
import Ionicons from "@expo/vector-icons/Ionicons";
import React, { useCallback, useRef, useState } from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import Animated, {
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";

interface CardPosition {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface RepublicaCardProps {
  readonly republic: RepublicResponse;
  readonly residentsCount?: number;
  readonly onSelect: () => void;
  readonly onLongPress?: (
    republic: RepublicResponse,
    position: CardPosition,
  ) => void;
}

function useRepublicCardAnimation() {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const shrink = useCallback(() => {
    cancelAnimation(scale);
    scale.value = withTiming(0.93, { duration: 400 });
  }, [scale]);

  const reset = useCallback(() => {
    cancelAnimation(scale);
    scale.value = withSpring(1, {
      stiffness: 200,
      damping: 16,
    });
  }, [scale]);

  return {
    animatedStyle,
    shrink,
    reset,
  };
}

export default function RepublicCard({
  republic,
  residentsCount = 0,
  onSelect,
  onLongPress,
}: RepublicaCardProps) {
  const residentsLabel = residentsCount === 1 ? "Morador" : "Moradores";
  const [imageError, setImageError] = useState(false);
  const cardRef = useRef<View>(null);
  const { animatedStyle, shrink, reset } = useRepublicCardAnimation();

  const handlePressIn = useCallback(() => {
    shrink();
  }, [shrink]);

  const handlePressOut = useCallback(() => {
    reset();
  }, [reset]);

  const handleLongPress = useCallback(() => {
    if (!onLongPress) return;
    reset();
    cardRef.current?.measure((_x, _y, width, height, pageX, pageY) => {
      onLongPress(republic, { x: pageX, y: pageY, width, height });
    });
  }, [onLongPress, republic, reset]);

  return (
    <Animated.View style={animatedStyle}>
      <TouchableOpacity
        ref={cardRef}
        onPress={onSelect}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onLongPress={handleLongPress}
        delayLongPress={400}
        activeOpacity={1}
        className="mb-4 w-44 overflow-hidden rounded-3xl bg-white shadow-sm"
      >
        {/* Imagem */}
        <View className="h-36 w-full items-center justify-center overflow-hidden bg-gray-100">
          {republic.imagemRepublica && !imageError ? (
            <Image
              source={{ uri: republic.imagemRepublica }}
              style={{ width: "100%", height: "100%" }}
              resizeMode="cover"
              onError={() => setImageError(true)}
            />
          ) : (
            <Text className="text-5xl">🏠</Text>
          )}
        </View>

        {/* Info */}
        <View className="p-4">
          <Text className="text-lg font-bold text-gray-800" numberOfLines={2}>
            {republic.nome}
          </Text>

          <View className="mt-2 flex-row items-center justify-between">
            <View className="flex-row items-center">
              <Ionicons name="people-outline" size={14} color="#3B82F6" />
              <Text className="ml-1 text-sm font-medium text-gray-600">
                {residentsCount} {residentsLabel}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}
