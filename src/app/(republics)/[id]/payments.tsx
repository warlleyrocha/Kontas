import {
  type ErrorBoundaryProps,
  Redirect,
  useLocalSearchParams,
} from "expo-router";
import PaymentsScreen from "@/src/features/accounts/screens/PaymentsScreen";
import { RouteErrorFallback } from "@/src/shared/components/error-boundary/RouteErrorFallback";

export default function PaymentsRoute() {
  const { id: republicId } = useLocalSearchParams<{ id?: string }>();
  if (!republicId) return <Redirect href="/" />;
  return <PaymentsScreen republicId={republicId} />;
}

export function ErrorBoundary(props: ErrorBoundaryProps) {
  return <RouteErrorFallback domain="Payments" {...props} />;
}
