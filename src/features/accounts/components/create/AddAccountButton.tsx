import Feather from "@expo/vector-icons/Feather";
import { TouchableOpacity } from "react-native";

interface AddAccountButtonProps {
  readonly onPress: () => void;
}

export function AddAccountButton({ onPress }: AddAccountButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel="Adicionar nova conta"
      className="absolute bottom-6 right-6 h-14 w-14 items-center justify-center rounded-full bg-teal shadow-lg shadow-teal/30"
    >
      <Feather name="plus" size={28} color="white" />
    </TouchableOpacity>
  );
}
