import type { ErrorBoundaryProps } from "expo-router";
import { LegalScreen } from "@/src/features/legal/screens/LegalScreen";
import { RouteErrorFallback } from "@/src/shared/components/error-boundary/RouteErrorFallback";
import { termsOfUse } from "@/src/shared/constants/legalContent";

export default function TermsOfUseRoute() {
  return <LegalScreen doc={termsOfUse} />;
}

export function ErrorBoundary(props: Readonly<ErrorBoundaryProps>) {
  return <RouteErrorFallback domain="TermsOfUse" {...props} />;
}
