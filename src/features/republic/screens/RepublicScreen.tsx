import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useCallback, useMemo, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { AccountsTab } from "@/src/features/accounts";
import { useInvitesByRepublicQuery } from "@/src/features/invites/contexts/InvitesContext";
import { StatusInvite } from "@/src/features/invites/types/invite.types";
import { EditRepublicModal } from "@/src/features/republic/components/EditRepublicModal";
import { ResidentsTab } from "@/src/features/residents";
import { SideMenu } from "@/src/shared/components/SideMenu";
import { useSideMenu } from "@/src/shared/components/SideMenu/useSideMenu";
import Tabs from "@/src/shared/components/Tabs";
import { ResumeTab } from "@/src/shared/components/Tabs/Resume";
import { useComponentLogger } from "@/src/shared/hooks/useComponentLogger";
import { ResidentRole } from "@/src/shared/types/resident.types";
import { RepublicHeader } from "../components/RepublicHeader";
import { useRepublicScreen } from "../hooks/useRepublicScreen";

interface Props {
  readonly republicId: string;
}

export function RepublicScreen({ republicId }: Props) {
  useComponentLogger("RepublicScreen");
  const {
    republic,
    residents,
    residentsCount,
    tab,
    setTab,
    isLoading,
    isMenuOpen,
    setIsMenuOpen,
    isFavorited,
    toggleFavorite,
    showEditModal,
    setShowEditModal,
    handleSaveRepublic,
    handleSignOut,
    handleOpenMenu,
    userMenu,
    currentUserRole,
    currentResidentId,
    republics,
  } = useRepublicScreen(republicId);
  const [pendingPaymentsByRepublic, setPendingPaymentsByRepublic] = useState<
    Record<string, number>
  >({});

  const invitesSentQuery = useInvitesByRepublicQuery(republicId);

  // Convites enviados pela república ainda sem resposta do convidado.
  // Derivado do cache do React Query por republicId.
  const pendingInvitesSentCount = useMemo(
    () =>
      (invitesSentQuery.data ?? []).filter(
        (i) => i.status === StatusInvite.PENDENTE
      ).length,
    [invitesSentQuery.data]
  );

  const pendingPaymentsCount = pendingPaymentsByRepublic[republicId] ?? 0;
  const handlePendingPaymentsCountChange = useCallback(
    (count: number) => {
      setPendingPaymentsByRepublic((current) => {
        if (current[republicId] === count) {
          return current;
        }

        return {
          ...current,
          [republicId]: count,
        };
      });
    },
    [republicId]
  );

  const { menuItems, footerItems } = useSideMenu("home", handleSignOut, {
    republicId: republic?.id,
    republics,
    currentUserRole,
    pendingInvitesSentCount,
    pendingPaymentsCount,
  });

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-[#FAFAFA]">
        <ActivityIndicator size="large" />
        <Text className="mt-4 text-gray-600">Carregando república...</Text>
      </View>
    );
  }

  if (!republic) {
    return (
      <View className="flex-1 items-center justify-center bg-[#FAFAFA]">
        <MaterialCommunityIcons name="home-alert" size={64} color="#9CA3AF" />
        <Text className="mt-4 text-gray-600">República não encontrada</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#FAFAFA]">
      <RepublicHeader
        republic={republic}
        numberResidents={residentsCount}
        isFavorited={isFavorited}
        onEdit={() => setShowEditModal(true)}
        onToggleFavorite={toggleFavorite}
        onMenuOpen={() => void handleOpenMenu()}
        hasNotification={menuItems.some((item) => (item.badge ?? 0) > 0)}
      />

      <View className="flex-1 p-4">
        <Tabs value={tab} onChange={setTab} />

        {tab === "contas" && (
          <AccountsTab
            republicId={republicId}
            currentResidentId={currentResidentId}
            isAdmin={currentUserRole === ResidentRole.ADMIN}
            onPendingPaymentsCountChange={handlePendingPaymentsCountChange}
          />
        )}
        {tab === "moradores" && (
          <ResidentsTab
            residents={residents}
            republicId={republicId}
            isAdmin={currentUserRole === ResidentRole.ADMIN}
          />
        )}
        {tab === "resumo" && (
          <ResumeTab residents={residents} republicId={republicId} />
        )}
      </View>

      <EditRepublicModal
        visible={showEditModal}
        onClose={() => setShowEditModal(false)}
        currentName={republic.nome}
        currentImage={republic.imagemRepublica}
        onSave={handleSaveRepublic}
      />

      {isMenuOpen && (
        <SideMenu
          onRequestClose={() => setIsMenuOpen(false)}
          user={userMenu}
          menuItems={menuItems}
          footerItems={footerItems}
        />
      )}
    </View>
  );
}
