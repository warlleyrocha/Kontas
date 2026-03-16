import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { ActivityIndicator, Text, View } from "react-native";
import { SideMenu } from "@/src/shared/components/SideMenu";
import { useSideMenu } from "@/src/shared/components/SideMenu/useSideMenu";
import Tabs from "@/src/shared/components/Tabs";
import { ResumeTab } from "@/src/shared/components/Tabs/Resume";
import { AccountsTab } from "@/src/features/accounts";
import { EditRepublicModal } from "@/src/features/republic/components/EditRepublicModal";
import { ResidentsTab } from "@/src/features/residents";
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
  } = useRepublicScreen(republicId);

  const { menuItems, footerItems } = useSideMenu(
    "home",
    handleSignOut,
    republic?.id,
    currentUserRole,
  );

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
      />

      <View className="flex-1 p-4">
        <Tabs value={tab} onChange={setTab} />

        {tab === "contas" && (
          <AccountsTab
            republicId={republicId}
            currentResidentId={currentResidentId}
          />
        )}
        {tab === "moradores" && <ResidentsTab residents={residents} republicId={republicId} />}
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
