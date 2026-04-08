import { render } from "@testing-library/react-native";
import type { ErrorBoundaryProps } from "expo-router";
import { Redirect, useLocalSearchParams } from "expo-router";
import PaymentsScreen from "@/src/features/accounts/screens/PaymentsScreen";
import { InvitesSentScreen } from "@/src/features/invites";
import { RepublicScreen } from "@/src/features/republic";
import { RouteErrorFallback } from "@/src/shared/components/error-boundary/RouteErrorFallback";
import RepublicRoute from "../[id]/index";
import InvitesSentRoute, {
  ErrorBoundary as InvitesSentErrorBoundary,
} from "../[id]/invites-sent";
import PaymentsRoute, {
  ErrorBoundary as PaymentsErrorBoundary,
} from "../[id]/payments";

jest.mock("expo-router", () => ({
  __esModule: true,
  Redirect: jest.fn(() => null),
  useLocalSearchParams: jest.fn(),
}));

jest.mock("@/src/features/republic", () => ({
  __esModule: true,
  RepublicScreen: jest.fn(() => null),
}));

jest.mock("@/src/features/invites", () => ({
  __esModule: true,
  InvitesSentScreen: jest.fn(() => null),
}));

jest.mock("@/src/features/accounts/screens/PaymentsScreen", () => ({
  __esModule: true,
  default: jest.fn(() => null),
}));

jest.mock("@/src/shared/components/error-boundary/RouteErrorFallback", () => ({
  __esModule: true,
  RouteErrorFallback: jest.fn(() => null),
}));

const mockRedirect = jest.mocked(Redirect);
const mockUseLocalSearchParams = jest.mocked(useLocalSearchParams);
const mockRepublicScreen = jest.mocked(RepublicScreen);
const mockInvitesSentScreen = jest.mocked(InvitesSentScreen);
const mockPaymentsScreen = jest.mocked(PaymentsScreen);
const mockRouteErrorFallback = jest.mocked(RouteErrorFallback);

describe("republic [id] routes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("redireciona index para / quando não houver id", () => {
    mockUseLocalSearchParams.mockReturnValue({} as never);

    render(<RepublicRoute />);

    expect(mockRedirect).toHaveBeenCalledWith(
      expect.objectContaining({ href: "/" }),
      undefined
    );
    expect(mockRepublicScreen).not.toHaveBeenCalled();
  });

  it("renderiza RepublicScreen no index quando houver id", () => {
    mockUseLocalSearchParams.mockReturnValue({ id: "rep-1" } as never);

    render(<RepublicRoute />);

    expect(mockRepublicScreen).toHaveBeenCalledWith(
      expect.objectContaining({ republicId: "rep-1" }),
      undefined
    );
    expect(mockRedirect).not.toHaveBeenCalled();
  });

  it("redireciona invites-sent para / quando não houver id", () => {
    mockUseLocalSearchParams.mockReturnValue({} as never);

    render(<InvitesSentRoute />);

    expect(mockRedirect).toHaveBeenCalledWith(
      expect.objectContaining({ href: "/" }),
      undefined
    );
    expect(mockInvitesSentScreen).not.toHaveBeenCalled();
  });

  it("renderiza InvitesSentScreen quando houver id", () => {
    mockUseLocalSearchParams.mockReturnValue({ id: "rep-2" } as never);

    render(<InvitesSentRoute />);

    expect(mockInvitesSentScreen).toHaveBeenCalledWith(
      expect.objectContaining({ republicId: "rep-2" }),
      undefined
    );
    expect(mockRedirect).not.toHaveBeenCalled();
  });

  it("renderiza RouteErrorFallback com domain Invites", () => {
    const props = {
      error: new Error("falha"),
      retry: jest.fn(),
    } as ErrorBoundaryProps;

    render(<InvitesSentErrorBoundary {...props} />);

    expect(mockRouteErrorFallback).toHaveBeenCalledWith(
      expect.objectContaining({
        domain: "Invites",
        error: props.error,
        retry: props.retry,
      }),
      undefined
    );
  });

  it("redireciona payments para / quando não houver id", () => {
    mockUseLocalSearchParams.mockReturnValue({} as never);

    render(<PaymentsRoute />);

    expect(mockRedirect).toHaveBeenCalledWith(
      expect.objectContaining({ href: "/" }),
      undefined
    );
    expect(mockPaymentsScreen).not.toHaveBeenCalled();
  });

  it("renderiza PaymentsScreen quando houver id", () => {
    mockUseLocalSearchParams.mockReturnValue({ id: "rep-3" } as never);

    render(<PaymentsRoute />);

    expect(mockPaymentsScreen).toHaveBeenCalledWith(
      expect.objectContaining({ republicId: "rep-3" }),
      undefined
    );
    expect(mockRedirect).not.toHaveBeenCalled();
  });

  it("renderiza RouteErrorFallback com domain Payments", () => {
    const props = {
      error: new Error("falha"),
      retry: jest.fn(),
    } as ErrorBoundaryProps;

    render(<PaymentsErrorBoundary {...props} />);

    expect(mockRouteErrorFallback).toHaveBeenCalledWith(
      expect.objectContaining({
        domain: "Payments",
        error: props.error,
        retry: props.retry,
      }),
      undefined
    );
  });
});
