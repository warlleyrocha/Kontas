import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import React, { JSX } from "react";
import { Text, TouchableOpacity, View } from "react-native";

import type { Tab, TabsProps } from "@/src/shared/types/tabs";

/* Tabs definidas */
const tabs: Tab[] = [
  {
    key: "contas",
    label: "Contas",
    icon: (color) => (
      <MaterialCommunityIcons name="bank" size={20} color={color} />
    ),
  },
  {
    key: "moradores",
    label: "Moradores",
    icon: (color) => (
      <MaterialCommunityIcons
        name="account-group-outline"
        size={20}
        color={color}
      />
    ),
  },
  {
    key: "resumo",
    label: "Resumo",
    icon: (color) => (
      <MaterialCommunityIcons name="chart-bar" size={20} color={color} />
    ),
  },
];

/** Componente que renderiza as abas de navegação do home (Resumo, Contas, Moradores) */
export default function Tabs({
  value,
  onChange,
}: Readonly<TabsProps>): JSX.Element {
  return (
    <View className="my-[10px] flex-row justify-between rounded-full bg-teal/5 p-1 border border-teal-50 px-[16px]">
      {tabs.map((tab) => {
        const isActive = value === tab.key;
        const color = isActive ? "#337176" : "#6b6b6b";

        return (
          <TouchableOpacity
            key={tab.key}
            onPress={() => onChange(tab.key)}
            className={`flex-row items-center gap-[4px] rounded-full p-4 py-2 ${
              isActive ? "bg-white" : "bg-transparent"
            }`}
          >
            <View className="">{tab.icon(color)}</View>

            <Text
              className={isActive ? "font-semibold text-teal" : "text-gray-500"}
              style={{ fontSize: 14 }}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
