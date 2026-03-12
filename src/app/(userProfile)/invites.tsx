import { InvitesScreen } from "@/src/features/invites";
import { RouteErrorFallback } from "@/src/shared/components/error-boundary/RouteErrorFallback";
import type { ErrorBoundaryProps } from "expo-router";

export default function InvitesRoute() {
  return <InvitesScreen />;
}

export function ErrorBoundary(props: ErrorBoundaryProps) {
  return <RouteErrorFallback domain="Invites" {...props} />;
}
