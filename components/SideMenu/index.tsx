import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useEffect, useMemo, useRef } from "react";
import {
  Animated,
  Dimensions,
  Image,
  Modal,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const MENU_WIDTH = Math.min(SCREEN_WIDTH * 0.65, 300);

export interface MenuItem {
  id: string;
  label: string;
  onPress: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
  danger?: boolean;
}

interface UserInfo {
  name: string;
  photo?: string | null;
  email?: string | null;
  pixKey?: string | null;
  phone?: string | null;
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
}

function MenuItemComponent({ item, onClose }: MenuItemComponentProps) {
  const handlePress = useCallback(() => {
    onClose();
    setTimeout(item.onPress, 250);
  }, [item.onPress, onClose]);

  const iconColor = useMemo(
    () => (item.danger ? "#ef4444" : "#374151"),
    [item.danger]
  );

  const textClassName = useMemo(
    () => `text-base ${item.danger ? "text-red-500" : "text-gray-700"}`,
    [item.danger]
  );

  return (
    <TouchableOpacity
      className="flex-row items-center px-4 py-3"
      onPress={handlePress}
    >
      {item.icon && (
        <Ionicons
          name={item.icon}
          size={20}
          color={iconColor}
          style={{ marginRight: 12 }}
        />
      )}
      <Text className={textClassName}>{item.label}</Text>
    </TouchableOpacity>
  );
}

const MemoizedMenuItem = React.memo(MenuItemComponent);

export function SideMenu({
  onRequestClose,
  user,
  menuItems,
  footerItems,
}: SideMenuProps) {
  const slideAnim = useRef(new Animated.Value(-MENU_WIDTH)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const openMenu = useCallback(() => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, [slideAnim, fadeAnim]);

  const closeMenu = useCallback(() => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -MENU_WIDTH,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(onRequestClose);
  }, [slideAnim, fadeAnim, onRequestClose]);

  useEffect(() => {
    openMenu();
    return () => closeMenu();
  }, [openMenu, closeMenu]);

  const userInitial = useMemo(
    () => user.name.charAt(0).toUpperCase(),
    [user.name]
  );

  return (
    <Modal transparent animationType="none">
      <View className="flex-1 flex-row">
        <TouchableWithoutFeedback onPress={closeMenu}>
          <Animated.View
            className="flex-1 bg-black/50"
            style={{ opacity: fadeAnim }}
          />
        </TouchableWithoutFeedback>

        <Animated.View
          className="h-full bg-white shadow-lg"
          style={{
            width: MENU_WIDTH,
            transform: [{ translateX: slideAnim }],
          }}
        >
          <SafeAreaView className="flex-1">
            {/* User Header */}
            <View className="border-b border-gray-100 pb-4 pl-[18px]">
              <View className="mb-3 h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-gray-200">
                {user.photo ? (
                  <Image
                    source={{ uri: user.photo }}
                    style={{ width: 64, height: 64, borderRadius: 32 }}
                    resizeMode="cover"
                  />
                ) : (
                  <Text className="text-2xl font-bold text-gray-500">
                    {userInitial}
                  </Text>
                )}
              </View>

              <Text className="text-lg font-semibold">{user.name}</Text>
              {user.email && (
                <Text className="text-sm text-gray-500">{user.email}</Text>
              )}
              {user.phone && (
                <Text className="text-sm text-gray-500">{user.phone}</Text>
              )}
              {user.pixKey && (
                <Text className="text-sm text-gray-500">{user.pixKey}</Text>
              )}
            </View>

            {/* Menu Items */}
            <View className="flex-1 py-2 pl-1">
              {menuItems.map((item) => (
                <MemoizedMenuItem
                  key={item.id}
                  item={item}
                  onClose={closeMenu}
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
}

export function MenuButton({ onPress }: MenuButtonProps) {
  return (
    <TouchableOpacity onPress={onPress} className="p-2" activeOpacity={0.7}>
      <Ionicons name="menu" size={28} color="#374151" />
    </TouchableOpacity>
  );
}
