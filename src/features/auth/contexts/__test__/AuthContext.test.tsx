import AsyncStorage from "@react-native-async-storage/async-storage";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import React from "react";
import { act, renderHook } from "@testing-library/react-native";
import { authService } from "@/src/features/auth/services/auth.service";
import type {
  AuthResponse,
  CompleteProfileRequest,
  User,
} from "@/src/features/auth/types/auth.types";
import { userService } from "@/src/features/user/services/user.service";
import { getErrorMessage, isUnauthorizedError } from "@/src/services/httpError";
import { logger } from "@/src/shared/utils/logger";
import { showToast } from "@/src/shared/utils/showToast";
import { AuthProvider, useAuth } from "../AuthContext";

jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  multiRemove: jest.fn(),
}));

jest.mock("@react-native-google-signin/google-signin", () => ({
  GoogleSignin: { signOut: jest.fn() },
}));

jest.mock("@tanstack/react-query", () => ({
  useQueryClient: jest.fn(),
}));

jest.mock("expo-router", () => ({
  router: { replace: jest.fn() },
}));

jest.mock("@/src/features/auth/services/auth.service", () => ({
  authService: { googleLogin: jest.fn(), completeProfile: jest.fn() },
}));

jest.mock("@/src/features/user/services/user.service", () => ({
  userService: { fetchUser: jest.fn(), updateUser: jest.fn() },
}));

jest.mock("@/src/services/httpError", () => ({
  getErrorMessage: jest.fn(),
  isUnauthorizedError: jest.fn(),
}));

jest.mock("@/src/shared/utils/logger", () => ({
  logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
}));

jest.mock("@/src/shared/utils/showToast", () => ({
  showToast: { error: jest.fn(), success: jest.fn() },
}));

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const mockUser: User = {
  id: "u-1",
  nome: "Ana",
  email: "ana@email.com",
  perfilCompleto: true,
};

const mockAuthResponse: AuthResponse = { token: "jwt-abc", user: mockUser };

// ─── Helpers ──────────────────────────────────────────────────────────────────

const mockQueryClient = {
  cancelQueries: jest.fn().mockResolvedValue(undefined),
  clear: jest.fn(),
};

function mockStorageNoToken() {
  jest.mocked(AsyncStorage.getItem).mockResolvedValue(null);
}

function mockStorageWithToken(
  user: User = mockUser,
  republicData: string | null = null
) {
  jest.mocked(AsyncStorage.getItem).mockImplementation((key: string) => {
    if (key === "@app:token") return Promise.resolve("jwt-abc");
    if (key === "@app:user") return Promise.resolve(JSON.stringify(user));
    if (key === "republic-data") return Promise.resolve(republicData);
    return Promise.resolve(null);
  });
}

function mockStorageWithTokenButNoUser(republicData: string | null = null) {
  jest.mocked(AsyncStorage.getItem).mockImplementation((key: string) => {
    if (key === "@app:token") return Promise.resolve("jwt-abc");
    if (key === "@app:user") return Promise.resolve(null);
    if (key === "republic-data") return Promise.resolve(republicData);
    return Promise.resolve(null);
  });
}

function renderWithProvider() {
  return renderHook(() => useAuth(), {
    wrapper: ({ children }: { children: React.ReactNode }) => (
      <AuthProvider>{children}</AuthProvider>
    ),
  });
}

async function flush() {
  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
  });
}

// ─── Setup ────────────────────────────────────────────────────────────────────

beforeEach(() => {
  jest.clearAllMocks();
  jest.mocked(useQueryClient).mockReturnValue(mockQueryClient as any);
  jest.mocked(AsyncStorage.setItem).mockResolvedValue(undefined);
  jest.mocked(AsyncStorage.multiRemove).mockResolvedValue(undefined);
  jest.mocked(GoogleSignin.signOut).mockResolvedValue(undefined as any);
  jest.mocked(isUnauthorizedError).mockReturnValue(false);
  jest
    .mocked(getErrorMessage)
    .mockImplementation((_err, fallback) => fallback ?? "erro");
  mockStorageNoToken();
});

// ─── useAuth ──────────────────────────────────────────────────────────────────

describe("useAuth", () => {
  it("lança erro quando usado fora do AuthProvider", () => {
    expect(() => renderHook(() => useAuth())).toThrow(
      "❌ useAuth deve ser usado dentro de um AuthProvider"
    );
  });

  it("retorna o contexto quando usado dentro do AuthProvider", async () => {
    mockStorageNoToken();
    const { result } = renderWithProvider();
    await flush();

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(typeof result.current.loginWithGoogle).toBe("function");
    expect(typeof result.current.logout).toBe("function");
    expect(typeof result.current.updateUser).toBe("function");
    expect(typeof result.current.completeProfile).toBe("function");
  });
});

