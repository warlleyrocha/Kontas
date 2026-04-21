import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { CardPosition, ContextMenu } from "@/src/shared/components/ContextMenu";

export type { CardPosition };

const MENU_ITEM_HEIGHT = 52;

interface AccountContextMenuProps {
  readonly visible: boolean;
  readonly position: CardPosition | null;
  readonly onClose: () => void;
  readonly onEdit: () => void;
  readonly onDelete: () => void;
  readonly isAdmin?: boolean;
  readonly isOwner?: boolean;
}

export function AccountContextMenu({
  visible,
  position,
  onClose,
  onEdit,
  onDelete,
  isAdmin = false,
  isOwner = false,
}: AccountContextMenuProps) {
  const canDelete = isAdmin || isOwner;
  const menuTotalHeight = canDelete
    ? MENU_ITEM_HEIGHT * 2 + 1
    : MENU_ITEM_HEIGHT;

  return (
    <ContextMenu
      visible={visible}
      position={position}
      menuTotalHeight={menuTotalHeight}
      onClose={onClose}
    >
      {(handleClose) => (
        <>
          {/* Editar 
          <TouchableOpacity
            onPress={() => handleClose(onEdit)}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Editar conta"
            className="h-[52px] justify-center"
          >
            <View className="flex-row items-center justify-between px-4">
              <Text className="font-mulish-medium text-base text-[#1C1C1E]">
                Editar conta
              </Text>
              <MaterialCommunityIcons
                name="pencil-outline"
                size={20}
                color="#337176"
              />
            </View>
          </TouchableOpacity>
          */}

          {/* Deletar — visível para admins e criadores da conta */}
          {canDelete && (
            <>
              <View className="h-px bg-[#E5E5EA]" />
              <TouchableOpacity
                onPress={() => handleClose(onDelete)}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel="Deletar conta"
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
        </>
      )}
    </ContextMenu>
  );
}
