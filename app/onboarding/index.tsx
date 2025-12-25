import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import React, { useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  FlatList,
  Image,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width, height } = Dimensions.get("window");

const slides = [
  {
    id: "1",
    title: "Gerencie suas Contas",
    description: "Controle todas as despesas da república em um só lugar",
    image: require("@/assets/images/onboarding/onboarding-1.webp"),
    color: "#4F46E5",
  },
  {
    id: "2",
    title: "Divida as Despesas",
    description: "Calcule automaticamente quanto cada morador deve pagar",
    image: require("@/assets/images/onboarding/onboarding-2.webp"),
    color: "#7C3AED",
  },
  {
    id: "3",
    title: "Acompanhe Pagamentos",
    description: "Veja quem já pagou e quem ainda está devendo",
    image: require("@/assets/images/onboarding/onboarding-3.webp"),
    color: "#2563EB",
  },
  {
    id: "4",
    title: "Notificações",
    description: "Receba lembretes de contas a vencer e pagamentos pendentes",
    image: require("@/assets/images/onboarding/onboarding-4.webp"),
    color: "#059669",
  },
];

export default function Onboarding() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  const handleNext = async () => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
      setCurrentIndex(currentIndex + 1);
    } else {
      await AsyncStorage.setItem("@kontas:onboarding_complete", "true");
      router.replace("/(userProfile)/profile");
    }
  };

  const handleSkip = () => {
    router.replace("/(userProfile)/profile");
  };

  const renderSlide = ({
    item,
    index,
  }: {
    item: (typeof slides)[0];
    index: number;
  }) => {
    const inputRange = [
      (index - 1) * width,
      index * width,
      (index + 1) * width,
    ];

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
          <Image
            source={item.image}
            style={{
              width: width * 0.9,
              height: height * 0.45,
              borderRadius: 24,
            }}
            resizeMode="cover"
          />
        </Animated.View>

        <View className="items-center px-4">
          <Text className="mb-3 text-center text-3xl font-bold">
            {item.title}
          </Text>
          <Text className="text-center text-lg leading-7 text-gray-500">
            {item.description}
          </Text>
        </View>
      </View>
    );
  };

  const renderDots = () => (
    <View className="mb-6 flex-row items-center justify-center">
      {slides.map((slide, index) => {
        const inputRange = [
          (index - 1) * width,
          index * width,
          (index + 1) * width,
        ];

        const dotScaleX = scrollX.interpolate({
          inputRange,
          outputRange: [1, 3, 1],
          extrapolate: "clamp",
        });

        const dotOpacity = scrollX.interpolate({
          inputRange,
          outputRange: [0.4, 1, 0.4],
          extrapolate: "clamp",
        });

        return (
          <View key={slide.id} className="mx-1.5 items-center justify-center">
            <Animated.View
              className="h-2 w-2 rounded-full bg-indigo-600"
              style={{
                transform: [{ scaleX: dotScaleX }],
                opacity: dotOpacity,
              }}
            />
          </View>
        );
      })}
    </View>
  );

  const isLastSlide = currentIndex === slides.length - 1;

  return (
    <View className="flex-1 bg-[#FAFAFA]">
      {/* Header */}
      <View className="mt-12 flex-row items-center justify-end px-6">
        {!isLastSlide && (
          <TouchableOpacity
            className="flex-row items-center rounded-full px-4 py-2"
            onPress={handleSkip}
            activeOpacity={0.7}
          >
            <Text className="mr-1 text-base font-medium text-gray-500">
              Pular
            </Text>
            <Ionicons name="chevron-forward" size={16} color="#6b7280" />
          </TouchableOpacity>
        )}
      </View>

      {/* Slides */}
      <Animated.FlatList
        ref={flatListRef}
        data={slides}
        renderItem={renderSlide}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: true }
        )}
        onMomentumScrollEnd={(event) => {
          const index = Math.round(event.nativeEvent.contentOffset.x / width);
          setCurrentIndex(index);
        }}
        scrollEventThrottle={16}
      />

      {/* Footer */}
      <View className="px-6 pb-10">
        {renderDots()}

        <TouchableOpacity
          className="flex-row items-center justify-center rounded-2xl bg-indigo-600 py-4 shadow-lg"
          onPress={handleNext}
          activeOpacity={0.9}
        >
          <Text className="mr-2 text-center text-lg font-bold text-white">
            {isLastSlide ? "Começar Agora" : "Continuar"}
          </Text>
          <Ionicons
            name={isLastSlide ? "rocket-outline" : "arrow-forward"}
            size={20}
            color="white"
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}
