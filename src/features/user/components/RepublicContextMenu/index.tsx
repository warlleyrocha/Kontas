import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import React, { useEffect, useState } from "react";
import {
  Animated,
  Modal,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  useWindowDimensions,
  View,
} from "react-native";

const MENU_WIDTH = 220;
const MENU_ITEM_HEIGHT = 52;

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
  readonly onInvite: () => void;
  readonly isAdmin?: boolean;
}

export function RepublicContextMenu({
  visible,
  position,
  onClose,
  onEdit,
  onDelete,
  onInvite,
  isAdmin = false,
}: RepublicContextMenuProps) {
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const [scaleAnim] = useState(new Animated.Value(0.85));
  const [opacityAnim] = useState(new Animated.Value(0));

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

  // Admin: Editar + Convidar + Deletar (3 itens, 2 separadores)
  // Não-admin: apenas Editar (1 item)
  const menuTotalHeight = isAdmin ? MENU_ITEM_HEIGHT * 3 + 2 : MENU_ITEM_HEIGHT;

  // Posição horizontal: centralizado no card, mantendo dentro da tela
  let menuX = position.x + position.width / 2 - MENU_WIDTH / 2;
  menuX = Math.max(12, Math.min(menuX, screenWidth - MENU_WIDTH - 12));

  // Posição vertical: abaixo do card se tiver espaço, senão acima
  const spaceBelow = screenHeight - (position.y + position.height);
  const menuY =
    spaceBelow >= menuTotalHeight + 20
      ? position.y + position.height + 8
      : position.y - menuTotalHeight - 8;

  const translateYOutput = spaceBelow >= menuTotalHeight + 20 ? -8 : 8;

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
              className="absolute overflow-hidden rounded-[14px] bg-white"
              style={{
                top: menuY,
                left: menuX,
                width: MENU_WIDTH,
                boxShadow: "0px 8px 24px rgba(0, 0, 0, 0.18)",
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

              {/* Convidar novo morador e Deletar — visíveis apenas para admins */}
              {isAdmin && (
                <>
                  <View className="h-px bg-[#E5E5EA]" />
                  <TouchableOpacity
                    onPress={onInvite}
                    activeOpacity={0.7}
                    className="h-[52px] justify-center"
                  >
                    <View className="flex-row items-center justify-between px-4">
                      <Text className="font-mulish-medium text-base text-[#1C1C1E]">
                        Convidar novo morador
                      </Text>
                      <MaterialCommunityIcons
                        name="account-plus-outline"
                        size={20}
                        color="#3B82F6"
                      />
                    </View>
                  </TouchableOpacity>

                  <View className="h-px bg-[#E5E5EA]" />
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
                </>
              )}
            </Animated.View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}
