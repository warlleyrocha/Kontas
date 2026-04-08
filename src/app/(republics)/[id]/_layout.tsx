import type { ErrorBoundaryProps } from "expo-router";
import { RouteErrorFallback } from "@/src/shared/components/error-boundary/RouteErrorFallback";
import { ProtectedStackLayout } from "@/src/shared/components/ProtectedStackLayout";

export default function RepublicLayout() {
  return <ProtectedStackLayout />;
}

export function ErrorBoundary(props: ErrorBoundaryProps) {
  return <RouteErrorFallback domain="Republic" {...props} />;
}
