import { render } from "@testing-library/react-native";
import { Redirect } from "expo-router";
import { useRepublicsQuery } from "@/src/features/republic/hooks/useRepublicQueries";
import { useCurrentUserQuery } from "@/src/features/user/hooks/useUserQueries";
import LoadingScreen from "@/src/shared/components/ui/loading-screen";
import Index from "../index";

jest.mock("expo-router", () => ({
  __esModule: true,
  Redirect: jest.fn(() => null),
}));

jest.mock("@/src/features/user/hooks/useUserQueries", () => ({
  __esModule: true,
  useCurrentUserQuery: jest.fn(),
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
const mockUseCurrentUserQuery = jest.mocked(useCurrentUserQuery);
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
    mockUseCurrentUserQuery.mockReturnValue({
      data: null,
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
    mockUseCurrentUserQuery.mockReturnValue({
      data: null,
      isLoading: false,
    } as never);

    render(<Index />);

    expect(mockRedirect).toHaveBeenCalledWith(
      expect.objectContaining({ href: "/(auth)/login" }),
      undefined
    );
  });

  it("redireciona para onboarding quando o perfil não está completo", () => {
    mockUseCurrentUserQuery.mockReturnValue({
      data: { perfilCompleto: false },
      isLoading: false,
    } as never);

    render(<Index />);

    expect(mockRedirect).toHaveBeenCalledWith(
      expect.objectContaining({ href: "/(auth)/onboarding" }),
      undefined
    );
  });

  it("redireciona para a república quando houver republicData", () => {
    mockUseCurrentUserQuery.mockReturnValue({
      data: { perfilCompleto: true },
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
    mockUseCurrentUserQuery.mockReturnValue({
      data: { perfilCompleto: true },
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
