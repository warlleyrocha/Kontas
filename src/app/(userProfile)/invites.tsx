import type { ErrorBoundaryProps } from "expo-router";
import { InviteInboxScreen } from "@/src/features/invites";
import { RouteErrorFallback } from "@/src/shared/components/error-boundary/RouteErrorFallback";

export default function InvitesRoute() {
  return <InviteInboxScreen />;
}

export function ErrorBoundary(props: ErrorBoundaryProps) {
  return <RouteErrorFallback domain="Invites" {...props} />;
}
