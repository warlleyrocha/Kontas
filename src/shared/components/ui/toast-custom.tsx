// components/ui/toast-custom.tsx
import Feather from "@expo/vector-icons/Feather";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import React, { ReactNode, useCallback } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import Animated, {
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

export type ToastVariant = "success" | "error" | "info" | "warning";

export interface ToastProps {
  readonly message: string;
  readonly variant?: ToastVariant;
  readonly icon?: ReactNode;
}

const variants = {
  success: {
    icon: <Feather name="check-circle" size={20} color="#16a34a" />,
    textColor: "text-green-600",
  },
  error: {
    icon: <MaterialIcons name="error" size={20} color="#dc2626" />,
    textColor: "text-red-600",
  },
  info: {
    icon: <Feather name="info" size={20} color="#2563eb" />,
    textColor: "text-blue-600",
  },
  warning: {
    icon: <MaterialCommunityIcons name="close-circle" size={20} color="#dc2626" />,
    textColor: "text-red-600",
  },
};

export function Toast({ message, variant = "info", icon }: ToastProps) {
  const config = variants[variant];

  return (
    <View className="mx-[16px] flex-row items-center gap-3 rounded-lg bg-[#FAFAFA] px-[16px] py-[16px] shadow-md shadow-black">
      {icon ?? config.icon}
      <Text className={config.textColor}>{message}</Text>
    </View>
  );
}

export interface ToastConfirmProps {
  readonly message: string;
  readonly duration: number;
  readonly confirmLabel?: string;
  readonly cancelLabel?: string;
  readonly onConfirm: () => void;
  readonly onCancel: () => void;
}

function useToastConfirmAnimation(duration: number) {
  const progress = useSharedValue(1);
  const barWidth = useSharedValue(0);

  const handleProgressLayout = useCallback(
    (width: number) => {
      if (width === 0) return;

      barWidth.value = width;
      cancelAnimation(progress);
      progress.value = 1;
      progress.value = withTiming(0, { duration });
    },
    [barWidth, duration, progress]
  );

  const progressBarStyle = useAnimatedStyle(() => ({
    width: barWidth.value * progress.value,
  }));

  return {
    handleProgressLayout,
    progressBarStyle,
  };
}

export function ToastConfirm({
  message,
  duration,
  confirmLabel = "Excluir",
  cancelLabel = "Cancelar",
  onConfirm,
  onCancel,
}: ToastConfirmProps) {
  const { handleProgressLayout, progressBarStyle } =
    useToastConfirmAnimation(duration);

  return (
    <View className="mx-4 overflow-hidden rounded-2xl bg-white shadow-lg shadow-black/20">
      {/* Barra de progresso */}
      <View
        className="h-1 w-full bg-gray-100"
        onLayout={(e) => handleProgressLayout(e.nativeEvent.layout.width)}
      >
        <Animated.View
          style={[progressBarStyle, { height: 4, backgroundColor: "#EF4444" }]}
        />
      </View>

      {/* Conteúdo */}
      <View className="px-5 pb-1 pt-4">
        <View className="mb-3 flex-row items-start gap-3">
          <View className="mt-0.5 h-8 w-8 items-center justify-center rounded-full bg-red-50">
            <MaterialCommunityIcons
              name="delete-outline"
              size={18}
              color="#EF4444"
            />
          </View>
          <View className="flex-1">
            <Text className="font-mulish-semibold mb-0.5 text-sm text-gray-800">
              Confirmar exclusão
            </Text>
            <Text className="font-mulish-regular text-xs leading-relaxed text-gray-500">
              {message}
            </Text>
          </View>
        </View>
      </View>

      {/* Divisor */}
      <View className="mx-5 h-px bg-gray-100" />

      {/* Ações */}
      <View className="flex-row">
        <TouchableOpacity
          onPress={onCancel}
          activeOpacity={0.6}
          accessibilityRole="button"
          accessibilityLabel="Cancelar exclusão"
          className="flex-1 items-center py-3.5"
        >
          <Text className="font-mulish-medium text-sm text-gray-400">
            {cancelLabel}
          </Text>
        </TouchableOpacity>

        {/* Divisor vertical */}
        <View className="w-px bg-gray-100" />

        <TouchableOpacity
          onPress={onConfirm}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Confirmar exclusão"
          className="flex-1 items-center py-3.5"
        >
          <Text className="font-mulish-semibold text-sm text-red-500">
            {confirmLabel}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
