import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import type { ReactNode } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface ScreenLayoutProps {
  readonly title: string;
  readonly subtitle: string;
  readonly children: ReactNode;
  readonly onBack?: () => void;
}

export function ScreenLayout({
  title,
  subtitle,
  children,
  onBack,
}: ScreenLayoutProps) {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-[#FAFAFA]">
      <View className="flex-row items-center gap-3 border-b border-b-black/10 bg-[#FAFAFA] px-[16px] py-4">
        <TouchableOpacity
          onPress={onBack ?? (() => router.back())}
          accessibilityRole="button"
          accessibilityLabel="Voltar para a tela anterior"
          className="p-1"
        >
          <Ionicons name="arrow-back" size={24} color="#337176" />
        </TouchableOpacity>

        <View className="flex-1">
          <Text className="text-lg font-semibold">{title}</Text>
          <Text className="text-sm text-gray-500">{subtitle}</Text>
        </View>
      </View>

      {children}
    </SafeAreaView>
  );
}
