import Feather from "@expo/vector-icons/Feather";
import { type FC, useState } from "react";
import { FlatList, RefreshControl, Text, View } from "react-native";

import { InviteModal } from "@/src/features/invites/components/InviteModal";
import { useInvitesContext } from "@/src/features/invites/contexts/InvitesContext";
import { ResidentCard } from "@/src/features/residents/components/ResidentCard";
import { useTabResidents } from "@/src/features/residents/hooks/useTabResidents";
import { useRefresh } from "@/src/shared/contexts/RefreshContext";
import type { ResidentResponse } from "@/src/shared/types/resident.types";

import { AddAccountButton } from "../../accounts/components";

interface ResidentsTabProps {
  residents: ResidentResponse[];
  republicId: string;
  isAdmin?: boolean;
}

export const ResidentsTab: FC<ResidentsTabProps> = ({
  residents,
  republicId,
  isAdmin,
}) => {
  const { copiarChavePix } = useTabResidents();
  const { refreshing, onRefresh } = useRefresh();

  const { sendInvite, sendLoading, sendError } = useInvitesContext();

  const [modalOpen, setModalOpen] = useState(false);

  const renderMorador = ({ item }: { item: ResidentResponse }) => {
    return <ResidentCard morador={item} onCopyPix={copiarChavePix} />;
  };

  const renderItemSeparator = () => <View className="h-4" />;

  const renderEmptyState = () => (
    <View className="flex-1 items-center justify-center py-20">
      <Feather name="users" size={64} color="#D1D5DB" />
      <Text className="mt-4 text-base text-gray-500">
        Nenhum morador cadastrado
      </Text>
    </View>
  );

  return (
    <View className="flex-1">
      <FlatList
        data={residents}
        keyExtractor={(m) => m.id}
        renderItem={renderMorador}
        ItemSeparatorComponent={renderItemSeparator}
        ListEmptyComponent={renderEmptyState}
        contentContainerStyle={{ paddingBottom: 130 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />

      {isAdmin && <AddAccountButton onPress={() => setModalOpen(true)} />}
      <InviteModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        republicaId={republicId}
        sendInvite={sendInvite}
        loading={sendLoading}
        error={sendError}
      />
    </View>
  );
};

export default ResidentsTab;
