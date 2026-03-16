import {
  Image,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import Feather from "@expo/vector-icons/Feather";

import Header from "@/src/shared/components/Header";
import { EditRepublicModal } from "@/src/features/republic/components/EditRepublicModal";
import { InviteModal } from "@/src/features/invites/components/InviteModal";
import LoadingScreen from "@/src/shared/components/ui/loading-screen";

import { useControlPanelScreen } from "../hooks/useControlPanelScreen";

export function ControlPanelScreen() {
  const {
    user,
    loading,
    republics,
    getResidentsCount,
    refreshing,
    showEditModal,
    selectedRepublic,
    modalOpen,
    inviteRepublicId,
    inviteLoading,
    inviteError,
    sendInvite,
    onRefresh,
    handleOpenInviteModal,
    handleDeleteRepublic,
    handleEditRepublic,
    handleCloseEditModal,
    handleSaveEdit,
    handleCloseInviteModal,
  } = useControlPanelScreen();

  if (loading) {
    return <LoadingScreen message="Carregando painel de controle..." />;
  }

  if (!user) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <MaterialCommunityIcons
          name="account-alert"
          size={64}
          color="#9CA3AF"
        />
        <Text className="mt-4 text-lg font-medium text-gray-600">
          Usuário não encontrado
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      <Header title="Painel de Controle" />

      <ScrollView
        contentContainerStyle={{ padding: 16 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {republics.length === 0 ? (
          <View className="items-center justify-center py-20">
            <MaterialCommunityIcons
              name="home-search"
              size={64}
              color="#D1D5DB"
            />
            <Text className="mt-4 text-base text-gray-500">
              Nenhuma república cadastrada
            </Text>
          </View>
        ) : (
          <View className="gap-3">
            {republics.map((republic) => (
              <View
                key={republic.id}
                className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm"
              >
                <View className="flex-row items-center">
                  <Image
                    className="h-[70px] w-[70px] rounded-lg bg-gray-100"
                    source={{ uri: republic.imagemRepublica }}
                    resizeMode="cover"
                  />

                  <View className="ml-3 flex-1">
                    <Text className="text-lg font-semibold text-gray-900">
                      {republic.nome}
                    </Text>

                    <View className="mt-1 flex-row items-center">
                      <MaterialCommunityIcons
                        name="account-group"
                        size={14}
                        color="#6B7280"
                      />
                      <Text className="ml-1 text-sm text-gray-500">
                        {getResidentsCount(republic.id)}{" "}
                        {getResidentsCount(republic.id) === 1
                          ? "morador"
                          : "moradores"}
                      </Text>
                    </View>
                  </View>

                  <View className="flex-row items-center gap-2 pr-4">
                    <TouchableOpacity
                      onPress={() => handleOpenInviteModal(republic.id)}
                    >
                      <Feather name="user-plus" size={20} color="#6B7280" />
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => handleEditRepublic(republic)}
                      className="h-10 w-10 items-center justify-center rounded-lg bg-blue-50"
                    >
                      <MaterialCommunityIcons
                        name="pencil"
                        size={20}
                        color="#3B82F6"
                      />
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => handleDeleteRepublic(republic.id)}
                      className="h-10 w-10 items-center justify-center rounded-lg bg-red-50"
                    >
                      <MaterialCommunityIcons
                        name="delete-outline"
                        size={20}
                        color="#EF4444"
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      <TouchableOpacity
        className="absolute bottom-6 right-6 h-14 w-14 items-center justify-center rounded-full bg-blue-600 shadow-lg"
        onPress={() => console.log("Adicionar nova república")}
      >
        <MaterialCommunityIcons name="plus" size={28} color="white" />
      </TouchableOpacity>

      <EditRepublicModal
        visible={showEditModal}
        onClose={handleCloseEditModal}
        currentName={selectedRepublic?.nome ?? ""}
        currentImage={selectedRepublic?.imagemRepublica}
        onSave={handleSaveEdit}
      />

      <InviteModal
        open={modalOpen}
        onClose={handleCloseInviteModal}
        republicaId={inviteRepublicId ?? ""}
        sendInvite={sendInvite}
        loading={inviteLoading}
        error={inviteError}
      />
    </View>
  );
}
