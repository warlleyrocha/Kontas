import { api } from "@/src/services/api";
import { toUserFriendlyError } from "@/src/services/httpError";
import { logger } from "@/src/shared/utils/logger";
import type {
  RepublicPost,
  RepublicResponse,
} from "../../types/republic.types";
import { republicService } from "../republic.service";

jest.mock("@/src/services/api", () => ({
  api: {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  },
}));

jest.mock("@/src/services/httpError", () => ({
  toUserFriendlyError: jest.fn(),
}));

jest.mock("@/src/shared/utils/logger", () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
  },
}));

const mockApi = jest.mocked(api);
const mockToUserFriendlyError = jest.mocked(toUserFriendlyError);
const mockLogger = jest.mocked(logger);

const mockRepublic: RepublicResponse = { id: "rep-1", nome: "Alpha" };
const payload: RepublicPost = { nome: "Alpha" };

beforeEach(() => {
  jest.clearAllMocks();
  mockToUserFriendlyError.mockImplementation((err) => err as Error);
});

// ─── createRepublic ───────────────────────────────────────────────────────────

describe("republicService.createRepublic", () => {
  it("chama POST /republicas e retorna response.data", async () => {
    mockApi.post.mockResolvedValue({ data: mockRepublic });

    const result = await republicService.createRepublic(payload);

    expect(mockApi.post).toHaveBeenCalledWith("/republicas", payload);
    expect(result).toEqual(mockRepublic);
  });

  it("chama toUserFriendlyError com as mensagens corretas ao falhar", async () => {
    const error = new Error("fail");
    mockApi.post.mockRejectedValue(error);

    await expect(republicService.createRepublic(payload)).rejects.toBeDefined();

    expect(mockToUserFriendlyError).toHaveBeenCalledWith(error, {
      defaultMessage: "Erro ao criar república.",
      statusMessages: {
        400: "Requisição inválida.",
        401: "Não autenticado.",
        500: "Erro interno do servidor.",
      },
    });
  });

  it("propaga o erro retornado por toUserFriendlyError", async () => {
    const friendly = new Error("amigável");
    mockApi.post.mockRejectedValue(new Error("original"));
    mockToUserFriendlyError.mockReturnValue(friendly);

    await expect(republicService.createRepublic(payload)).rejects.toBe(
      friendly
    );
  });
});

// ─── getRepublics ─────────────────────────────────────────────────────────────

describe("republicService.getRepublics", () => {
  it("loga info antes de buscar e retorna a lista", async () => {
    mockApi.get.mockResolvedValue({ data: [mockRepublic] });

    const result = await republicService.getRepublics();

    expect(mockLogger.info).toHaveBeenCalledWith(
      "Republic",
      "Buscando lista de repúblicas"
    );
    expect(mockApi.get).toHaveBeenCalledWith("/republicas");
    expect(result).toEqual([mockRepublic]);
  });

  it("loga o erro com instância de Error ao falhar", async () => {
    const error = new Error("network");
    mockApi.get.mockRejectedValue(error);

    await expect(republicService.getRepublics()).rejects.toBeDefined();

    expect(mockLogger.error).toHaveBeenCalledWith(
      "Republic",
      "Erro ao buscar repúblicas",
      error
    );
  });

  it("loga undefined quando o erro não é instância de Error", async () => {
    mockApi.get.mockRejectedValue("string error");

    await expect(republicService.getRepublics()).rejects.toBeDefined();

    expect(mockLogger.error).toHaveBeenCalledWith(
      "Republic",
      "Erro ao buscar repúblicas",
      undefined
    );
  });

  it("chama toUserFriendlyError com as mensagens corretas ao falhar", async () => {
    const error = new Error("fail");
    mockApi.get.mockRejectedValue(error);

    await expect(republicService.getRepublics()).rejects.toBeDefined();

    expect(mockToUserFriendlyError).toHaveBeenCalledWith(error, {
      defaultMessage: "Erro ao obter repúblicas.",
      statusMessages: {
        401: "Não autenticado.",
        500: "Erro interno do servidor.",
      },
    });
  });
});

// ─── getRepublicById ──────────────────────────────────────────────────────────

describe("republicService.getRepublicById", () => {
  it("chama GET /republicas/:id e retorna response.data", async () => {
    mockApi.get.mockResolvedValue({ data: mockRepublic });

    const result = await republicService.getRepublicById("rep-1");

    expect(mockApi.get).toHaveBeenCalledWith("/republicas/rep-1");
    expect(result).toEqual(mockRepublic);
  });

  it("chama toUserFriendlyError com as mensagens corretas ao falhar", async () => {
    const error = new Error("fail");
    mockApi.get.mockRejectedValue(error);

    await expect(
      republicService.getRepublicById("rep-1")
    ).rejects.toBeDefined();

    expect(mockToUserFriendlyError).toHaveBeenCalledWith(error, {
      defaultMessage: "Erro ao obter detalhes da república.",
      statusMessages: {
        400: "Requisição inválida.",
        401: "Não autenticado.",
        500: "Erro interno do servidor.",
      },
    });
  });

  it("propaga o erro retornado por toUserFriendlyError", async () => {
    const friendly = new Error("amigável");
    mockApi.get.mockRejectedValue(new Error("original"));
    mockToUserFriendlyError.mockReturnValue(friendly);

    await expect(republicService.getRepublicById("rep-1")).rejects.toBe(
      friendly
    );
  });
});

