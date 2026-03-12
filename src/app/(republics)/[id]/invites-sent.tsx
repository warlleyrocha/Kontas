import { RouteErrorFallback } from "@/src/shared/components/error-boundary/RouteErrorFallback";
import { InvitesSentScreen } from "@/src/features/invites";
import {
  Redirect,
  useLocalSearchParams,
  type ErrorBoundaryProps,
} from "expo-router";
import React from "react";

export default function InvitesSent() {
  const { id: republicId } = useLocalSearchParams<{ id?: string }>();
  if (!republicId) return <Redirect href="/" />;
  return <InvitesSentScreen republicId={republicId} />;
}

export function ErrorBoundary(props: ErrorBoundaryProps) {
  return <RouteErrorFallback domain="Invites" {...props} />;
}
