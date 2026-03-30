import { render } from "@testing-library/react-native";
import { Redirect } from "expo-router";
import { useAuth } from "@/src/features/auth/hooks/useAuth";
import { useRepublicsQuery } from "@/src/features/republic/hooks/useRepublicQueries";
import LoadingScreen from "@/src/shared/components/ui/loading-screen";
import Index from "../index";

jest.mock("expo-router", () => ({
  __esModule: true,
  Redirect: jest.fn(() => null),
}));

jest.mock("@/src/features/auth/hooks/useAuth", () => ({
  __esModule: true,
  useAuth: jest.fn(),
}));

jest.mock("@/src/features/republic/hooks/useRepublicQueries", () => ({
  __esModule: true,
  useRepublicsQuery: jest.fn(),
}));

jest.mock("@/src/shared/components/ui/loading-screen", () => ({
  __esModule: true,
  default: jest.fn(() => null),
}));

const mockRedirect = jest.mocked(Redirect);
const mockUseAuth = jest.mocked(useAuth);
const mockUseRepublicsQuery = jest.mocked(useRepublicsQuery);
const mockLoadingScreen = jest.mocked(LoadingScreen);

describe("index route", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseRepublicsQuery.mockReturnValue({
      data: [],
      isLoading: false,
    } as never);
  });

  it("renderiza loading enquanto a autenticação está carregando", () => {
    mockUseAuth.mockReturnValue({
      user: null,
      isLoading: true,
    } as never);

    render(<Index />);

    expect(mockLoadingScreen).toHaveBeenCalledTimes(1);
    expect(mockLoadingScreen).toHaveBeenCalledWith(
      expect.objectContaining({ message: "Carregando..." }),
      undefined
    );
    expect(mockRedirect).not.toHaveBeenCalled();
  });

  it("redireciona para login quando não há usuário autenticado", () => {
    mockUseAuth.mockReturnValue({
      user: null,
      isLoading: false,
    } as never);

    render(<Index />);

    expect(mockRedirect).toHaveBeenCalledWith(
      expect.objectContaining({ href: "/(auth)/login" }),
      undefined
    );
  });

  it("redireciona para onboarding quando o perfil não está completo", () => {
    mockUseAuth.mockReturnValue({
      user: { perfilCompleto: false },
      isLoading: false,
    } as never);

    render(<Index />);

    expect(mockRedirect).toHaveBeenCalledWith(
      expect.objectContaining({ href: "/(auth)/onboarding" }),
      undefined
    );
  });

  it("redireciona para a república quando houver republicData", () => {
    mockUseAuth.mockReturnValue({
      user: { perfilCompleto: true },
      isLoading: false,
    } as never);
    mockUseRepublicsQuery.mockReturnValue({
      data: [{ id: "rep-1" }],
      isLoading: false,
    } as never);

    render(<Index />);

    expect(mockRedirect).toHaveBeenCalledWith(
      expect.objectContaining({ href: "/(republics)/rep-1" }),
      undefined
    );
  });

  it("redireciona para profile quando o usuário não participa de república", () => {
    mockUseAuth.mockReturnValue({
      user: { perfilCompleto: true },
      isLoading: false,
    } as never);
    mockUseRepublicsQuery.mockReturnValue({
      data: [],
      isLoading: false,
    } as never);

    render(<Index />);

    expect(mockRedirect).toHaveBeenCalledWith(
      expect.objectContaining({ href: "/(userProfile)/profile" }),
      undefined
    );
  });
});
