import { Ionicons } from "@expo/vector-icons";
import type { ComponentProps } from "react";

import { StatusInvite } from "../types/invite.types";

type IconName = ComponentProps<typeof Ionicons>["name"];

type InviteStatusStyle = {
  badgeColorClass: string;
  textColorClass: string;
  iconColor: string;
  iconName: IconName;
  label: string;
};

export const INVITE_STATUS_STYLES: Record<StatusInvite, InviteStatusStyle> = {
  [StatusInvite.PENDENTE]: {
    badgeColorClass: "bg-yellow-100",
    textColorClass: "text-yellow-800",
    iconColor: "#F59E0B",
    iconName: "time-outline",
    label: "Pendente",
  },
  [StatusInvite.ACEITO]: {
    badgeColorClass: "bg-green-100",
    textColorClass: "text-green-800",
    iconColor: "#10B981",
    iconName: "checkmark-circle-outline",
    label: "Aceito",
  },
  [StatusInvite.RECUSADO]: {
    badgeColorClass: "bg-red-100",
    textColorClass: "text-red-800",
    iconColor: "#EF4444",
    iconName: "close-circle-outline",
    label: "Recusado",
  },
};

const DEFAULT_STATUS_STYLE: InviteStatusStyle = {
  badgeColorClass: "bg-gray-100",
  textColorClass: "text-gray-800",
  iconColor: "#6B7280",
  iconName: "help-circle-outline",
  label: "Desconhecido",
};

export function getInviteStatusStyle(status: string): InviteStatusStyle {
  const normalizedStatus = status.toUpperCase() as StatusInvite;
  return INVITE_STATUS_STYLES[normalizedStatus] ?? DEFAULT_STATUS_STYLE;
}
