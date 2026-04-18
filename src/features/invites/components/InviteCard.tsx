import Ionicons from "@expo/vector-icons/Ionicons";
import { Image, Text, View } from "react-native";
import { formatDate } from "@/src/shared/utils/formats";
import type { Invite } from "../types/invite.types";
import { InviteCardFooter } from "./InviteCardFooter";
import { Feather } from "@expo/vector-icons";

type InviteCardVariant = "received" | "sent";

interface InviteCardProps {
  readonly invite: Invite;
  readonly variant: InviteCardVariant;
  readonly onAccept?: () => void;
  readonly onReject?: () => void;
}

export function InviteCard({
  invite,
  variant,
  onAccept,
  onReject,
}: InviteCardProps) {
  const isReceived = variant === "received";
  const title = isReceived ? invite.nomeRepublica : invite.nomeMorador;
  const imageSource = isReceived
    ? invite.imagemRepublica
    : invite.imagemMorador;
  const infoExtra = isReceived
    ? `Convidado por ${invite.nomeAdmin}`
    : undefined;
  const dateLabel = isReceived ? "Recebido em:" : "Enviado em";

  return (
    <View className="mb-4 overflow-hidden rounded-2xl border border-teal/10 bg-white shadow-lg shadow-teal/20">
      <View className="p-4">
        <View className="mb-3 flex-row items-center">
          {imageSource ? (
            <Image
              source={{ uri: imageSource }}
              className="mr-3 h-16 w-16 rounded-xl border border-teal/20"
            />
          ) : (
            <View className="mr-3 h-16 w-16 items-center justify-center rounded-xl border border-teal/20 bg-teal/10">
              <Feather name="image" size={24} color="#6b7280" />
            </View>
          )}

          <View className="flex-1">
            <View className="flex-row items-center">
              <Ionicons
                name={isReceived ? "home-outline" : "person-outline"}
                size={14}
                color="#6B7280"
              />
              <Text className="ml-[5px] text-base font-semibold text-teal-dark">
                {title}
              </Text>
            </View>

            {infoExtra && (
              <View className="mt-1 flex-row items-center">
                <Ionicons name="at" size={14} color="#6B7280" />
                <Text className="ml-1 text-sm text-gray-500">{infoExtra}</Text>
              </View>
            )}

            <View className="mt-1 flex-row items-center">
              <Ionicons name="calendar-outline" size={14} color="#6B7280" />
              <Text className="ml-2 text-sm text-teal">
                {dateLabel} {formatDate(invite.criadoEm)}
              </Text>
            </View>
          </View>
        </View>

        <InviteCardFooter
          invite={invite}
          variant={variant}
          onAccept={onAccept}
          onReject={onReject}
        />
      </View>
    </View>
  );
}