// ─── checkAuth — sem token ────────────────────────────────────────────────────

describe("checkAuth — sem token", () => {
  it("define loading=false e user=null quando não há token no storage", async () => {
    mockStorageNoToken();
    const { result } = renderWithProvider();
    await flush();

    expect(result.current.loading).toBe(false);
    expect(result.current.user).toBeNull();
    expect(jest.mocked(userService.fetchUser)).not.toHaveBeenCalled();
  });
});

// ─── checkAuth — com token ────────────────────────────────────────────────────

describe("checkAuth — com token válido", () => {
  it("pré-carrega o usuário do cache e valida com o backend", async () => {
    mockStorageWithToken();
    jest.mocked(userService.fetchUser).mockResolvedValue(mockUser);

    const { result } = renderWithProvider();
    await flush();

    expect(jest.mocked(userService.fetchUser)).toHaveBeenCalledTimes(1);
    expect(result.current.user).toEqual(mockUser);
    expect(result.current.loading).toBe(false);
  });

  it("valida o token mesmo sem usuário em cache", async () => {
    mockStorageWithTokenButNoUser();
    jest.mocked(userService.fetchUser).mockResolvedValue(mockUser);

    const { result } = renderWithProvider();
    await flush();

    expect(jest.mocked(userService.fetchUser)).toHaveBeenCalledTimes(1);
    expect(result.current.user).toEqual(mockUser);
    expect(result.current.loading).toBe(false);
  });

  it("salva o usuário atualizado no AsyncStorage após fetchUser", async () => {
    mockStorageWithToken();
    jest.mocked(userService.fetchUser).mockResolvedValue(mockUser);

    renderWithProvider();
    await flush();

    expect(jest.mocked(AsyncStorage.setItem)).toHaveBeenCalledWith(
      "@app:user",
      JSON.stringify(mockUser)
    );
  });
});

describe("checkAuth — token inválido (401)", () => {
  it("limpa storage, cancela queries e define user=null", async () => {
    mockStorageWithToken();
    const authError = new Error("Unauthorized");
    jest.mocked(userService.fetchUser).mockRejectedValue(authError);
    jest.mocked(isUnauthorizedError).mockReturnValue(true);

    const { result } = renderWithProvider();
    await flush();

    expect(mockQueryClient.cancelQueries).toHaveBeenCalled();
    expect(jest.mocked(AsyncStorage.multiRemove)).toHaveBeenCalledWith([
      "@app:token",
      "@app:user",
    ]);
    expect(result.current.user).toBeNull();
  });
});

describe("checkAuth — falha transitória de rede", () => {
  it("preserva a sessão local em falhas não-401", async () => {
    mockStorageWithToken();
    jest.mocked(userService.fetchUser).mockRejectedValue(new Error("network"));
    jest.mocked(isUnauthorizedError).mockReturnValue(false);
    jest.mocked(getErrorMessage).mockReturnValue("Erro de rede");

    const { result } = renderWithProvider();
    await flush();

    // Usuário do cache foi carregado e mantido
    expect(result.current.user).toEqual(mockUser);
    expect(jest.mocked(AsyncStorage.multiRemove)).not.toHaveBeenCalled();
  });
});

describe("checkAuth — erro externo (AsyncStorage lança)", () => {
  it("loga o erro e define loading=false mesmo com falha no storage", async () => {
    jest.mocked(AsyncStorage.getItem).mockImplementation((key: string) => {
      if (key === "@app:token") return Promise.reject(new Error("disk error"));
      return Promise.resolve(null);
    });

    const { result } = renderWithProvider();
    await flush();

    expect(jest.mocked(logger.error)).toHaveBeenCalledWith(
      "Auth",
      "Erro na verificação de auth",
      expect.any(Error)
    );
    expect(result.current.loading).toBe(false);
  });

  it("loga undefined quando a falha externa não é uma instância de Error", async () => {
    jest.mocked(AsyncStorage.getItem).mockImplementation((key: string) => {
      if (key === "@app:token") return Promise.reject("disk error");
      return Promise.resolve(null);
    });

    const { result } = renderWithProvider();
    await flush();

    expect(jest.mocked(logger.error)).toHaveBeenCalledWith(
      "Auth",
      "Erro na verificação de auth",
      undefined
    );
    expect(result.current.loading).toBe(false);
  });
});

