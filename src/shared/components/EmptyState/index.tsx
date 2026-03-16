import { View, Text, TouchableOpacity } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";

interface EmptyStateProps {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  bgColor: string;
  title: string;
  description: string;
  buttonText: string;
  onPress: () => void;
  buttonClassName?: string;
  containerClassName?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  iconColor,
  bgColor,
  title,
  description,
  buttonText,
  onPress,
  buttonClassName = "bg-indigo-600",
  containerClassName = "",
}) => {
  return (
    <View
      className={`flex-1 items-center justify-center px-6 ${containerClassName}`}
    >
      <View
        className={`mb-6 h-24 w-24 items-center justify-center rounded-full ${bgColor}`}
      >
        <Ionicons name={icon} size={48} color={iconColor} />
      </View>

      <Text className="mb-2 text-center text-xl font-bold text-gray-800">
        {title}
      </Text>

      <Text className="mb-8 text-center text-base text-gray-500">
        {description}
      </Text>

      <TouchableOpacity
        onPress={onPress}
        className={`flex-row items-center rounded-xl px-6 py-3 ${buttonClassName}`}
        activeOpacity={0.8}
      >
        <Text className="font-semibold text-white">{buttonText}</Text>
      </TouchableOpacity>
    </View>
  );
};
