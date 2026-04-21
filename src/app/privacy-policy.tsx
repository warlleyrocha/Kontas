import type { ErrorBoundaryProps } from "expo-router";
import { LegalScreen } from "@/src/features/legal/screens/LegalScreen";
import { RouteErrorFallback } from "@/src/shared/components/error-boundary/RouteErrorFallback";
import { privacyPolicy } from "@/src/shared/constants/legalContent";

export default function PrivacyPolicyRoute() {
  return <LegalScreen doc={privacyPolicy} />;
}

export function ErrorBoundary(props: Readonly<ErrorBoundaryProps>) {
  return <RouteErrorFallback domain="PrivacyPolicy" {...props} />;
}
