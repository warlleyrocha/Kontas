import OnboardingButtons from "@/src/features/auth/components/onboarding/OnboardingButtons";
import RenderDots from "@/src/features/auth/components/onboarding/RenderDots";
import RenderSlide from "@/src/features/auth/components/onboarding/RenderSlide";
import { slides } from "@/src/features/auth/constants/slides";
import { router } from "expo-router";
import React, { useRef, useState } from "react";
import { Animated, Dimensions, FlatList, View } from "react-native";

const { width, height } = Dimensions.get("window");

export default function Onboarding() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  const handleNext = async () => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
      setCurrentIndex(currentIndex + 1);
    } else {
      router.replace("/(userProfile)/profile");
    }
  };

  const handleSkip = () => {
    router.replace("/(userProfile)/profile");
  };

  const isLastSlide = currentIndex === slides.length - 1;

  return (
    <View className="flex-1 bg-[#FAFAFA]">
      {/* Slides */}
      <Animated.FlatList
        ref={flatListRef}
        data={slides}
        renderItem={({ item, index }) => (
          <RenderSlide
            item={item}
            index={index}
            width={width}
            height={height}
            scrollX={scrollX}
          />
        )}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
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
