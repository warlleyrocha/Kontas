import { api } from "@/src/services/api";
import { toUserFriendlyError } from "@/src/services/httpError";
import type { AuthResponse } from "../../types/auth.types";
import { authService } from "../auth.service";

jest.mock("@/src/services/api", () => ({
  api: {
    post: jest.fn(),
  },
}));

jest.mock("@/src/services/httpError", () => ({
  toUserFriendlyError: jest.fn(),
}));

const mockApi = jest.mocked(api);
const mockToUserFriendlyError = jest.mocked(toUserFriendlyError);

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
