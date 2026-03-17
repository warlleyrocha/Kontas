import Feather from "@expo/vector-icons/Feather";
import { TouchableOpacity, TouchableOpacityProps } from "react-native";

interface DeleteButtonProps extends Omit<TouchableOpacityProps, "onPress"> {
  onPress: () => void;
  size?: number;
  color?: string;
}

export const DeleteButton: React.FC<DeleteButtonProps> = ({
  onPress,
  size = 20,
  color = "#dc2626",
  ...props
}) => {
  return (
    <TouchableOpacity onPress={onPress} className="rounded-md p-2" {...props}>
      <Feather name="trash-2" size={size} color={color} />
    </TouchableOpacity>
  );
};