// ─── loginWithGoogle ──────────────────────────────────────────────────────────

describe("loginWithGoogle", () => {
  it("salva token e usuário no storage, atualiza estado e retorna AuthResponse", async () => {
    mockStorageNoToken();
    jest.mocked(authService.googleLogin).mockResolvedValue(mockAuthResponse);

    const { result } = renderWithProvider();
    await flush();

    let response: AuthResponse | null = null;
    await act(async () => {
      response = await result.current.loginWithGoogle("google-token");
    });

    expect(jest.mocked(authService.googleLogin)).toHaveBeenCalledWith(
      "google-token"
    );
    expect(jest.mocked(AsyncStorage.setItem)).toHaveBeenCalledWith(
      "@app:token",
      mockAuthResponse.token
    );
    expect(jest.mocked(AsyncStorage.setItem)).toHaveBeenCalledWith(
      "@app:user",
      JSON.stringify(mockAuthResponse.user)
    );
    expect(result.current.user).toEqual(mockUser);
    expect(result.current.isAuthenticated).toBe(true);
    expect(response).toEqual(mockAuthResponse);
  });

  it("define error e retorna null quando o login falha", async () => {
    mockStorageNoToken();
    jest.mocked(authService.googleLogin).mockRejectedValue(new Error("fail"));
    jest.mocked(getErrorMessage).mockReturnValue("Erro de login");

    const { result } = renderWithProvider();
    await flush();

    let response: AuthResponse | null | undefined;
    await act(async () => {
      response = await result.current.loginWithGoogle("bad-token");
    });

    expect(response).toBeNull();
    expect(result.current.error).toBe("Erro de login");
    expect(result.current.user).toBeNull();
  });
});

// ─── logout ───────────────────────────────────────────────────────────────────

describe("logout", () => {
  it("cancela queries, limpa storage, chama signOut, define user/republicData/error null e redireciona", async () => {
    mockStorageNoToken();
    const { result } = renderWithProvider();
    await flush();

    await act(async () => {
      await result.current.logout();
    });

    expect(mockQueryClient.cancelQueries).toHaveBeenCalled();
    expect(jest.mocked(AsyncStorage.multiRemove)).toHaveBeenCalledWith([
      "@app:token",
      "@app:user",
      "republic-data",
    ]);
    expect(jest.mocked(GoogleSignin.signOut)).toHaveBeenCalled();
    expect(result.current.user).toBeNull();
    expect(result.current.error).toBeNull();
    expect(jest.mocked(router.replace)).toHaveBeenCalledWith("/(auth)/login");
  });

  it("loga erro quando o logout falha", async () => {
    mockStorageNoToken();
    const error = new Error("logout error");
    // Promise.allSettled não lança — precisamos fazer cancelQueries lançar para atingir o catch
    mockQueryClient.cancelQueries.mockRejectedValueOnce(error);

    const { result } = renderWithProvider();
    await flush();

    await act(async () => {
      await result.current.logout();
    });

    expect(jest.mocked(logger.error)).toHaveBeenCalledWith(
      "Auth",
      "Erro ao fazer logout",
      error
    );
  });

  it("loga undefined quando o logout falha com valor que não é Error", async () => {
    mockStorageNoToken();
    mockQueryClient.cancelQueries.mockRejectedValueOnce("logout error");

    const { result } = renderWithProvider();
    await flush();

    await act(async () => {
      await result.current.logout();
    });

    expect(jest.mocked(logger.error)).toHaveBeenCalledWith(
      "Auth",
      "Erro ao fazer logout",
      undefined
    );
  });
});

// ─── completeProfile ──────────────────────────────────────────────────────────

describe("completeProfile", () => {
  const profileData: CompleteProfileRequest = {
    nome: "Ana",
    telefone: "11999",
    chavePix: "ana@pix",
  };

  it("chama authService, busca usuário, atualiza estado e storage", async () => {
    mockStorageNoToken();
    jest.mocked(authService.completeProfile).mockResolvedValue(undefined);
    jest.mocked(userService.fetchUser).mockResolvedValue(mockUser);

    const { result } = renderWithProvider();
    await flush();

    await act(async () => {
      await result.current.completeProfile(profileData);
    });

    expect(jest.mocked(authService.completeProfile)).toHaveBeenCalledWith(
      profileData
    );
    expect(jest.mocked(userService.fetchUser)).toHaveBeenCalled();
    expect(result.current.user).toEqual(mockUser);
    expect(jest.mocked(AsyncStorage.setItem)).toHaveBeenCalledWith(
      "@app:user",
      JSON.stringify(mockUser)
    );
  });

  it("define error, exibe toast, relança o erro quando falha", async () => {
    mockStorageNoToken();
    const error = new Error("backend error");
    jest.mocked(authService.completeProfile).mockRejectedValue(error);
    jest.mocked(getErrorMessage).mockReturnValue("Erro ao completar perfil");

    const { result } = renderWithProvider();
    await flush();

    let threw = false;
    await act(async () => {
      try {
        await result.current.completeProfile(profileData);
      } catch {
        threw = true;
      }
    });

    expect(threw).toBe(true);
    expect(result.current.error).toBe("Erro ao completar perfil");
    expect(jest.mocked(showToast.error)).toHaveBeenCalledWith(
      "Erro ao completar perfil"
    );
  });
});

