import { render } from "@testing-library/react-native";
import type { ErrorBoundaryProps } from "expo-router";
import { Redirect, Stack } from "expo-router";
import { useProtectedSession } from "@/src/features/auth/hooks/useAuth";
import UserProfileLayout, { ErrorBoundary } from "../_layout";
import { RouteErrorFallback } from "@/src/shared/components/error-boundary/RouteErrorFallback";
import LoadingScreen from "@/src/shared/components/ui/loading-screen";
import SessionErrorScreen from "@/src/shared/components/ui/session-error-screen";

jest.mock("expo-router", () => ({
  __esModule: true,
  Redirect: jest.fn(() => null),
  Stack: jest.fn(() => null),
}));

jest.mock("@/src/features/auth/hooks/useAuth", () => ({
  __esModule: true,
  useProtectedSession: jest.fn(),
}));

jest.mock("@/src/shared/components/error-boundary/RouteErrorFallback", () => ({
  __esModule: true,
  RouteErrorFallback: jest.fn(() => null),
}));

jest.mock("@/src/shared/components/ui/loading-screen", () => ({
  __esModule: true,
  default: jest.fn(() => null),
}));

jest.mock("@/src/shared/components/ui/session-error-screen", () => ({
  __esModule: true,
  default: jest.fn(() => null),
}));

const mockRedirect = jest.mocked(Redirect);
const mockStack = jest.mocked(Stack);
const mockUseProtectedSession = jest.mocked(useProtectedSession);
const mockRouteErrorFallback = jest.mocked(RouteErrorFallback);
const mockLoadingScreen = jest.mocked(LoadingScreen);
const mockSessionErrorScreen = jest.mocked(SessionErrorScreen);

describe("userProfile layout", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseProtectedSession.mockReturnValue({
      authenticatedUser: { id: "user-1", email: "ana@example.com" },
      cachedUser: null,
      isLoading: false,
      isError: false,
      refetch: jest.fn(),
    } as never);
  });

  it("renderiza loading enquanto a sessão protegida está carregando", () => {
    mockUseProtectedSession.mockReturnValue({
      authenticatedUser: null,
      cachedUser: { nome: "Ana" },
      isLoading: true,
      isError: false,
      refetch: jest.fn(),
    } as never);

    render(<UserProfileLayout />);

    expect(mockLoadingScreen).toHaveBeenCalledWith(
      expect.objectContaining({ message: "Validando sessão de Ana..." }),
      undefined
    );
    expect(mockStack).not.toHaveBeenCalled();
    expect(mockRedirect).not.toHaveBeenCalled();
  });

  it("renderiza erro quando a validação da sessão falha", () => {
    mockUseProtectedSession.mockReturnValue({
      authenticatedUser: null,
      cachedUser: { nome: "Ana" },
      isLoading: false,
      isError: true,
      refetch: jest.fn(),
    } as never);

    render(<UserProfileLayout />);

    expect(mockSessionErrorScreen).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Sessão indisponível",
        message:
          "Não foi possível validar a sessão de Ana. Verifique sua conexão e tente novamente.",
        onRetry: expect.any(Function),
      }),
      undefined
    );
    expect(mockStack).not.toHaveBeenCalled();
    expect(mockRedirect).not.toHaveBeenCalled();
  });

  it("redireciona para login quando não há sessão autenticada", () => {
    mockUseProtectedSession.mockReturnValue({
      authenticatedUser: null,
      cachedUser: null,
      isLoading: false,
      isError: false,
      refetch: jest.fn(),
    } as never);

    render(<UserProfileLayout />);

    expect(mockRedirect).toHaveBeenCalledWith(
      expect.objectContaining({ href: "/(auth)/login" }),
      undefined
    );
    expect(mockStack).not.toHaveBeenCalled();
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
    expect(mockRedirect).not.toHaveBeenCalled();
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
