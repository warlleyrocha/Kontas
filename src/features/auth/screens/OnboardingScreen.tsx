import { router } from "expo-router";
import React, { useRef, useState } from "react";
import {
  FlatList,
  type ListRenderItemInfo,
  useWindowDimensions,
  View,
} from "react-native";
import Animated from "react-native-reanimated";
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
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList<OnboardingSlide>>(null);
  const { scrollX, handleScroll } = useOnboardingAnimation();

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
      <View className="px-6 pb-10">
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
          handleSkip={handleSkip}
          scrollX={scrollX}
          width={width}
        />
      </View>
    </View>
  );
}
