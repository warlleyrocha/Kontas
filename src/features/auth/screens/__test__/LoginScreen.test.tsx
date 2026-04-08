import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { act, fireEvent, render, screen } from "@testing-library/react-native";
import { useRouter } from "expo-router";
import { ActivityIndicator, TouchableOpacity } from "react-native";
import { useLoginWithGoogleMutation } from "@/src/features/auth/hooks/useAuthMutations";
import { getErrorMessage } from "@/src/services/httpError";
import { showToast } from "@/src/shared/utils/showToast";
import LoginScreen from "../LoginScreen";

jest.mock("@react-native-google-signin/google-signin", () => ({
  GoogleSignin: {
    hasPlayServices: jest.fn(),
    signIn: jest.fn(),
  },
}));
jest.mock("expo-router", () => ({ useRouter: jest.fn() }));
jest.mock("@/assets/images/google-icon.svg", () => "GoogleIcon");
jest.mock("@/assets/images/image-login.webp", () => 0);
jest.mock("@/src/features/auth/hooks/useAuthMutations", () => ({
  useLoginWithGoogleMutation: jest.fn(),
}));
jest.mock("@/src/services/httpError", () => ({
  getErrorMessage: jest.fn(),
}));
jest.mock("@/src/shared/hooks/useComponentLogger", () => ({
  useComponentLogger: jest.fn(),
}));
jest.mock("@/src/shared/utils/showToast", () => ({
  showToast: { error: jest.fn() },
}));

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const mockLoginWithGoogle = jest.fn();
const mockRouterReplace = jest.fn();
const mockRouterPush = jest.fn();

const serializeError = (error: Error) =>
  JSON.stringify(error, Object.getOwnPropertyNames(error), 2);

// ─── Setup ────────────────────────────────────────────────────────────────────

let consoleErrorSpy: jest.SpyInstance;

beforeEach(() => {
  jest.clearAllMocks();
  jest.mocked(useLoginWithGoogleMutation).mockReturnValue({
    mutateAsync: mockLoginWithGoogle,
    error: null,
  } as any);
  jest.mocked(useRouter).mockReturnValue({
    replace: mockRouterReplace,
    push: mockRouterPush,
  } as any);
  jest.mocked(GoogleSignin.hasPlayServices).mockResolvedValue(true as any);
  jest.mocked(GoogleSignin.signIn).mockResolvedValue({
    data: { idToken: "google-token-123" },
  } as any);
  mockLoginWithGoogle.mockResolvedValue(true);
  consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  expect(consoleErrorSpy).not.toHaveBeenCalled();
  consoleErrorSpy.mockRestore();
});

// ─── LoginScreen ──────────────────────────────────────────────────────────────

describe("LoginScreen — renderização", () => {
  it("exibe o título 'Kontas'", () => {
    render(<LoginScreen />);
    expect(screen.getByText("Kontas")).toBeTruthy();
  });

  it("exibe o botão 'Entrar com Google'", () => {
    render(<LoginScreen />);
    expect(screen.getByText("Entrar com Google")).toBeTruthy();
  });

  it("não exibe ActivityIndicator inicialmente", () => {
    render(<LoginScreen />);
    expect(screen.UNSAFE_queryByType(ActivityIndicator)).toBeNull();
  });

  it("exibe o erro da mutation quando há erro", () => {
    jest.mocked(useLoginWithGoogleMutation).mockReturnValue({
      mutateAsync: mockLoginWithGoogle,
      error: new Error("Conta não encontrada"),
    } as any);
    render(<LoginScreen />);
    expect(screen.getByText("Conta não encontrada")).toBeTruthy();
  });

  it("exibe links de Termos de Uso e Política de Privacidade", () => {
    render(<LoginScreen />);
    expect(screen.getByText("Termos de Uso")).toBeTruthy();
    expect(screen.getByText("Política de Privacidade")).toBeTruthy();
  });
});

