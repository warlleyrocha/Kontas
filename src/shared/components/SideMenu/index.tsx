import Ionicons from "@expo/vector-icons/Ionicons";
import React, { useCallback, useMemo, useState } from "react";
import {
  Image,
  Modal,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  useWindowDimensions,
  View,
} from "react-native";
import Animated from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import type { MenuItem, MenuSubItem } from "@/src/shared/types/sideMenu";
import { useSideMenuAnimation } from "./useSideMenuAnimation";

interface UserInfo {
  name: string;
  photo?: string | null;
  email?: string | null;
  pixKey?: string | null;
  phone?: string | null;
  roleLabel?: string | null;
}

interface SideMenuProps {
  readonly onRequestClose: () => void;
  readonly user: UserInfo;
  readonly menuItems: MenuItem[];
  readonly footerItems?: MenuItem[];
}

interface MenuItemComponentProps {
  readonly item: MenuItem;
  readonly onClose: () => void;
  readonly isExpanded: boolean;
  readonly onToggleExpand: (itemId: string) => void;
}

interface MenuSubItemComponentProps {
  readonly item: MenuSubItem;
  readonly onClose: () => void;
}

function MenuSubItemComponent({ item, onClose }: MenuSubItemComponentProps) {
  const [imageError, setImageError] = useState(false);

  const handlePress = useCallback(() => {
    onClose();
    setTimeout(item.onPress, 250);
  }, [item.onPress, onClose]);

  const itemInitial = useMemo(
    () => item.label.charAt(0).toUpperCase(),
    [item.label],
  );

  return (
    <TouchableOpacity
      className={`flex-row items-center gap-3 rounded-xl px-3 py-2 ${
        item.active ? "bg-teal/10" : ""
      }`}
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel={item.label}
    >
      <View className="h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-teal/15">
        {item.image && !imageError ? (
          <Image
            source={{ uri: item.image }}
            style={{ width: 36, height: 36, borderRadius: 18 }}
            resizeMode="cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <Text className="text-sm font-semibold text-teal">{itemInitial}</Text>
        )}
      </View>

      <Text
        className={`flex-1 text-sm ${
          item.active
            ? "font-semibold text-teal-dark"
            : "font-normal text-gray-500"
        }`}
      >
        {item.label}
      </Text>
    </TouchableOpacity>
  );
}

function MenuItemComponent({
  item,
  onClose,
  isExpanded,
  onToggleExpand,
}: MenuItemComponentProps) {
  const isExpandable = !!item.children;
  const expandActionLabel = isExpanded ? "Recolher" : "Expandir";

  const handlePress = useCallback(() => {
    if (isExpandable) {
      onToggleExpand(item.id);
      return;
    }

    if (!item.onPress) return;

    onClose();
    setTimeout(item.onPress, 250);
  }, [isExpandable, item.id, item.onPress, onClose, onToggleExpand]);

  const iconColor = item.danger ? "#ef4444" : "#337176";
  const textClassName = `text-base ${item.danger ? "text-red-500" : "text-gray-700"}`;
  const accessibilityLabel = isExpandable
    ? `${expandActionLabel} ${item.label}`
    : item.label;

  return (
    <View>
      <TouchableOpacity
        className="flex-row items-center px-4 py-3"
        onPress={handlePress}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        accessibilityState={isExpandable ? { expanded: isExpanded } : undefined}
      >
        <Ionicons
          name={item.icon}
          size={20}
          color={iconColor}
          style={{ marginRight: 12 }}
        />
        <Text className={textClassName}>{item.label}</Text>

        <View className="ml-auto flex-row items-center">
          {!!item.badge && item.badge > 0 && (
            <View className="mr-2 h-5 min-w-5 items-center justify-center rounded-full bg-yellow-400 px-1">
              <Text className="text-xs font-semibold text-gray-800">
                {item.badge > 99 ? "99+" : item.badge}
              </Text>
            </View>
          )}

          {isExpandable && (
            <Ionicons
              name={isExpanded ? "chevron-up" : "chevron-down"}
              size={18}
              color="#337176"
            />
          )}
        </View>
      </TouchableOpacity>

      {isExpandable && isExpanded && (
        <View className="pb-2 pl-12 pr-4">
          {item.children && item.children.length > 0 ? (
            item.children.map((child) => (
              <MenuSubItemComponent
                key={child.id}
                item={child}
                onClose={onClose}
              />
            ))
          ) : (
            <Text className="px-3 py-2 text-sm text-gray-400">
              {item.emptyLabel ?? "Nenhuma república disponível"}
            </Text>
          )}
        </View>
      )}
    </View>
  );
}

