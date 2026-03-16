import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Dimensions,
  Modal,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";

const MENU_WIDTH = 220;
const MENU_ITEM_HEIGHT = 52;
const MENU_TOTAL_HEIGHT = MENU_ITEM_HEIGHT * 2 + 1; // 2 items + divider

interface CardPosition {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface RepublicContextMenuProps {
  readonly visible: boolean;
  readonly position: CardPosition | null;
  readonly onClose: () => void;
  readonly onEdit: () => void;
  readonly onDelete: () => void;
}

export function RepublicContextMenu({
  visible,
  position,
  onClose,
  onEdit,
  onDelete,
}: RepublicContextMenuProps) {
  const scaleAnim = useRef(new Animated.Value(0.85)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 180,
          friction: 12,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      scaleAnim.setValue(0.85);
      opacityAnim.setValue(0);
    }
  }, [visible, scaleAnim, opacityAnim]);

  if (!position) return null;

  const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

  // Posição horizontal: centralizado no card, mantendo dentro da tela
  let menuX = position.x + position.width / 2 - MENU_WIDTH / 2;
  menuX = Math.max(12, Math.min(menuX, SCREEN_WIDTH - MENU_WIDTH - 12));

  // Posição vertical: abaixo do card se tiver espaço, senão acima
  const spaceBelow = SCREEN_HEIGHT - (position.y + position.height);
  const menuY =
    spaceBelow >= MENU_TOTAL_HEIGHT + 20
      ? position.y + position.height + 8
      : position.y - MENU_TOTAL_HEIGHT - 8;

  const translateYOutput = spaceBelow >= MENU_TOTAL_HEIGHT + 20 ? -8 : 8;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View className="flex-1 bg-black/35">
          <TouchableWithoutFeedback>
            <Animated.View
              className="absolute overflow-hidden rounded-[14px] bg-white shadow-lg"
              style={{
                top: menuY,
                left: menuX,
                width: MENU_WIDTH,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.18,
                shadowRadius: 24,
                elevation: 12,
                opacity: opacityAnim,
                transform: [
                  { scale: scaleAnim },
                  {
                    translateY: scaleAnim.interpolate({
                      inputRange: [0.85, 1],
                      outputRange: [translateYOutput, 0],
                    }),
                  },
                ],
              }}
            >
              {/* Editar */}
              <TouchableOpacity
                onPress={onEdit}
                activeOpacity={0.7}
                className="h-[52px] justify-center"
              >
                <View className="flex-row items-center justify-between px-4">
                  <Text className="font-mulish-medium text-base text-[#1C1C1E]">
                    Editar república
                  </Text>
                  <MaterialCommunityIcons
                    name="pencil-outline"
                    size={20}
                    color="#3B82F6"
                  />
                </View>
              </TouchableOpacity>

              {/* Divider */}
              <View className="h-px bg-[#E5E5EA]" />

              {/* Deletar */}
              <TouchableOpacity
                onPress={onDelete}
                activeOpacity={0.7}
                className="h-[52px] justify-center"
              >
                <View className="flex-row items-center justify-between px-4">
                  <Text className="font-mulish-medium text-base text-red-500">
                    Deletar república
                  </Text>
                  <MaterialCommunityIcons
                    name="delete-outline"
                    size={20}
                    color="#EF4444"
                  />
                </View>
              </TouchableOpacity>
            </Animated.View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}
