import { InviteList } from "@/src/features/invites/components/InviteList";
import { ScreenLayout } from "@/src/shared/components/ScreenLayout";
import { useComponentLogger } from "@/src/shared/hooks/useComponentLogger";
import { useInviteSentScreen } from "./hooks/useInviteSentScreen";

interface InvitesSentScreenProps {
  readonly republicId: string;
}

export function InviteSentScreen({ republicId }: InvitesSentScreenProps) {
  useComponentLogger("InviteSentScreen");
  const { invites, error, handleRetry, handleEmptyStatePress, pendingCount } =
    useInviteSentScreen(republicId);

  return (
    <ScreenLayout
      title="Convites Enviados"
      subtitle={`${pendingCount} ${pendingCount === 1 ? "pendente" : "pendentes"}`}
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
