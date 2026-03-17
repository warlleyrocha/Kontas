import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import React, { useCallback } from "react";
import {
  Modal,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  useWindowDimensions,
  View,
} from "react-native";
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";

const MENU_WIDTH = 220;
const MENU_ITEM_HEIGHT = 52;

export interface CardPosition {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface AccountContextMenuProps {
  readonly visible: boolean;
  readonly position: CardPosition | null;
  readonly onClose: () => void;
  readonly onEdit: () => void;
  readonly onDelete: () => void;
  readonly isAdmin?: boolean;
}

function useContextMenuAnimation(translateYOutput: number) {
  const scale = useSharedValue(0.85);
  const opacity = useSharedValue(0);

  const handleOpen = useCallback(() => {
    scale.value = 0.85;
    opacity.value = 0;
    scale.value = withSpring(1, { stiffness: 260, damping: 18 });
    opacity.value = withTiming(1, {
      duration: 150,
      easing: Easing.out(Easing.ease),
    });
  }, [opacity, scale]);

  const handleClose = useCallback(
    (callback?: () => void) => {
      opacity.value = withTiming(0, {
        duration: 120,
        easing: Easing.in(Easing.ease),
      });
      scale.value = withTiming(
        0.85,
        { duration: 120, easing: Easing.in(Easing.ease) },
        (finished) => {
          if (finished && callback) {
            scheduleOnRN(callback);
          }
        },
      );
    },
    [opacity, scale],
  );

  const menuAnimatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { scale: scale.value },
      { translateY: interpolate(scale.value, [0.85, 1], [translateYOutput, 0]) },
    ],
  }));

  return { handleOpen, handleClose, menuAnimatedStyle };
}

export function AccountContextMenu({
  visible,
  position,
  onClose,
  onEdit,
  onDelete,
  isAdmin = false,
}: AccountContextMenuProps) {
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const resolvedPosition = position ?? { x: 0, y: 0, width: 0, height: 0 };

  const menuTotalHeight = isAdmin
    ? MENU_ITEM_HEIGHT * 2 + 1
    : MENU_ITEM_HEIGHT;

  let menuX =
    resolvedPosition.x + resolvedPosition.width / 2 - MENU_WIDTH / 2;
  menuX = Math.max(12, Math.min(menuX, screenWidth - MENU_WIDTH - 12));

  const spaceBelow =
    screenHeight - (resolvedPosition.y + resolvedPosition.height);
  const menuY =
    spaceBelow >= menuTotalHeight + 20
      ? resolvedPosition.y + resolvedPosition.height + 8
      : resolvedPosition.y - menuTotalHeight - 8;

  const translateYOutput = spaceBelow >= menuTotalHeight + 20 ? -8 : 8;

  const { handleOpen, handleClose, menuAnimatedStyle } =
    useContextMenuAnimation(translateYOutput);

  const handleOverlayPress = useCallback(() => {
    handleClose(onClose);
  }, [handleClose, onClose]);

  const handleEditPress = useCallback(() => {
    handleClose(onEdit);
  }, [handleClose, onEdit]);

  const handleDeletePress = useCallback(() => {
    handleClose(onDelete);
  }, [handleClose, onDelete]);

  if (!position) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={handleOverlayPress}
      onShow={handleOpen}
    >
      <TouchableWithoutFeedback onPress={handleOverlayPress}>
        <View className="flex-1 bg-black/35">
          <TouchableWithoutFeedback>
            <Animated.View
              className="absolute overflow-hidden rounded-[14px] bg-white"
              style={[
                menuAnimatedStyle,
                {
                  top: menuY,
                  left: menuX,
                  width: MENU_WIDTH,
                  boxShadow: "0px 8px 24px rgba(0, 0, 0, 0.18)",
                },
              ]}
            >
              {/* Editar */}
              <TouchableOpacity
                onPress={handleEditPress}
                activeOpacity={0.7}
                className="h-[52px] justify-center"
              >
                <View className="flex-row items-center justify-between px-4">
                  <Text className="font-mulish-medium text-base text-[#1C1C1E]">
                    Editar conta
                  </Text>
                  <MaterialCommunityIcons
                    name="pencil-outline"
                    size={20}
                    color="#3B82F6"
                  />
                </View>
              </TouchableOpacity>

              {/* Deletar — visível apenas para admins */}
              {isAdmin && (
                <>
                  <View className="h-px bg-[#E5E5EA]" />
                  <TouchableOpacity
                    onPress={handleDeletePress}
                    activeOpacity={0.7}
                    className="h-[52px] justify-center"
                  >
                    <View className="flex-row items-center justify-between px-4">
                      <Text className="font-mulish-medium text-base text-red-500">
                        Deletar conta
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
