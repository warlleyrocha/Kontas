export type UserMenuContext = "home" | "profile" | "invite";

export interface MenuSubItem {
  id: string;
  label: string;
  image?: string | null;
  onPress: () => void;
  active?: boolean;
}

export interface MenuItem {
  id: string;
  label: string;
  icon:
    | "person-outline"
    | "mail-outline"
    | "grid-outline"
    | "swap-horizontal-outline"
    | "wallet-outline"
    | "document-text-outline"
    | "shield-checkmark-outline"
    | "log-out-outline";
  onPress?: () => void;
  danger?: boolean;
  badge?: number;
  children?: MenuSubItem[];
  emptyLabel?: string;
}
