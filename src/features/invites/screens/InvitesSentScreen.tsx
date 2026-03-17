import { ScreenLayout } from "@/src/shared/components/ScreenLayout";
import { useComponentLogger } from "@/src/shared/hooks/useComponentLogger";
import { InvitesSentContent } from "../components/InvitesSentContent";
import { useInvitesSentScreen } from "../hooks/useInvitesSentScreen";

interface InvitesSentScreenProps {
  readonly republicId: string;
}

export function InvitesSentScreen({ republicId }: InvitesSentScreenProps) {
  useComponentLogger("InvitesSentScreen");
  const { invites, error, handleRetry, handleEmptyStatePress } =
    useInvitesSentScreen(republicId);

  return (
    <ScreenLayout
      title="Convites Enviados"
      subtitle={`${invites.length} ${invites.length === 1 ? "convite" : "convites"}`}
      onBack={handleEmptyStatePress}
    >
      <InvitesSentContent
        error={error}
        invites={invites}
        onRetry={handleRetry}
        onEmptyStatePress={handleEmptyStatePress}
      />
    </ScreenLayout>
  );
}
