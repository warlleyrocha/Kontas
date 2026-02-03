// components/ui/toast-custom.tsx
import { Feather, MaterialIcons } from "@expo/vector-icons";
import React, { ReactNode } from "react";
import { Text, View } from "react-native";

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
