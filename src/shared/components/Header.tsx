import ArrowLeftIcon from "@/assets/images/Vector.svg";
import { goBack } from "expo-router/build/global-state/routing";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

interface HeaderProps {
  readonly title?: string;
}

export default function Header({ title }: HeaderProps) {
  return (
    <View className="mb-[24px] mt-[32px] px-4 py-[8px]">
      <View className="flex-row items-center justify-between">
        <TouchableOpacity onPress={goBack}>
          <ArrowLeftIcon />
        </TouchableOpacity>
        <Text className=" font-inter-bold text-[20px] leading-[22px]">
          {title}
        </Text>
        {/* view "fantasma" para equilibrar o layout */}
        <View className="w-[10px]" />
      </View>
    </View>
  );
}
