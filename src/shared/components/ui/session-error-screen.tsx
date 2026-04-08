import { Text, TouchableOpacity, View } from "react-native";

interface SessionErrorScreenProps {
  readonly title: string;
  readonly message: string;
  readonly actionLabel?: string;
  readonly onRetry: () => void;
}

export default function SessionErrorScreen({
  title,
  message,
  actionLabel = "Tentar novamente",
  onRetry,
}: SessionErrorScreenProps) {
  return (
    <View className="flex-1 items-center justify-center bg-white px-6">
      <Text className="text-center font-inter-semibold text-2xl text-gray-900">
        {title}
      </Text>
      <Text className="mt-3 text-center font-inter-regular text-base text-gray-600">
        {message}
      </Text>
      <TouchableOpacity
        onPress={onRetry}
        accessibilityRole="button"
        accessibilityLabel={actionLabel}
        className="mt-8 rounded-xl bg-indigo-600 px-5 py-3"
      >
        <Text className="font-inter-semibold text-white">{actionLabel}</Text>
      </TouchableOpacity>
    </View>
  );
}
