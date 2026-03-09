import { ActivityIndicator } from "react-native";
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";

import {
  type ContaStatusIcon,
  type MoradorStatusIcon,
} from "../utils/accountStatus.utils";

interface AccountStatusIconProps {
  readonly icon: ContaStatusIcon | MoradorStatusIcon;
  readonly size: number;
  readonly isLoading: boolean;
}

export function AccountStatusIcon({
  icon,
  size,
  isLoading,
}: AccountStatusIconProps) {
  if (isLoading) {
    return <ActivityIndicator size="small" color="#6b7280" />;
  }

  if (icon.library === "material") {
    return <MaterialIcons name={icon.name} size={size} color={icon.color} />;
  }

  return (
    <MaterialCommunityIcons name={icon.name} size={size} color={icon.color} />
  );
}
