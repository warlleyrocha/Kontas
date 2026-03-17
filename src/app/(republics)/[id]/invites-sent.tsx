import {
  type ErrorBoundaryProps,
  Redirect,
  useLocalSearchParams,
} from "expo-router";
import { InvitesSentScreen } from "@/src/features/invites";
import { RouteErrorFallback } from "@/src/shared/components/error-boundary/RouteErrorFallback";

export default function InvitesSent() {
  const { id: republicId } = useLocalSearchParams<{ id?: string }>();
  if (!republicId) return <Redirect href="/" />;
  return <InvitesSentScreen republicId={republicId} />;
}

export function ErrorBoundary(props: ErrorBoundaryProps) {
  return <RouteErrorFallback domain="Invites" {...props} />;
}
