import { render } from "@testing-library/react-native";
import type { ErrorBoundaryProps } from "expo-router";
import { LegalScreen } from "@/src/features/legal/screens/LegalScreen";
import { RouteErrorFallback } from "@/src/shared/components/error-boundary/RouteErrorFallback";
import { privacyPolicy } from "@/src/shared/constants/legalContent";
import PrivacyPolicyRoute, { ErrorBoundary } from "../privacy-policy";

jest.mock("@/src/features/legal/screens/LegalScreen", () => ({
  __esModule: true,
  LegalScreen: jest.fn(() => null),
}));

jest.mock("@/src/shared/components/error-boundary/RouteErrorFallback", () => ({
  __esModule: true,
  RouteErrorFallback: jest.fn(() => null),
}));

const mockLegalScreen = jest.mocked(LegalScreen);
const mockRouteErrorFallback = jest.mocked(RouteErrorFallback);

describe("privacy-policy route", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renderiza LegalScreen com privacyPolicy", () => {
    render(<PrivacyPolicyRoute />);

    expect(mockLegalScreen).toHaveBeenCalledTimes(1);
    expect(mockLegalScreen.mock.calls[0]?.[0]).toMatchObject({
      doc: privacyPolicy,
    });
  });

  it("renderiza RouteErrorFallback com domain PrivacyPolicy", () => {
    const props = {
      error: new Error("falha"),
      retry: jest.fn(),
    } as ErrorBoundaryProps;

    render(<ErrorBoundary {...props} />);

    expect(mockRouteErrorFallback).toHaveBeenCalledTimes(1);
    expect(mockRouteErrorFallback.mock.calls[0]?.[0]).toMatchObject({
      domain: "PrivacyPolicy",
      error: props.error,
      retry: props.retry,
    });
  });
});