describe("LoginScreen — estado de carregamento", () => {
  it("ignora cliques adicionais enquanto o login está em andamento (L33)", async () => {
    let resolveHasPlay!: (v: any) => void;
    jest.mocked(GoogleSignin.hasPlayServices).mockReturnValue(
      new Promise((resolve) => {
        resolveHasPlay = resolve;
      })
    );

    render(<LoginScreen />);

    // Primeiro clique: isSigningIn = false → guard pulado, login inicia
    await act(async () => {
      fireEvent.press(screen.getByText("Entrar com Google"));
    });

    // Segundo clique: fireEvent ignora `disabled`, chamando handleGoogleLogin
    // com isSigningIn=true → L33 `if (isSigningIn) return` é executado
    const googleButton = screen
      .UNSAFE_getAllByType(TouchableOpacity)
      .find((b) => b.props.disabled === true);
    expect(googleButton).toBeDefined();
    await act(async () => {
      fireEvent.press(googleButton);
    });

    // hasPlayServices chamado apenas 1 vez — segundo clique foi bloqueado
    expect(GoogleSignin.hasPlayServices).toHaveBeenCalledTimes(1);

    await act(async () => {
      resolveHasPlay(undefined);
    });
  });

  it("exibe ActivityIndicator enquanto o login está em andamento", async () => {
    let resolveHasPlay!: (v: any) => void;
    jest.mocked(GoogleSignin.hasPlayServices).mockReturnValue(
      new Promise((resolve) => {
        resolveHasPlay = resolve;
      })
    );

    render(<LoginScreen />);
    await act(async () => {
      fireEvent.press(screen.getByText("Entrar com Google"));
    });

    expect(screen.UNSAFE_queryByType(ActivityIndicator)).toBeTruthy();
    expect(screen.queryByText("Entrar com Google")).toBeNull();

    // Limpa o estado pendente
    await act(async () => {
      resolveHasPlay(undefined);
    });
  });
});

describe("LoginScreen — fluxo de login com Google", () => {
  it("chama hasPlayServices e signIn ao pressionar o botão", async () => {
    render(<LoginScreen />);
    await act(async () => {
      fireEvent.press(screen.getByText("Entrar com Google"));
    });
    expect(GoogleSignin.hasPlayServices).toHaveBeenCalledTimes(1);
    expect(GoogleSignin.signIn).toHaveBeenCalledTimes(1);
  });

  it("navega para '/' após login bem-sucedido", async () => {
    render(<LoginScreen />);
    await act(async () => {
      fireEvent.press(screen.getByText("Entrar com Google"));
    });
    expect(mockRouterReplace).toHaveBeenCalledWith("/");
  });

  it("não navega quando loginWithGoogle retorna falsy", async () => {
    mockLoginWithGoogle.mockResolvedValue(null);
    render(<LoginScreen />);
    await act(async () => {
      fireEvent.press(screen.getByText("Entrar com Google"));
    });
    expect(mockRouterReplace).not.toHaveBeenCalled();
  });

  it("chama showToast.error quando o token do Google é nulo", async () => {
    jest.mocked(GoogleSignin.signIn).mockResolvedValue({
      data: { idToken: null },
    } as any);
    render(<LoginScreen />);
    await act(async () => {
      fireEvent.press(screen.getByText("Entrar com Google"));
    });
    expect(showToast.error).toHaveBeenCalledWith(
      "Não foi possível obter o token do Google"
    );
    expect(mockRouterReplace).not.toHaveBeenCalled();
  });

  it("chama loginWithGoogle com o token obtido do Google", async () => {
    render(<LoginScreen />);
    await act(async () => {
      fireEvent.press(screen.getByText("Entrar com Google"));
    });
    expect(mockLoginWithGoogle).toHaveBeenCalledWith("google-token-123");
  });

  it("chama showToast.error e console.error em caso de exceção", async () => {
    const err = new Error("Falha no Google");
    jest.mocked(GoogleSignin.hasPlayServices).mockRejectedValue(err);
    jest
      .mocked(getErrorMessage)
      .mockReturnValue("Erro ao fazer login com Google. Tente novamente.");
    render(<LoginScreen />);
    await act(async () => {
      fireEvent.press(screen.getByText("Entrar com Google"));
    });
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "[ERROR][Login]",
      "Erro no login:",
      serializeError(err)
    );
    expect(showToast.error).toHaveBeenCalledWith(
      "Erro ao fazer login com Google. Tente novamente."
    );
    consoleErrorSpy.mockClear();
  });
});

describe("LoginScreen — navegação de links", () => {
  it("navega para /terms-of-use ao pressionar Termos de Uso", () => {
    render(<LoginScreen />);
    fireEvent.press(screen.getByText("Termos de Uso"));
    expect(mockRouterPush).toHaveBeenCalledWith("/terms-of-use");
  });

  it("navega para /privacy-policy ao pressionar Política de Privacidade", () => {
    render(<LoginScreen />);
    fireEvent.press(screen.getByText("Política de Privacidade"));
    expect(mockRouterPush).toHaveBeenCalledWith("/privacy-policy");
  });
});
