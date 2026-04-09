import { ScreenLayout } from "@/src/shared/components/ScreenLayout";
import { useComponentLogger } from "@/src/shared/hooks/useComponentLogger";
import { InviteList } from "@/src/features/invites/components/InviteList";
import { useInviteSentScreen } from "./hooks/useInviteSentScreen";

interface InvitesSentScreenProps {
  readonly republicId: string;
}

export function InviteSentScreen({ republicId }: InvitesSentScreenProps) {
  useComponentLogger("InviteSentScreen");
  const { invites, error, handleRetry, handleEmptyStatePress } =
    useInviteSentScreen(republicId);

  return (
    <ScreenLayout
      title="Convites Enviados"
      subtitle={`${invites.length} ${invites.length === 1 ? "convite" : "convites"}`}
      onBack={handleEmptyStatePress}
    >
      <InviteList
        error={error}
        invites={invites}
        onRetry={handleRetry}
        emptyState={{
          icon: "paper-plane-outline",
          iconColor: "#337176",
          bgColor: "bg-teal/10",
          title: "Nenhum convite enviado",
          description:
            "Você ainda não enviou convites para esta república. Convide pessoas para se juntarem a você!",
          buttonText: "Voltar",
          onPress: handleEmptyStatePress,
        }}
        variant="sent"
      />
    </ScreenLayout>
  );
}
