// components/ui/toast-custom.tsx
import Feather from "@expo/vector-icons/Feather";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import React, { ReactNode, useEffect, useState } from "react";
import { Animated, Text, TouchableOpacity, View } from "react-native";

export type ToastVariant = "success" | "error" | "info";

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

export function ToastConfirm({
  message,
  duration,
  confirmLabel = "Excluir",
  cancelLabel = "Cancelar",
  onConfirm,
  onCancel,
}: ToastConfirmProps) {
  const [progressAnim] = useState(new Animated.Value(1));
  const [barWidth, setBarWidth] = useState(0);

  useEffect(() => {
    if (barWidth === 0) return;
    Animated.timing(progressAnim, {
      toValue: 0,
      duration,
      useNativeDriver: false,
    }).start();
  }, [barWidth, duration, progressAnim]);

  return (
    <View className="mx-4 overflow-hidden rounded-2xl bg-white shadow-lg shadow-black/20">
      {/* Barra de progresso */}
      <View
        className="h-1 w-full bg-gray-100"
        onLayout={(e) => setBarWidth(e.nativeEvent.layout.width)}
      >
        <Animated.View
          style={{
            width: progressAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0, barWidth],
            }),
            height: 4,
            backgroundColor: "#EF4444",
          }}
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
