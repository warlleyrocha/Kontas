import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { CardPosition, ContextMenu } from "@/src/shared/components/ContextMenu";

const MENU_ITEM_HEIGHT = 52;

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
  // Admin: Editar + Convidar + Deletar (3 itens, 2 separadores)
  // Não-admin: apenas Editar (1 item)
  const menuTotalHeight = isAdmin ? MENU_ITEM_HEIGHT * 3 + 2 : MENU_ITEM_HEIGHT;

  return (
    <ContextMenu
      visible={visible}
      position={position}
      menuTotalHeight={menuTotalHeight}
      onClose={onClose}
    >
      {(handleClose) => (
        <>
          {/* Editar */}
          <TouchableOpacity
            onPress={() => handleClose(onEdit)}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Editar república"
            className="h-[52px] justify-center"
          >
            <View className="flex-row items-center justify-between px-4">
              <Text className="font-mulish-medium text-base text-[#1C1C1E]">
                Editar república
              </Text>
              <MaterialCommunityIcons
                name="pencil-outline"
                size={20}
                color="#337176"
              />
            </View>
          </TouchableOpacity>

          {/* Convidar novo morador e Deletar — visíveis apenas para admins */}
          {isAdmin && (
            <>
              <View className="h-px bg-[#E5E5EA]" />
              <TouchableOpacity
                onPress={() => handleClose(onInvite)}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel="Convidar novo morador"
                className="h-[52px] justify-center"
              >
                <View className="flex-row items-center justify-between px-4">
                  <Text className="font-mulish-medium text-base text-[#1C1C1E]">
                    Convidar novo morador
                  </Text>
                  <MaterialCommunityIcons
                    name="account-plus-outline"
                    size={20}
                    color="#337176"
                  />
                </View>
              </TouchableOpacity>

              <View className="h-px bg-[#E5E5EA]" />
              <TouchableOpacity
                onPress={() => handleClose(onDelete)}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel="Deletar república"
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
        </>
      )}
    </ContextMenu>
  );
}
