import React, { useState } from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";

import { InviteModal } from "@/src/features/invites/components/InviteModal";
import { EditRepublicModal } from "@/src/features/republic/components/EditRepublicModal";
import type { RepublicResponse } from "@/src/features/republic/types/republic.types";
import EmptyRepublic from "@/src/features/user/components/CardsProfile/EmptyRepublic";
import IncompleteProfile from "@/src/features/user/components/CardsProfile/IncompleteProfile";
import RepublicList from "@/src/features/user/components/CardsProfile/RepublicList";
import { EditProfileModal } from "@/src/features/user/components/EditProfileModal";
import { RepublicContextMenu } from "@/src/features/user/components/RepublicContextMenu";

import { MenuButton, SideMenu } from "@/src/shared/components/SideMenu";
import { useComponentLogger } from "@/src/shared/hooks/useComponentLogger";
import { maskPhone } from "@/src/shared/utils/inputMasks";
import { useProfileScreen } from "../hooks/useProfileScreen";

interface CardPosition {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface ProfileContentProps {
  readonly perfilCompleto: boolean;
  readonly republicsLength: number;
  readonly republics: ReturnType<typeof useProfileScreen>["republics"];
  readonly getResidentsCount: ReturnType<
    typeof useProfileScreen
  >["getResidentsCount"];
  readonly refreshing: boolean;
  readonly onContinueIncomplete: () => void;
  readonly onCreateRepublic: () => void;
  readonly onViewInvites: () => void;
  readonly onSelectRepublic: (republicId: string) => void;
  readonly onLongPressRepublic: (
    republic: RepublicResponse,
    position: CardPosition
  ) => void;
  readonly onRefresh: () => void;
}

function ProfileContent({
  perfilCompleto,
  republicsLength,
  republics,
  getResidentsCount,
  refreshing,
  onContinueIncomplete,
  onCreateRepublic,
  onViewInvites,
  onSelectRepublic,
  onLongPressRepublic,
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
      getResidentsCount={getResidentsCount}
      onSelectRepublic={onSelectRepublic}
      onLongPressRepublic={onLongPressRepublic}
      onCreateRepublic={onCreateRepublic}
      refreshing={refreshing}
      onRefresh={onRefresh}
    />
  );
}

export function ProfileScreen() {
  useComponentLogger("ProfileScreen");
  const {
    user,
    republics,
    getResidentsCount,

    isMenuOpen,
    setIsMenuOpen,
    showEditProfileModal,
    setShowEditProfileModal,
    showEditRepublicModal,
    refreshing,

    contextMenuVisible,
    contextMenuPosition,
    selectedRepublic,

    handleSaveProfile,
    handleCreateRepublic,
    handleViewInvites,
    handleSelectRepublic,
    handleLongPressRepublic,
    handleCloseContextMenu,
    handleOpenEditFromMenu,
    handleCloseEditModal,
    handleSaveRepublicEdit,
    handleDeleteFromMenu,
    showInviteModal,
    handleInviteFromMenu,
    handleCloseInviteModal,
    isAdmin,
    onRefresh,

    menuItems,
    footerItems,
    sideMenuUser,
    sendInvite,
    sendLoading,
    sendError,
  } = useProfileScreen();

  const [profileImageError, setProfileImageError] = useState(false);

  if (!user) return null;

  return (
    <View className="flex-1 bg-[#FAFAFA]">
      {/* HEADER */}
      <View className="mt-[24px] flex-row items-center gap-3 border-b border-b-black/10 bg-[#FAFAFA] px-[16px] py-4">
        <View className="h-[50px] w-[50px] items-center justify-center overflow-hidden rounded-full bg-teal/20">
          {user.fotoPerfil && !profileImageError ? (
            <Image
              source={{ uri: user.fotoPerfil }}
              style={{ width: 50, height: 50, borderRadius: 25 }}
              resizeMode="cover"
              onError={() => setProfileImageError(true)}
            />
          ) : (
            <Text className="text-xl font-bold text-teal">
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

        <MenuButton
          onPress={() => setIsMenuOpen(true)}
          hasNotification={menuItems.some((item) => (item.badge ?? 0) > 0)}
        />
      </View>

      {/* CONTENT */}
      <ProfileContent
        perfilCompleto={user.perfilCompleto}
        republicsLength={republics.length}
        republics={republics}
        getResidentsCount={getResidentsCount}
        refreshing={refreshing}
        onContinueIncomplete={() => setShowEditProfileModal(true)}
        onCreateRepublic={handleCreateRepublic}
        onViewInvites={handleViewInvites}
        onSelectRepublic={handleSelectRepublic}
        onLongPressRepublic={handleLongPressRepublic}
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

      {/* MODAL EDITAR REPÚBLICA */}
      <EditRepublicModal
        visible={showEditRepublicModal}
        onClose={handleCloseEditModal}
        currentName={selectedRepublic?.nome ?? ""}
        currentImage={selectedRepublic?.imagemRepublica}
        onSave={handleSaveRepublicEdit}
      />

      {/* CONTEXT MENU — pressão longa no card */}
      <RepublicContextMenu
        visible={contextMenuVisible}
        position={contextMenuPosition}
        onClose={handleCloseContextMenu}
        onEdit={handleOpenEditFromMenu}
        onDelete={handleDeleteFromMenu}
        onInvite={handleInviteFromMenu}
        isAdmin={isAdmin(selectedRepublic?.id ?? "")}
      />

      {/* MODAL CONVIDAR MORADOR */}
      <InviteModal
        open={showInviteModal}
        onClose={handleCloseInviteModal}
        republicaId={selectedRepublic?.id ?? ""}
        sendInvite={sendInvite}
        loading={sendLoading}
        error={sendError}
      />
    </View>
  );
}
