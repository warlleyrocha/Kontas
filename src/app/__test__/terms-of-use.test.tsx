import { render } from "@testing-library/react-native";
import type { ErrorBoundaryProps } from "expo-router";
import { LegalScreen } from "@/src/features/legal/screens/LegalScreen";
import { RouteErrorFallback } from "@/src/shared/components/error-boundary/RouteErrorFallback";
import { termsOfUse } from "@/src/shared/constants/legalContent";
import TermsOfUseRoute, { ErrorBoundary } from "../terms-of-use";

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

describe("terms-of-use route", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renderiza LegalScreen com TermsOfUse", () => {
    render(<TermsOfUseRoute />);

    expect(mockLegalScreen).toHaveBeenCalledTimes(1);
    expect(mockLegalScreen.mock.calls[0]?.[0]).toMatchObject({
      doc: termsOfUse,
    });
  });

  it("renderiza RouteErrorFallback com domain TermsOfUse", () => {
    const props = {
      error: new Error("falha"),
      retry: jest.fn(),
    } as ErrorBoundaryProps;

    render(<ErrorBoundary {...props} />);

    expect(mockRouteErrorFallback).toHaveBeenCalledTimes(1);
    expect(mockRouteErrorFallback.mock.calls[0]?.[0]).toMatchObject({
      domain: "TermsOfUse",
      error: props.error,
      retry: props.retry,
    });
  });
});
