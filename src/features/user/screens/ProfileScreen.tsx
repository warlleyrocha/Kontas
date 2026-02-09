import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";

import EmptyRepublic from "@/src/features/user/components/CardsProfile/EmptyRepublic";
import IncompleteProfile from "@/src/features/user/components/CardsProfile/IncompleteProfile";
import RepublicList from "@/src/features/user/components/CardsProfile/RepublicList";
import { EditProfileModal } from "@/src/features/user/components/EditProfileModal";

import { MenuButton, SideMenu } from "@/src/components/SideMenu";
import { maskPhone } from "@/src/utils/inputMasks";

import { useProfileScreen } from "../hooks/useProfileScreen";

export function ProfileScreen() {
  const {
    user,
    republics,

    isMenuOpen,
    setIsMenuOpen,
    showEditProfileModal,
    setShowEditProfileModal,
    refreshing,

    handleSaveProfile,
    handleCreateRepublic,
    handleViewInvites,
    handleEditRepublic,
    handleSelectRepublic,
    onRefresh,

    menuItems,
    footerItems,
    sideMenuUser,
  } = useProfileScreen();

  if (!user) return null;

  const renderContent = () => {
    if (!user.perfilCompleto) {
      return (
        <IncompleteProfile onContinue={() => setShowEditProfileModal(true)} />
      );
    }

    if (user.perfilCompleto && republics.length === 0) {
      return (
        <EmptyRepublic
          onCreateRepublic={handleCreateRepublic}
          onViewInvites={handleViewInvites}
        />
      );
    }

    return (
      <RepublicList
        republics={republics}
        onEditRepublic={handleEditRepublic}
        onSelectRepublic={handleSelectRepublic}
        onCreateRepublic={handleCreateRepublic}
        refreshing={refreshing}
        onRefresh={onRefresh}
      />
    );
  };

  return (
    <View className="flex-1 bg-[#FAFAFA]">
      {/* HEADER */}
      <View className="mt-[24px] flex-row items-center gap-3 border-b border-b-black/10 bg-[#FAFAFA] px-[16px] py-4">
        <View className="h-[50px] w-[50px] items-center justify-center overflow-hidden rounded-full bg-gray-200">
          {user.fotoPerfil ? (
            <Image
              source={{ uri: user.fotoPerfil }}
              style={{ width: 50, height: 50, borderRadius: 25 }}
              resizeMode="cover"
            />
          ) : (
            <Text className="text-xl font-bold text-gray-500">
              {user.nome.charAt(0).toUpperCase()}
            </Text>
          )}
        </View>

        <TouchableOpacity
          className="flex-1"
          onPress={() => setShowEditProfileModal(true)}
        >
          <Text className="text-base font-semibold">{user.nome}</Text>
          <Text className="text-sm text-gray-500">Configurar perfil</Text>
        </TouchableOpacity>

        <MenuButton onPress={() => setIsMenuOpen(true)} />
      </View>

      {/* CONTENT */}
      {renderContent()}

      {/* MENU LATERAL */}
      {isMenuOpen && sideMenuUser && (
        <SideMenu
          key={`sidemenu-${user.chavePix}-${user.telefone}`}
          onRequestClose={() => setIsMenuOpen(false)}
          user={{
            ...sideMenuUser,
            phone: maskPhone(user.telefone ?? ""),
          }}
          menuItems={menuItems}
          footerItems={footerItems}
        />
      )}

      {/* MODAL CONFIGURAR PERFIL */}
      <EditProfileModal
        key={`editmodal-${user.chavePix}-${user.telefone}`}
        visible={showEditProfileModal}
        onClose={() => setShowEditProfileModal(false)}
        currentName={user.nome}
        currentPixKey={user.chavePix}
        currentPhoto={user.fotoPerfil}
        currentPhone={maskPhone(user.telefone ?? "")}
        onSave={handleSaveProfile}
      />
    </View>
  );
}
