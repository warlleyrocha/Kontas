import Feather from "@expo/vector-icons/Feather";
import { TouchableOpacity } from "react-native";

interface PlusButtonProps {
  readonly onPress: () => void;
}

export function PlusButton({ onPress }: PlusButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel="Adicionar nova conta"
      className="absolute bottom-12 right-6 h-14 w-14 items-center justify-center rounded-full bg-teal shadow-lg shadow-teal/30"
    >
      <Feather name="plus" size={28} color="white" />
    </TouchableOpacity>
  );
}