// ─── updateUser ───────────────────────────────────────────────────────────────

describe("updateUser", () => {
  it("chama userService.updateUser, atualiza estado e storage", async () => {
    mockStorageNoToken();
    const updated = { ...mockUser, nome: "Bruno" };
    jest.mocked(userService.updateUser).mockResolvedValue(updated);

    const { result } = renderWithProvider();
    await flush();

    await act(async () => {
      await result.current.updateUser({ nome: "Bruno" });
    });

    expect(jest.mocked(userService.updateUser)).toHaveBeenCalledWith({
      nome: "Bruno",
    });
    expect(result.current.user).toEqual(updated);
    expect(jest.mocked(AsyncStorage.setItem)).toHaveBeenCalledWith(
      "@app:user",
      JSON.stringify(updated)
    );
  });

  it("loga e relança o erro quando falha", async () => {
    mockStorageNoToken();
    const error = new Error("update failed");
    jest.mocked(userService.updateUser).mockRejectedValue(error);

    const { result } = renderWithProvider();
    await flush();

    await expect(
      act(async () => {
        await result.current.updateUser({ nome: "X" });
      })
    ).rejects.toBeDefined();

    expect(jest.mocked(logger.error)).toHaveBeenCalledWith(
      "Auth",
      "Erro ao atualizar usuário",
      error
    );
  });

  it("loga undefined e relança quando a falha não é uma instância de Error", async () => {
    mockStorageNoToken();
    jest.mocked(userService.updateUser).mockRejectedValue("update failed");

    const { result } = renderWithProvider();
    await flush();

    await expect(
      act(async () => {
        await result.current.updateUser({ nome: "X" });
      })
    ).rejects.toBeDefined();

    expect(jest.mocked(logger.error)).toHaveBeenCalledWith(
      "Auth",
      "Erro ao atualizar usuário",
      undefined
    );
  });
});

// ─── republic-data effect ─────────────────────────────────────────────────────

describe("efeito republic-data", () => {
  it("define republicData ao encontrar JSON válido no storage", async () => {
    const data = { id: "rep-1", nome: "Alpha" };
    jest.mocked(AsyncStorage.getItem).mockImplementation((key: string) => {
      if (key === "republic-data") return Promise.resolve(JSON.stringify(data));
      return Promise.resolve(null);
    });

    const { result } = renderWithProvider();
    await flush();

    expect(result.current.republicData).toEqual(data);
  });

  it("loga warn ao encontrar JSON inválido no republic-data", async () => {
    jest.mocked(AsyncStorage.getItem).mockImplementation((key: string) => {
      if (key === "republic-data") return Promise.resolve("invalid{json");
      return Promise.resolve(null);
    });

    renderWithProvider();
    await flush();

    expect(jest.mocked(logger.warn)).toHaveBeenCalledWith(
      "Auth",
      "Erro ao parsear republic-data",
      expect.objectContaining({ error: expect.any(String) })
    );
  });
});

// ─── isAuthenticated effect (queryClient.clear) ───────────────────────────────

describe("efeito isAuthenticated — queryClient.clear", () => {
  it("chama queryClient.clear ao transitar de autenticado para não-autenticado", async () => {
    mockStorageWithToken();
    jest.mocked(userService.fetchUser).mockResolvedValue(mockUser);

    const { result } = renderWithProvider();
    await flush();

    expect(result.current.isAuthenticated).toBe(true);

    mockQueryClient.clear.mockClear();

    await act(async () => {
      await result.current.logout();
    });

    expect(mockQueryClient.clear).toHaveBeenCalledTimes(1);
  });

  it("não chama queryClient.clear no estado inicial (user=null)", async () => {
    mockStorageNoToken();
    renderWithProvider();
    await flush();

    expect(mockQueryClient.clear).not.toHaveBeenCalled();
  });
});
