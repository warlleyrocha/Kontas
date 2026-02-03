import { Feather } from "@expo/vector-icons";
import React from "react";
import { TouchableOpacity, TouchableOpacityProps } from "react-native";

interface DeleteButtonProps extends Omit<TouchableOpacityProps, "onPress"> {
  onPress: (e: any) => void;
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
    <TouchableOpacity
      onPress={(e) => {
        e.stopPropagation();
        onPress(e);
      }}
      className="rounded-md p-2"
      {...props}
    >
      <Feather name="trash-2" size={size} color={color} />
    </TouchableOpacity>
  );
};
