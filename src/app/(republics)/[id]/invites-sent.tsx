import { MenuButton, SideMenu } from "@/src/components/SideMenu";
import { useSideMenu } from "@/src/components/SideMenu/useSideMenu";
import { RouteErrorFallback } from "@/src/components/error-boundary/RouteErrorFallback";
import { useAuth } from "@/src/features/auth/contexts";
import { useInvites } from "@/src/features/invites/hooks/useInvite";
import type { Invite } from "@/src/features/invites/types/invite.types";
import { formatDate } from "@/src/utils/formats";
import { toastErrors } from "@/src/utils/toastMessages";
import { Ionicons } from "@expo/vector-icons";
import {
  useLocalSearchParams,
  useRouter,
  type ErrorBoundaryProps,
} from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

interface InviteCardProps {
  invite: Invite;
}

function InviteCard({ invite }: InviteCardProps) {
  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case "PENDENTE":
        return "bg-yellow-100 text-yellow-800";
      case "ACEITO":
        return "bg-green-100 text-green-800";
      case "RECUSADO":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toUpperCase()) {
      case "PENDENTE":
        return "time-outline";
      case "ACEITO":
        return "checkmark-circle-outline";
      case "RECUSADO":
        return "close-circle-outline";
      default:
        return "help-circle-outline";
    }
  };

  const getStatusText = (status: string) => {
    switch (status.toUpperCase()) {
      case "PENDENTE":
        return "Pendente";
      case "ACEITO":
        return "Aceito";
      case "RECUSADO":
        return "Recusado";
      default:
        return status;
    }
  };

  return (
    <View className="mb-4 overflow-hidden rounded-2xl bg-white shadow-sm border border-gray-100">
      {/* Header com Status */}
      <View className="flex-row items-center justify-between border-b border-gray-100 bg-gray-50 px-4 py-3">
        <View className="flex-row items-center">
          <Ionicons
            name={getStatusIcon(invite.status)}
            size={20}
            color={
              invite.status.toUpperCase() === "PENDENTE"
                ? "#F59E0B"
                : invite.status.toUpperCase() === "ACEITO"
                  ? "#10B981"
                  : "#EF4444"
            }
          />
          <View
            className={`ml-2 rounded-full px-3 py-1 ${getStatusColor(invite.status)}`}
          >
            <Text className="text-xs font-semibold">
              {getStatusText(invite.status)}
            </Text>
          </View>
        </View>
      </View>

      {/* Info */}
      <View className="p-4">
        <View className="mb-3 flex-row items-center">
          <Ionicons name="mail-outline" size={16} color="#6366F1" />
          <Text className="ml-2 text-base font-semibold text-gray-800">
            {invite.email}
          </Text>
        </View>

        <View className="mb-2 flex-row items-center">
          <Ionicons name="calendar-outline" size={14} color="#6B7280" />
          <Text className="ml-2 text-sm text-gray-500">
            Enviado em {formatDate(invite.criadoEm)}
          </Text>
        </View>

        {invite.atualizadoEm !== invite.criadoEm && (
          <View className="flex-row items-center">
            <Ionicons name="refresh-outline" size={14} color="#6B7280" />
            <Text className="ml-2 text-sm text-gray-500">
              Atualizado em {formatDate(invite.atualizadoEm)}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

export default function invitesSent() {
  const router = useRouter();
  const { user, logout } = useAuth();

  const { id: republicId } = useLocalSearchParams<{ id?: string }>();
  const { invites, fetchInvites } = useInvites();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const userName = user?.nome ?? "Usuário";
  const userPhoto = user?.fotoPerfil;

  const handleSignOut = useCallback(async () => {
    try {
      await logout();
      router.replace("/");
    } catch (error) {
      console.error("Erro ao fazer logout da conta:", error);
      toastErrors.logoutFailed();
    }
  }, [logout, router]);

  const { menuItems, footerItems } = useSideMenu("invite", handleSignOut);

  useEffect(() => {
    if (republicId) {
      fetchInvites(republicId);
    }
  }, [republicId, fetchInvites]);

  console.log("República ID:", republicId);
  console.log("Convites da República", invites);

  return (
    <View className="flex-1 bg-[#FAFAFA]">
      {/* HEADER */}
      <View className="mt-[32px] flex-row items-center gap-3 border-b border-b-black/10 bg-[#FAFAFA] px-[16px] py-4">
        <TouchableOpacity onPress={() => router.back()} className="p-1">
          <Ionicons name="arrow-back" size={24} color="#374151" />
        </TouchableOpacity>

        <View className="flex-1">
          <Text className="text-lg font-semibold">Convites Enviados</Text>
          <Text className="text-sm text-gray-500">
            {invites.length} {invites.length === 1 ? "convite" : "convites"}
          </Text>
        </View>

        <MenuButton onPress={() => setIsMenuOpen(true)} />
      </View>

      {/* CONTENT */}
      {invites.length > 0 ? (
        <ScrollView className="flex-1 px-4 pt-4">
          {invites.map((invite) => (
            <InviteCard key={invite.id} invite={invite} />
          ))}
        </ScrollView>
      ) : (
        <View className="flex-1 items-center justify-center px-6">
          <View className="mb-6 h-24 w-24 items-center justify-center rounded-full bg-gray-100">
            <Ionicons name="paper-plane-outline" size={48} color="#9CA3AF" />
          </View>

          <Text className="mb-2 text-center text-xl font-bold text-gray-800">
            Nenhum convite enviado
          </Text>

          <Text className="mb-8 text-center text-base text-gray-500">
            Você ainda não enviou convites para esta república. Convide pessoas
            para se juntarem a você!
          </Text>

          <TouchableOpacity
            onPress={() => router.back()}
            className="flex-row items-center rounded-xl bg-indigo-600 px-6 py-3"
            activeOpacity={0.8}
          >
            <Ionicons name="arrow-back" size={18} color="white" />
            <Text className="ml-2 font-semibold text-white">Voltar</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* MENU LATERAL */}
      {isMenuOpen && (
        <SideMenu
          onRequestClose={() => setIsMenuOpen(false)}
          user={{ name: userName, photo: userPhoto }}
          menuItems={menuItems}
          footerItems={footerItems}
        />
      )}
    </View>
  );
}

export function ErrorBoundary(props: ErrorBoundaryProps) {
  return <RouteErrorFallback domain="Invites" {...props} />;
}
