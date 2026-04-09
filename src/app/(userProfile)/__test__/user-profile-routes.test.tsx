import { render } from "@testing-library/react-native";
import type { ErrorBoundaryProps } from "expo-router";
import { InviteInboxScreen } from "@/src/features/invites";
import { ProfileScreen } from "@/src/features/user";
import { RouteErrorFallback } from "@/src/shared/components/error-boundary/RouteErrorFallback";
import InvitesRoute, {
  ErrorBoundary as InvitesErrorBoundary,
} from "../invites";
import ProfileRoute from "../profile";

jest.mock("@/src/features/invites", () => ({
  __esModule: true,
  InviteInboxScreen: jest.fn(() => null),
}));

jest.mock("@/src/features/user", () => ({
  __esModule: true,
  ProfileScreen: jest.fn(() => null),
}));

jest.mock("@/src/shared/components/error-boundary/RouteErrorFallback", () => ({
  __esModule: true,
  RouteErrorFallback: jest.fn(() => null),
}));

const mockInviteInboxScreen = jest.mocked(InviteInboxScreen);
const mockProfileScreen = jest.mocked(ProfileScreen);
const mockRouteErrorFallback = jest.mocked(RouteErrorFallback);

describe("userProfile routes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renderiza InviteInboxScreen na rota invites", () => {
    render(<InvitesRoute />);

    expect(mockInviteInboxScreen).toHaveBeenCalledTimes(1);
  });

  it("renderiza RouteErrorFallback com domain Invites na rota invites", () => {
    const props = {
      error: new Error("falha"),
      retry: jest.fn(),
    } as ErrorBoundaryProps;

    render(<InvitesErrorBoundary {...props} />);

    expect(mockRouteErrorFallback).toHaveBeenCalledTimes(1);
    expect(mockRouteErrorFallback.mock.calls[0]?.[0]).toMatchObject({
      domain: "Invites",
      error: props.error,
      retry: props.retry,
    });
  });

  it("renderiza ProfileScreen na rota profile", () => {
    render(<ProfileRoute />);

    expect(mockProfileScreen).toHaveBeenCalledTimes(1);
  });
});
