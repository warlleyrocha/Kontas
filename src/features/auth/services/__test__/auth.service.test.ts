import { toUserFriendlyError } from "@/src/services/httpError";
import { api } from "@/src/services/api";
import { logger } from "@/src/shared/utils/logger";
import type { AuthResponse } from "../../types/auth.types";
import { authService } from "../auth.service";
import { CompleteProfileRequest } from "@/src/features/user/types/user.types";

jest.mock("@/src/services/api", () => ({
  api: {
    post: jest.fn(),
  },
}));

jest.mock("@/src/services/httpError", () => ({
  toUserFriendlyError: jest.fn(),
}));

jest.mock("@/src/shared/utils/logger", () => ({
  logger: {
    debug: jest.fn(),
    info: jest.fn(),
    error: jest.fn(),
  },
}));

const mockApi = jest.mocked(api);
const mockToUserFriendlyError = jest.mocked(toUserFriendlyError);
const mockLogger = jest.mocked(logger);

const mockAuthResponse: AuthResponse = {
  token: "jwt-token",
  user: {
    id: "u-1",
    email: "ana@email.com",
    perfilCompleto: true,
  },
};

beforeEach(() => {
  jest.clearAllMocks();
  mockToUserFriendlyError.mockImplementation((err) => err as Error);
});

// ─── googleLogin ──────────────────────────────────────────────────────────────

describe("authService.googleLogin", () => {
  it("retorna AuthResponse em caso de sucesso", async () => {
    mockApi.post.mockResolvedValue({ data: mockAuthResponse });

    const result = await authService.googleLogin("google-token-abc");

    expect(mockApi.post).toHaveBeenCalledWith("/auth/google", {
      token: "google-token-abc",
    });
    expect(result).toEqual(mockAuthResponse);
  });

  it("chama toUserFriendlyError com as mensagens corretas ao falhar", async () => {
    const error = new Error("network error");
    const friendly = new Error("Erro ao fazer login com Google.");
    mockApi.post.mockRejectedValue(error);
    mockToUserFriendlyError.mockReturnValue(friendly);

    await expect(authService.googleLogin("token")).rejects.toThrow(friendly);

    expect(mockToUserFriendlyError).toHaveBeenCalledWith(error, {
      defaultMessage: "Erro ao fazer login com Google.",
      statusMessages: {
        400: "Token inválido ou requisição malformada.",
        401: "Não foi possível autenticar com o Google.",
        500: "Erro no servidor. Tente novamente mais tarde.",
      },
    });
  });

  it("propaga o erro retornado por toUserFriendlyError", async () => {
    const friendly = new Error("amigável");
    mockApi.post.mockRejectedValue(new Error("original"));
    mockToUserFriendlyError.mockReturnValue(friendly);

    await expect(authService.googleLogin("token")).rejects.toBe(friendly);
  });
});

// ─── completeProfile ──────────────────────────────────────────────────────────

describe("authService.completeProfile", () => {
  const payload: CompleteProfileRequest = {
    nome: "Ana",
    telefone: "11999999999",
    chavePix: "ana@pix.com",
  };

  it("chama a API com o payload correto e não lança em caso de sucesso", async () => {
    mockApi.post.mockResolvedValue({});

    await expect(authService.completeProfile(payload)).resolves.toBeUndefined();

    expect(mockApi.post).toHaveBeenCalledWith("/auth/completar-dados", payload);
  });

  it("loga o payload antes de chamar a API", async () => {
    mockApi.post.mockResolvedValue({});

    await authService.completeProfile(payload);

    expect(mockLogger.debug).toHaveBeenCalledWith(
      "Auth",
      "Payload de completar perfil",
      payload,
    );
  });

  it("loga sucesso após a chamada à API", async () => {
    mockApi.post.mockResolvedValue({});

    await authService.completeProfile(payload);

    expect(mockLogger.info).toHaveBeenCalledWith(
      "Auth",
      "Perfil completado com sucesso no backend",
    );
  });

  it("loga o erro quando a falha é uma instância de Error", async () => {
    const error = new Error("falha no servidor");
    mockApi.post.mockRejectedValue(error);

    await expect(authService.completeProfile(payload)).rejects.toBeDefined();

    expect(mockLogger.error).toHaveBeenCalledWith(
      "Auth",
      "Erro ao completar perfil",
      error,
    );
  });

  it("loga undefined quando a falha não é uma instância de Error", async () => {
    mockApi.post.mockRejectedValue("string error");

    await expect(authService.completeProfile(payload)).rejects.toBeDefined();

    expect(mockLogger.error).toHaveBeenCalledWith(
      "Auth",
      "Erro ao completar perfil",
      undefined,
    );
  });

  it("chama toUserFriendlyError com as mensagens corretas ao falhar", async () => {
    const error = new Error("falha");
    const friendly = new Error("Erro ao completar perfil.");
    mockApi.post.mockRejectedValue(error);
    mockToUserFriendlyError.mockReturnValue(friendly);

    await expect(authService.completeProfile(payload)).rejects.toThrow(
      friendly,
    );

    expect(mockToUserFriendlyError).toHaveBeenCalledWith(error, {
      defaultMessage: "Erro ao completar perfil.",
      statusMessages: {
        400: "Dados inválidos. Verifique os campos e tente novamente.",
        401: "Sessão expirada. Faça login novamente.",
        500: "Erro no servidor. Tente novamente mais tarde.",
      },
    });
  });

  it("propaga o erro retornado por toUserFriendlyError", async () => {
    const friendly = new Error("amigável");
    mockApi.post.mockRejectedValue(new Error("original"));
    mockToUserFriendlyError.mockReturnValue(friendly);

    await expect(authService.completeProfile(payload)).rejects.toBe(friendly);
  });
});
