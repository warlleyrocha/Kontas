import { render } from "@testing-library/react-native";
import { Redirect } from "expo-router";
import { useAuth } from "@/src/features/auth/contexts";
import LoadingScreen from "@/src/shared/components/ui/loading-screen";
import Index from "../index";

jest.mock("expo-router", () => ({
  __esModule: true,
  Redirect: jest.fn(() => null),
}));

jest.mock("@/src/features/auth/contexts", () => ({
  __esModule: true,
  useAuth: jest.fn(),
}));

jest.mock("@/src/shared/components/ui/loading-screen", () => ({
  __esModule: true,
  default: jest.fn(() => null),
}));

const mockRedirect = jest.mocked(Redirect);
const mockUseAuth = jest.mocked(useAuth);
const mockLoadingScreen = jest.mocked(LoadingScreen);

describe("index route", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renderiza loading enquanto a autenticação está carregando", () => {
    mockUseAuth.mockReturnValue({
      user: null,
      loading: true,
      republicData: undefined,
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
      loading: false,
      republicData: undefined,
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
      loading: false,
      republicData: undefined,
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
      loading: false,
      republicData: [{ id: "rep-1" }],
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
      loading: false,
      republicData: [],
    } as never);

    render(<Index />);

    expect(mockRedirect).toHaveBeenCalledWith(
      expect.objectContaining({ href: "/(userProfile)/profile" }),
      undefined
    );
  });
});
