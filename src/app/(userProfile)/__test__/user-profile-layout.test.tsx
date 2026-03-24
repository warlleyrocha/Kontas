import { render } from "@testing-library/react-native";
import type { ErrorBoundaryProps } from "expo-router";
import { Stack } from "expo-router";
import UserProfileLayout, { ErrorBoundary } from "../_layout";
import { RouteErrorFallback } from "@/src/shared/components/error-boundary/RouteErrorFallback";

jest.mock("expo-router", () => ({
  __esModule: true,
  Stack: jest.fn(() => null),
}));

jest.mock("@/src/shared/components/error-boundary/RouteErrorFallback", () => ({
  __esModule: true,
  RouteErrorFallback: jest.fn(() => null),
}));

const mockStack = jest.mocked(Stack);
const mockRouteErrorFallback = jest.mocked(RouteErrorFallback);

describe("userProfile layout", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renderiza Stack com header oculto", () => {
    render(<UserProfileLayout />);

    expect(mockStack).toHaveBeenCalledTimes(1);
    expect(mockStack).toHaveBeenCalledWith(
      expect.objectContaining({
        screenOptions: { headerShown: false },
      }),
      undefined
    );
  });

  it("renderiza RouteErrorFallback com domain UserProfile", () => {
    const props = {
      error: new Error("falha"),
      retry: jest.fn(),
    } as ErrorBoundaryProps;

    render(<ErrorBoundary {...props} />);

    expect(mockRouteErrorFallback).toHaveBeenCalledTimes(1);
    expect(mockRouteErrorFallback.mock.calls[0]?.[0]).toMatchObject({
      domain: "UserProfile",
      error: props.error,
      retry: props.retry,
    });
  });
});
