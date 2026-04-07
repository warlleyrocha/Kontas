import { toUserFriendlyError } from "@/src/services/httpError";
import { api } from "@/src/services/api";
import type {
  CompleteProfileRequest,
  UpdateUserRequest,
  User,
} from "../../types/user.types";
import { userService } from "../user.service";

jest.mock("@/src/services/api", () => ({
  api: {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
  },
}));

jest.mock("@/src/services/httpError", () => ({
  toUserFriendlyError: jest.fn(),
}));

const mockApi = jest.mocked(api);
const mockToUserFriendlyError = jest.mocked(toUserFriendlyError);

const mockUser: User = {
  id: "u-1",
  nome: "Ana",
  email: "ana@email.com",
  fotoPerfil: null,
  perfilCompleto: true,
};

const serializeError = (error: Error) =>
  JSON.stringify(error, Object.getOwnPropertyNames(error), 2);

beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(console, "error").mockImplementation(() => {});
  mockToUserFriendlyError.mockImplementation((err) => err as Error);
});

afterEach(() => {
  jest.restoreAllMocks();
});

// ─── fetchUser ────────────────────────────────────────────────────────────────

describe("userService.fetchUser", () => {
  it("retorna os dados do usuário em caso de sucesso", async () => {
    mockApi.get.mockResolvedValue({ data: mockUser });

    const result = await userService.fetchUser();

    expect(mockApi.get).toHaveBeenCalledWith("/usuarios/me");
    expect(result).toEqual(mockUser);
  });

  it("chama toUserFriendlyError com as mensagens corretas ao falhar", async () => {
    const error = new Error("network error");
    mockApi.get.mockRejectedValue(error);
    const friendly = new Error("Erro ao buscar dados do usuário.");
    mockToUserFriendlyError.mockReturnValue(friendly);

    await expect(userService.fetchUser()).rejects.toThrow(friendly);

    expect(mockToUserFriendlyError).toHaveBeenCalledWith(error, {
      defaultMessage: "Erro ao buscar dados do usuário.",
      statusMessages: {
        401: "Não Autenticado.",
        500: "Erro interno do servidor.",
      },
    });
  });

  it("propaga o erro retornado por toUserFriendlyError", async () => {
    const originalError = new Error("original");
    const friendlyError = new Error("amigável");
    mockApi.get.mockRejectedValue(originalError);
    mockToUserFriendlyError.mockReturnValue(friendlyError);

    await expect(userService.fetchUser()).rejects.toBe(friendlyError);
  });
});

// ─── updateUser ───────────────────────────────────────────────────────────────

describe("userService.updateUser", () => {
  const payload: UpdateUserRequest = { nome: "Bruno", telefone: "11999999999" };

  it("retorna os dados atualizados em caso de sucesso", async () => {
    const updated: User = { ...mockUser, nome: "Bruno" };
    mockApi.patch.mockResolvedValue({ data: updated });

    const result = await userService.updateUser(payload);

    expect(mockApi.patch).toHaveBeenCalledWith(
      "/usuarios/atualizar-perfil",
      payload
    );
    expect(result).toEqual(updated);
  });

  it("loga o erro no console ao falhar", async () => {
    const error = new Error("patch failed");
    mockApi.patch.mockRejectedValue(error);

    await expect(userService.updateUser(payload)).rejects.toBeDefined();

    expect(console.error).toHaveBeenCalledWith(
      "[ERROR][User]",
      "Erro ao atualizar perfil",
      serializeError(error)
    );
  });

  it("chama toUserFriendlyError com as mensagens corretas ao falhar", async () => {
    const error = new Error("patch failed");
    mockApi.patch.mockRejectedValue(error);
    const friendly = new Error("Erro ao atualizar perfil.");
    mockToUserFriendlyError.mockReturnValue(friendly);

    await expect(userService.updateUser(payload)).rejects.toThrow(friendly);

    expect(mockToUserFriendlyError).toHaveBeenCalledWith(error, {
      defaultMessage: "Erro ao atualizar perfil.",
      statusMessages: {
        400: "Dados inválidos. Verifique os campos e tente novamente.",
        401: "Sessão expirada. Faça login novamente.",
        500: "Erro no servidor. Tente novamente mais tarde.",
      },
    });
  });

  it("propaga o erro retornado por toUserFriendlyError", async () => {
    const originalError = new Error("original");
    const friendlyError = new Error("amigável");
    mockApi.patch.mockRejectedValue(originalError);
    mockToUserFriendlyError.mockReturnValue(friendlyError);

    await expect(userService.updateUser(payload)).rejects.toBe(friendlyError);
  });
});

// ─── completeProfile ──────────────────────────────────────────────────────────

describe("userService.completeProfile", () => {
  const payload: CompleteProfileRequest = {
    nome: "Ana",
    telefone: "11999999999",
    chavePix: "ana@pix.com",
  };

  it("chama a API com o payload correto e não lança em caso de sucesso", async () => {
    mockApi.post.mockResolvedValue({});

    await expect(userService.completeProfile(payload)).resolves.toBeUndefined();

    expect(mockApi.post).toHaveBeenCalledWith("/auth/completar-dados", payload);
  });

  it("chama toUserFriendlyError com as mensagens corretas ao falhar", async () => {
    const error = new Error("falha");
    const friendly = new Error("Erro ao completar perfil.");
    mockApi.post.mockRejectedValue(error);
    mockToUserFriendlyError.mockReturnValue(friendly);

    await expect(userService.completeProfile(payload)).rejects.toThrow(
      friendly
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
    const originalError = new Error("original");
    const friendlyError = new Error("amigável");
    mockApi.post.mockRejectedValue(originalError);
    mockToUserFriendlyError.mockReturnValue(friendlyError);

    await expect(userService.completeProfile(payload)).rejects.toBe(
      friendlyError
    );
  });
});
