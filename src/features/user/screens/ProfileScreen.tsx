import React, { useState } from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";

import EmptyRepublic from "@/src/features/user/components/CardsProfile/EmptyRepublic";
import IncompleteProfile from "@/src/features/user/components/CardsProfile/IncompleteProfile";
import RepublicList from "@/src/features/user/components/CardsProfile/RepublicList";
import { EditProfileModal } from "@/src/features/user/components/EditProfileModal";

import { MenuButton, SideMenu } from "@/src/components/SideMenu";
import { maskPhone } from "@/src/utils/inputMasks";

import { useProfileScreen } from "../hooks/useProfileScreen";

interface ProfileContentProps {
  readonly perfilCompleto: boolean;
  readonly republicsLength: number;
  readonly republics: ReturnType<typeof useProfileScreen>["republics"];
  readonly refreshing: boolean;
  readonly onContinueIncomplete: () => void;
  readonly onCreateRepublic: () => void;
  readonly onViewInvites: () => void;
  readonly onSelectRepublic: (republicId: string) => void;
  readonly onRefresh: () => void;
}

function ProfileContent({
  perfilCompleto,
  republicsLength,
  republics,
  refreshing,
  onContinueIncomplete,
  onCreateRepublic,
  onViewInvites,
  onSelectRepublic,
  onRefresh,
}: ProfileContentProps) {
  if (!perfilCompleto) {
    return <IncompleteProfile onContinue={onContinueIncomplete} />;
  }

  if (republicsLength === 0) {
    return (
      <EmptyRepublic
        onCreateRepublic={onCreateRepublic}
        onViewInvites={onViewInvites}
      />
    );
  }

  return (
    <RepublicList
      republics={republics}
      onSelectRepublic={onSelectRepublic}
      onCreateRepublic={onCreateRepublic}
      refreshing={refreshing}
      onRefresh={onRefresh}
    />
  );
}

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
    //handleEditRepublic,
    handleSelectRepublic,
    onRefresh,

    menuItems,
    footerItems,
    sideMenuUser,
  } = useProfileScreen();

  const [profileImageError, setProfileImageError] = useState(false);

  if (!user) return null;

  return (
    <View className="flex-1 bg-[#FAFAFA]">
      {/* HEADER */}
      <View className="mt-[24px] flex-row items-center gap-3 border-b border-b-black/10 bg-[#FAFAFA] px-[16px] py-4">
        <View className="h-[50px] w-[50px] items-center justify-center overflow-hidden rounded-full bg-gray-200">
          {user.fotoPerfil && !profileImageError ? (
            <Image
              source={{ uri: user.fotoPerfil }}
              style={{ width: 50, height: 50, borderRadius: 25 }}
              resizeMode="cover"
              onError={() => setProfileImageError(true)}
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
      <ProfileContent
        perfilCompleto={user.perfilCompleto}
        republicsLength={republics.length}
        republics={republics}
        refreshing={refreshing}
        onContinueIncomplete={() => setShowEditProfileModal(true)}
        onCreateRepublic={handleCreateRepublic}
        onViewInvites={handleViewInvites}
        onSelectRepublic={handleSelectRepublic}
        onRefresh={onRefresh}
      />

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
