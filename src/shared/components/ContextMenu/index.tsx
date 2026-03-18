import React, { useCallback } from "react";
import {
  Modal,
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

export interface CardPosition {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface ContextMenuProps {
  readonly visible: boolean;
  readonly position: CardPosition | null;
  readonly menuTotalHeight: number;
  readonly onClose: () => void;
  readonly children: (
    handleClose: (callback?: () => void) => void
  ) => React.ReactNode;
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
        }
      );
    },
    [opacity, scale]
  );

  const menuAnimatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { scale: scale.value },
      {
        translateY: interpolate(scale.value, [0.85, 1], [translateYOutput, 0]),
      },
    ],
  }));

  return { handleOpen, handleClose, menuAnimatedStyle };
}

export function ContextMenu({
  visible,
  position,
  menuTotalHeight,
  onClose,
  children,
}: ContextMenuProps) {
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const resolvedPosition = position ?? { x: 0, y: 0, width: 0, height: 0 };

  let menuX = resolvedPosition.x + resolvedPosition.width / 2 - MENU_WIDTH / 2;
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
              {children(handleClose)}
            </Animated.View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}