const MemoizedMenuItem = React.memo(MenuItemComponent);

export function SideMenu({
  onRequestClose,
  user,
  menuItems,
  footerItems,
}: SideMenuProps) {
  const { width: screenWidth } = useWindowDimensions();
  const menuWidth = Math.min(screenWidth * 0.65, 300);
  const { closeMenu, backdropAnimatedStyle, panelAnimatedStyle } =
    useSideMenuAnimation({ menuWidth, onRequestClose });

  const userInitial = useMemo(
    () => user.name.charAt(0).toUpperCase(),
    [user.name],
  );

  const [photoError, setPhotoError] = useState(false);
  const [expandedItemId, setExpandedItemId] = useState<string | null>(null);

  const handleToggleExpand = useCallback((itemId: string) => {
    setExpandedItemId((currentId) => (currentId === itemId ? null : itemId));
  }, []);

  return (
    <Modal transparent animationType="none" onRequestClose={closeMenu}>
      <View className="flex-1 flex-row">
        <TouchableWithoutFeedback
          onPress={closeMenu}
          accessibilityRole="button"
          accessibilityLabel="Fechar menu lateral"
        >
          <Animated.View
            className="flex-1 bg-black/50"
            style={backdropAnimatedStyle}
          />
        </TouchableWithoutFeedback>

        <Animated.View
          className="h-full bg-white shadow-lg"
          style={[{ width: menuWidth }, panelAnimatedStyle]}
        >
          <SafeAreaView className="flex-1">
            {/* User Header */}
            <View className="flex-row items-start gap-3 border-b border-gray-100 px-5 py-3">
              <View className="h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-teal/20">
                {user.photo && !photoError ? (
                  <Image
                    source={{ uri: user.photo }}
                    style={{ width: 64, height: 64, borderRadius: 32 }}
                    resizeMode="cover"
                    onError={() => setPhotoError(true)}
                  />
                ) : (
                  <Text className="text-2xl font-bold text-teal">
                    {userInitial}
                  </Text>
                )}
              </View>

              <View className="min-w-0 flex-1">
                <View className="flex-row items-center gap-2">
                  <Text
                    className="flex-1 text-lg font-semibold"
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {user.name}
                  </Text>
                  {user.roleLabel && (
                    <View className="rounded-full bg-teal/15 px-2.5 py-1">
                      <Text className="text-xs font-semibold text-teal-dark">
                        {user.roleLabel}
                      </Text>
                    </View>
                  )}
                </View>
                {user.email && (
                  <Text
                    className="text-sm text-gray-500"
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {user.email}
                  </Text>
                )}
                {user.phone && (
                  <Text
                    className="text-sm text-gray-500"
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {user.phone}
                  </Text>
                )}
                {user.pixKey && (
                  <Text
                    className="text-sm text-gray-500"
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {user.pixKey}
                  </Text>
                )}
              </View>
            </View>

            {/* Menu Items */}
            <View className="flex-1 py-2 pl-1">
              {menuItems.map((item) => (
                <MemoizedMenuItem
                  key={item.id}
                  item={item}
                  onClose={closeMenu}
                  isExpanded={expandedItemId === item.id}
                  onToggleExpand={handleToggleExpand}
                />
              ))}
            </View>

            {/* Footer Items */}
            {footerItems && footerItems.length > 0 && (
              <View className="border-t border-gray-100 py-2">
                {footerItems.map((item) => (
                  <MemoizedMenuItem
                    key={item.id}
                    item={item}
                    onClose={closeMenu}
                    isExpanded={false}
                    onToggleExpand={handleToggleExpand}
                  />
                ))}
              </View>
            )}
          </SafeAreaView>
        </Animated.View>
      </View>
    </Modal>
  );
}

interface MenuButtonProps {
  readonly onPress: () => void;
  readonly hasNotification?: boolean;
}

export function MenuButton({ onPress, hasNotification }: MenuButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={
        hasNotification ? "Abrir menu com notificações" : "Abrir menu"
      }
      className="p-2"
      activeOpacity={0.7}
    >
      <Ionicons name="menu" size={28} color="#337176" />
      {hasNotification && (
        <View className="absolute right-1 top-1 h-3 w-3 rounded-full bg-yellow-400" />
      )}
    </TouchableOpacity>
  );
}
