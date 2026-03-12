import { RouteErrorFallback } from "@/src/shared/components/error-boundary/RouteErrorFallback";
import { Stack, type ErrorBoundaryProps } from "expo-router";

export default function UserProfileLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}

export function ErrorBoundary(props: ErrorBoundaryProps) {
  return <RouteErrorFallback domain="UserProfile" {...props} />;
}
