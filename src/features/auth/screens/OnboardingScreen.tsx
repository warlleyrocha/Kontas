import { BlurView } from "expo-blur";
import { router } from "expo-router";
import React, { useRef, useState } from "react";
import {
  FlatList,
  type ListRenderItemInfo,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
} from "react-native-reanimated";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import OnboardingButtons from "@/src/features/auth/components/onboarding/OnboardingButtons";
import RenderDots from "@/src/features/auth/components/onboarding/RenderDots";
import RenderSlide from "@/src/features/auth/components/onboarding/RenderSlide";
import {
  type OnboardingSlide,
  slides,
} from "@/src/features/auth/constants/slides";
import { useOnboardingAnimation } from "@/src/features/auth/hooks/useOnboardingAnimation";
import { useComponentLogger } from "@/src/shared/hooks/useComponentLogger";

export default function Onboarding() {
  useComponentLogger("OnboardingScreen");
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList<OnboardingSlide>>(null);
  const { scrollX, handleScroll } = useOnboardingAnimation();

  const skipAnimatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      scrollX.value,
      [0, width * 0.3, width * 0.7, width],
      [1, 0.7, 0.2, 0],
      Extrapolation.CLAMP
    ),
  }));

  const handleNext = async () => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
      setCurrentIndex((prev) => prev + 1);
    } else {
      router.replace("/(userProfile)/profile");
    }
  };

  const handleSkip = () => {
    router.replace("/(userProfile)/profile");
  };

  const isLastSlide = currentIndex === slides.length - 1;

  const renderSlide = ({
    item,
    index,
  }: ListRenderItemInfo<OnboardingSlide>) => (
    <RenderSlide
      item={item}
      index={index}
      width={width}
      height={height}
      scrollX={scrollX}
    />
  );

  return (
    <View className="flex-1 bg-[#FAFAFA]">
      {currentIndex === 0 && (
        <Animated.View
          style={[
            skipAnimatedStyle,
            {
              position: "absolute",
              top: insets.top + 8,
              right: 24,
              zIndex: 10,
            },
          ]}
        >
          <BlurView
            intensity={20}
            tint="systemUltraThinMaterial"
            style={{ borderRadius: 100, overflow: "hidden" }}
          >
            <TouchableOpacity
              onPress={handleSkip}
              activeOpacity={0.7}
              className="py-[5px] px-3 border-2 border-white rounded-full"
            >
              <Text className="font-mulish-bold text-[16px] leading-[18px] text-white">
                Pular
              </Text>
            </TouchableOpacity>
          </BlurView>
        </Animated.View>
      )}

      {/* Slides */}
      <Animated.FlatList
        ref={flatListRef}
        data={slides}
        renderItem={renderSlide}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        onScroll={handleScroll}
        onMomentumScrollEnd={(event) => {
          const index = Math.round(event.nativeEvent.contentOffset.x / width);
          setCurrentIndex(index);
        }}
        scrollEventThrottle={16}
      />

      {/* Footer */}
      <SafeAreaView className="px-6 pb-12">
        <RenderDots
          slides={slides}
          scrollX={scrollX}
          currentIndex={currentIndex}
          width={width}
        />

        <OnboardingButtons
          isLastSlide={isLastSlide}
          currentIndex={currentIndex}
          slides={slides}
          handleNext={handleNext}
        />
      </SafeAreaView>
    </View>
  );
}
