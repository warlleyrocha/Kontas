import { RouteErrorFallback } from "@/src/components/error-boundary/RouteErrorFallback";
import PaymentsScreen from "@/src/features/accounts/screens/PaymentsScreen";
import {
  Redirect,
  useLocalSearchParams,
  type ErrorBoundaryProps,
} from "expo-router";
import React from "react";

export default function PaymentsRoute() {
  const { id: republicId } = useLocalSearchParams<{ id?: string }>();
  if (!republicId) return <Redirect href="/" />;
  return <PaymentsScreen republicId={republicId} />;
}

export function ErrorBoundary(props: ErrorBoundaryProps) {
  return <RouteErrorFallback domain="Payments" {...props} />;
}
