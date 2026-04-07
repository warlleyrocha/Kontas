import type { ErrorBoundaryProps } from "expo-router";
import { ProtectedStackLayout } from "@/src/shared/components/ProtectedStackLayout";
import { RouteErrorFallback } from "@/src/shared/components/error-boundary/RouteErrorFallback";

export default function RepublicLayout() {
  return <ProtectedStackLayout />;
}

export function ErrorBoundary(props: ErrorBoundaryProps) {
  return <RouteErrorFallback domain="Republic" {...props} />;
}
