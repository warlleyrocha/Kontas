import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useMemo } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { AccountsTab } from "@/src/features/accounts";
import { useAccountList } from "@/src/features/accounts/hooks/useAccountList";
import { StatusPagamento } from "@/src/features/accounts/types/accountResidents.types";
import { getMoradorStatusVisual } from "@/src/features/accounts/utils/accountStatus.utils";
import {
  useInvitesByRepublicQuery,
  usePendingInvitesCount,
} from "@/src/features/invites/contexts/InvitesContext";
import { StatusInvite } from "@/src/features/invites/types/invite.types";
import { EditRepublicModal } from "@/src/features/republic/components/EditRepublicModal";
import { ResidentsTab } from "@/src/features/residents";
import { SideMenu } from "@/src/shared/components/SideMenu";
import { useSideMenu } from "@/src/shared/components/SideMenu/useSideMenu";
import Tabs from "@/src/shared/components/Tabs";
import { ResumeTab } from "@/src/shared/components/Tabs/Resume";
import { ResidentRole } from "@/src/shared/types/resident.types";

import { RepublicHeader } from "../components/RepublicHeader";
import { useRepublicScreen } from "../hooks/useRepublicScreen";

interface Props {
  readonly republicId: string;
}

export function RepublicScreen({ republicId }: Props) {
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
    userMenu,
    currentUserRole,
    currentResidentId,
    republics,
  } = useRepublicScreen(republicId);

  const pendingCount = usePendingInvitesCount();
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

  // Badge de "Pagamentos" representa moradores aguardando confirmação na
  // tela de conferência do admin, não apenas contas em aberto.
  // Nota: useAccountList também é chamado por AccountsTab (mesmo republicId),
  // o que gera um fetch duplo no mount. Tradeoff aceitável até que o estado
  // de contas seja elevado para um contexto global.
  const { accountResidentsById } = useAccountList({ republicId });
  const pendingPaymentsCount = useMemo(
    () =>
      Object.values(accountResidentsById).reduce(
        (total, residents) =>
          total +
          residents.filter(
            (resident) =>
              getMoradorStatusVisual(resident) ===
              StatusPagamento.AGUARDANDO_CONFIRMACAO
          ).length,
        0
      ),
    [accountResidentsById]
  );

  const { menuItems, footerItems } = useSideMenu("home", handleSignOut, {
    republicId: republic?.id,
    republics,
    currentUserRole,
    pendingInvitesCount: pendingCount,
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
        onMenuOpen={() => setIsMenuOpen(true)}
        hasNotification={menuItems.some((item) => (item.badge ?? 0) > 0)}
      />

      <View className="flex-1 p-4">
        <Tabs value={tab} onChange={setTab} />

        {tab === "contas" && (
          <AccountsTab
            republicId={republicId}
            currentResidentId={currentResidentId}
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
