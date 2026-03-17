import { type ErrorBoundaryProps, Stack } from "expo-router";
import { RouteErrorFallback } from "@/src/shared/components/error-boundary/RouteErrorFallback";

export default function UserProfileLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}

export function ErrorBoundary(props: ErrorBoundaryProps) {
  return <RouteErrorFallback domain="UserProfile" {...props} />;
}
