import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import React, { JSX } from "react";
import { Text, TouchableOpacity, View } from "react-native";

import type { Tab, TabsProps } from "@/types/tabs";

/* Tabs definidas */
const tabs: Tab[] = [
  {
    key: "resumo",
    label: "Resumo",
    icon: (color) => (
      <Ionicons name="stats-chart-outline" size={20} color={color} />
    ),
  },
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
    icon: (color) => <Ionicons name="people-outline" size={20} color={color} />,
  },
];

/** Componente que renderiza as abas de navegação do home (Resumo, Contas, Moradores) */
export default function Tabs({
  value,
  onChange,
}: Readonly<TabsProps>): JSX.Element {
  return (
    <View className="my-[10px] flex-row justify-between rounded-full bg-[#ececf0] p-1 px-[16px] shadow">
      {tabs.map((tab) => {
        const isActive = value === tab.key;
        const color = isActive ? "#000" : "#6b6b6b";

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
              className={isActive ? "text-black" : "text-gray-600"}
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
