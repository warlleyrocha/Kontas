import { render } from "@testing-library/react-native";
import { Redirect } from "expo-router";
import { useAuthSession } from "@/src/features/auth/hooks/useAuth";
import { useRepublicsQuery } from "@/src/features/republic/hooks/useRepublicQueries";
import LoadingScreen from "@/src/shared/components/ui/loading-screen";
import SessionErrorScreen from "@/src/shared/components/ui/session-error-screen";
import Index from "../index";

jest.mock("expo-router", () => ({
  __esModule: true,
  Redirect: jest.fn(() => null),
}));

jest.mock("@/src/features/auth/hooks/useAuth", () => ({
  __esModule: true,
  useAuthSession: jest.fn(),
}));

jest.mock("@/src/features/republic/hooks/useRepublicQueries", () => ({
  __esModule: true,
  useRepublicsQuery: jest.fn(),
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
const mockUseAuthSession = jest.mocked(useAuthSession);
const mockUseRepublicsQuery = jest.mocked(useRepublicsQuery);
const mockLoadingScreen = jest.mocked(LoadingScreen);
const mockSessionErrorScreen = jest.mocked(SessionErrorScreen);

describe("index route", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAuthSession.mockReturnValue({
      authenticatedUser: null,
      cachedUser: null,
      isLoading: false,
      isError: false,
      refetch: jest.fn(),
    } as never);
    mockUseRepublicsQuery.mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
      refetch: jest.fn(),
    } as never);
  });

  it("renderiza loading enquanto a autenticação está carregando", () => {
    mockUseAuthSession.mockReturnValue({
      authenticatedUser: null,
      cachedUser: { nome: "Ana" },
      isLoading: true,
      isError: false,
      refetch: jest.fn(),
    } as never);

    render(<Index />);

    expect(mockLoadingScreen).toHaveBeenCalledTimes(1);
    expect(mockLoadingScreen).toHaveBeenCalledWith(
      expect.objectContaining({ message: "Carregando dados de Ana..." }),
      undefined
    );
    expect(mockRedirect).not.toHaveBeenCalled();
  });

  it("mantém uma única mensagem de loading enquanto carrega as repúblicas iniciais", () => {
    mockUseAuthSession.mockReturnValue({
      authenticatedUser: { perfilCompleto: true },
      cachedUser: { nome: "Ana" },
      isLoading: false,
      isError: false,
      refetch: jest.fn(),
    } as never);
    mockUseRepublicsQuery.mockReturnValue({
      data: [],
      isLoading: true,
      isError: false,
      refetch: jest.fn(),
    } as never);

    render(<Index />);

    expect(mockLoadingScreen).toHaveBeenCalledWith(
      expect.objectContaining({ message: "Carregando dados de Ana..." }),
      undefined
    );
    expect(mockRedirect).not.toHaveBeenCalled();
  });

  it("renderiza erro quando a validação da sessão falha", () => {
    mockUseAuthSession.mockReturnValue({
      authenticatedUser: null,
      cachedUser: { nome: "Ana" },
      isLoading: false,
      isError: true,
      refetch: jest.fn(),
    } as never);

    render(<Index />);

    expect(mockSessionErrorScreen).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Sessão indisponível",
        message:
          "Não foi possível validar a sessão de Ana. Verifique sua conexão e tente novamente.",
        onRetry: expect.any(Function),
      }),
      undefined
    );
    expect(mockRedirect).not.toHaveBeenCalled();
  });

  it("renderiza erro quando falha ao carregar repúblicas", () => {
    mockUseAuthSession.mockReturnValue({
      authenticatedUser: { perfilCompleto: true },
      cachedUser: null,
      isLoading: false,
      isError: false,
      refetch: jest.fn(),
    } as never);
    mockUseRepublicsQuery.mockReturnValue({
      data: [],
      isLoading: false,
      isError: true,
      refetch: jest.fn(),
    } as never);

    render(<Index />);

    expect(mockSessionErrorScreen).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Não foi possível carregar seus dados",
        message: "Verifique sua conexão e tente carregar novamente.",
        onRetry: expect.any(Function),
      }),
      undefined
    );
    expect(mockRedirect).not.toHaveBeenCalled();
  });

  it("redireciona para login quando não há usuário autenticado", () => {
    render(<Index />);

    expect(mockRedirect).toHaveBeenCalledWith(
      expect.objectContaining({ href: "/(auth)/login" }),
      undefined
    );
  });

  it("redireciona para onboarding quando o perfil não está completo", () => {
    mockUseAuthSession.mockReturnValue({
      authenticatedUser: { perfilCompleto: false },
      cachedUser: null,
      isLoading: false,
      isError: false,
      refetch: jest.fn(),
    } as never);

    render(<Index />);

    expect(mockRedirect).toHaveBeenCalledWith(
      expect.objectContaining({ href: "/(auth)/onboarding" }),
      undefined
    );
  });

  it("redireciona para a república quando houver republicData", () => {
    mockUseAuthSession.mockReturnValue({
      authenticatedUser: { perfilCompleto: true },
      cachedUser: null,
      isLoading: false,
      isError: false,
      refetch: jest.fn(),
    } as never);
    mockUseRepublicsQuery.mockReturnValue({
      data: [{ id: "rep-1" }],
      isLoading: false,
      isError: false,
      refetch: jest.fn(),
    } as never);

    render(<Index />);

    expect(mockRedirect).toHaveBeenCalledWith(
      expect.objectContaining({ href: "/(republics)/rep-1" }),
      undefined
    );
  });

  it("redireciona para profile quando o usuário não participa de república", () => {
    mockUseAuthSession.mockReturnValue({
      authenticatedUser: { perfilCompleto: true },
      cachedUser: null,
      isLoading: false,
      isError: false,
      refetch: jest.fn(),
    } as never);
    mockUseRepublicsQuery.mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
      refetch: jest.fn(),
    } as never);

    render(<Index />);

    expect(mockRedirect).toHaveBeenCalledWith(
      expect.objectContaining({ href: "/(userProfile)/profile" }),
      undefined
    );
  });

  it("chama refetchSession ao pressionar retry na tela de erro de sessão", () => {
    const refetchSession = jest.fn();
    mockUseAuthSession.mockReturnValue({
      authenticatedUser: null,
      cachedUser: null,
      isLoading: false,
      isError: true,
      refetch: refetchSession,
    } as never);

    render(<Index />);

    const { onRetry } = mockSessionErrorScreen.mock.calls[0][0];
    onRetry();

    expect(refetchSession).toHaveBeenCalledTimes(1);
  });

  it("chama refetchRepublics ao pressionar retry na tela de erro de repúblicas", () => {
    const refetchRepublics = jest.fn();
    mockUseAuthSession.mockReturnValue({
      authenticatedUser: { perfilCompleto: true },
      cachedUser: null,
      isLoading: false,
      isError: false,
      refetch: jest.fn(),
    } as never);
    mockUseRepublicsQuery.mockReturnValue({
      data: [],
      isLoading: false,
      isError: true,
      refetch: refetchRepublics,
    } as never);

    render(<Index />);

    const { onRetry } = mockSessionErrorScreen.mock.calls[0][0];
    onRetry();

    expect(refetchRepublics).toHaveBeenCalledTimes(1);
  });
});