// ─── updateRepublic ───────────────────────────────────────────────────────────

describe("republicService.updateRepublic", () => {
  it("chama PATCH /republicas/:id e retorna response.data", async () => {
    const updated: RepublicResponse = { id: "rep-1", nome: "Nova" };
    mockApi.patch.mockResolvedValue({ data: updated });

    const result = await republicService.updateRepublic("rep-1", {
      nome: "Nova",
    });

    expect(mockApi.patch).toHaveBeenCalledWith("/republicas/rep-1", {
      nome: "Nova",
    });
    expect(result).toEqual(updated);
  });

  it("chama toUserFriendlyError com as mensagens corretas ao falhar", async () => {
    const error = new Error("fail");
    mockApi.patch.mockRejectedValue(error);

    await expect(
      republicService.updateRepublic("rep-1", { nome: "Nova" })
    ).rejects.toBeDefined();

    expect(mockToUserFriendlyError).toHaveBeenCalledWith(error, {
      defaultMessage: "Erro ao atualizar república.",
      statusMessages: {
        400: "Requisição inválida.",
        401: "Não autenticado.",
        500: "Erro interno do servidor.",
      },
    });
  });

  it("propaga o erro retornado por toUserFriendlyError", async () => {
    const friendly = new Error("amigável");
    mockApi.patch.mockRejectedValue(new Error("original"));
    mockToUserFriendlyError.mockReturnValue(friendly);

    await expect(
      republicService.updateRepublic("rep-1", { nome: "Nova" })
    ).rejects.toBe(friendly);
  });
});

// ─── deleteRepublic ───────────────────────────────────────────────────────────

describe("republicService.deleteRepublic", () => {
  it("chama DELETE /republicas/:id e resolve sem valor", async () => {
    mockApi.delete.mockResolvedValue({});

    await expect(
      republicService.deleteRepublic("rep-1")
    ).resolves.toBeUndefined();

    expect(mockApi.delete).toHaveBeenCalledWith("/republicas/rep-1");
  });

  it("chama toUserFriendlyError com as mensagens corretas ao falhar", async () => {
    const error = new Error("fail");
    mockApi.delete.mockRejectedValue(error);

    await expect(republicService.deleteRepublic("rep-1")).rejects.toBeDefined();

    expect(mockToUserFriendlyError).toHaveBeenCalledWith(error, {
      defaultMessage: "Erro ao deletar república.",
      statusMessages: {
        400: "Requisição inválida.",
        401: "Não autenticado.",
        500: "Erro interno do servidor.",
      },
    });
  });

  it("propaga o erro retornado por toUserFriendlyError", async () => {
    const friendly = new Error("amigável");
    mockApi.delete.mockRejectedValue(new Error("original"));
    mockToUserFriendlyError.mockReturnValue(friendly);

    await expect(republicService.deleteRepublic("rep-1")).rejects.toBe(
      friendly
    );
  });
});

// ─── uploadRepublicImage ──────────────────────────────────────────────────────

describe("republicService.uploadRepublicImage", () => {
  const uri = "file:///data/user/0/photo.jpg";

  it("chama PATCH /republicas/:id/imagem com FormData e retorna response.data", async () => {
    const updated: RepublicResponse = {
      id: "rep-1",
      nome: "Alpha",
      imagemRepublica: "https://example.com/nova-imagem.jpg",
    };
    mockApi.patch.mockResolvedValue({ data: updated });

    const result = await republicService.uploadRepublicImage("rep-1", uri);

    expect(mockApi.patch).toHaveBeenCalledWith(
      "/republicas/rep-1/imagem",
      expect.any(FormData),
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    expect(result).toEqual(updated);
  });

  it("chama toUserFriendlyError com as mensagens corretas ao falhar", async () => {
    const error = new Error("fail");
    mockApi.patch.mockRejectedValue(error);

    await expect(
      republicService.uploadRepublicImage("rep-1", uri)
    ).rejects.toBeDefined();

    expect(mockToUserFriendlyError).toHaveBeenCalledWith(error, {
      defaultMessage: "Erro ao fazer upload da imagem.",
      statusMessages: {
        400: "Imagem inválida. Escolha outra foto.",
        401: "Sessão expirada. Faça login novamente.",
        500: "Erro no servidor. Tente novamente mais tarde.",
      },
    });
  });

  it("propaga o erro retornado por toUserFriendlyError", async () => {
    const friendly = new Error("amigável");
    mockApi.patch.mockRejectedValue(new Error("original"));
    mockToUserFriendlyError.mockReturnValue(friendly);

    await expect(
      republicService.uploadRepublicImage("rep-1", uri)
    ).rejects.toBe(friendly);
  });

  it("loga erro com logger.error ao falhar", async () => {
    const error = new Error("network");
    mockApi.patch.mockRejectedValue(error);

    await expect(
      republicService.uploadRepublicImage("rep-1", uri)
    ).rejects.toBeDefined();

    expect(mockLogger.error).toHaveBeenCalledWith(
      "Republic",
      "Erro ao fazer upload da imagem",
      error
    );
  });
});
