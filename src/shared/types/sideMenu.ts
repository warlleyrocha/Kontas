export type UserMenuContext = "home" | "profile" | "invite";

export interface MenuItem {
  id: string;
  label: string;
  icon:
    | "home-outline"
    | "person-outline"
    | "mail-outline"
    | "grid-outline"
    | "wallet-outline"
    | "document-text-outline"
    | "shield-checkmark-outline"
    | "log-out-outline";
  onPress: () => void;
  danger?: boolean;
  badge?: number;
}
