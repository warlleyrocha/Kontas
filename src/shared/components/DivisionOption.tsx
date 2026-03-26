import { TouchableOpacity, Text, View } from "react-native";

interface DivisionOptionProps {
  readonly selected: boolean;
  readonly label: string;
  readonly onPress: () => void;
  readonly icon?: React.ReactNode;
}

export default function DivisionOption({
  selected,
  label,
  onPress,
  icon,
}: DivisionOptionProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${selected ? "Opção selecionada" : "Selecionar opção"} ${label}`}
      className={`items-center justify-center w-[48%] px-4 py-2 rounded-2xl border-2 ${
        selected
          ? "bg-[#327072] border-[#21585a]"
          : "bg-transparent border-transparent"
      }`}
    >
      <View className="mb-2">{icon}</View>
      <Text
        className={`text-center font-inter-bold ${
          selected ? "text-[#BEFCFE]" : "text-[#666]"
        }`}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}
