import { api } from "@/src/services/api";
import { toUserFriendlyError } from "@/src/services/httpError";
import {
  ResidentRole,
  type CreateResidentRequest,
  type ResidentResponse,
} from "@/src/shared/types/resident.types";
import { residentService } from "../resident.service";

jest.mock("@/src/services/api", () => ({
  api: {
    get: jest.fn(),
    post: jest.fn(),
  },
}));

jest.mock("@/src/services/httpError", () => ({
  toUserFriendlyError: jest.fn(),
}));

const mockApi = jest.mocked(api);
const mockToUserFriendlyError = jest.mocked(toUserFriendlyError);

const mockResident: ResidentResponse = {
  id: "r-1",
  nome: "Ana",
  email: "ana@email.com",
  fotoPerfil: null,
  chavePix: null,
  telefone: null,
  role: ResidentRole.USER,
};

const createPayload: CreateResidentRequest = {
  usuarioId: "u-1",
  republicaId: "rep-1",
  role: ResidentRole.USER,
};

beforeEach(() => {
  jest.clearAllMocks();
  mockToUserFriendlyError.mockImplementation((err) => err as Error);
});

// ─── createResident ───────────────────────────────────────────────────────────

describe("residentService.createResident", () => {
  it("chama POST /moradores e retorna response.data", async () => {
    mockApi.post.mockResolvedValue({ data: mockResident });

    const result = await residentService.createResident(createPayload);

    expect(mockApi.post).toHaveBeenCalledWith("/moradores", createPayload);
    expect(result).toEqual(mockResident);
  });

  it("chama toUserFriendlyError com as mensagens corretas ao falhar", async () => {
    const error = new Error("fail");
    mockApi.post.mockRejectedValue(error);

    await expect(
      residentService.createResident(createPayload)
    ).rejects.toBeDefined();

    expect(mockToUserFriendlyError).toHaveBeenCalledWith(error, {
      defaultMessage: "Erro ao criar morador.",
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

    await expect(residentService.createResident(createPayload)).rejects.toBe(
      friendly
    );
  });
});

// ─── getResidents ─────────────────────────────────────────────────────────────

describe("residentService.getResidents", () => {
  it("chama GET /moradores/republica/:id e retorna a lista", async () => {
    mockApi.get.mockResolvedValue({ data: [mockResident] });

    const result = await residentService.getResidents("rep-1");

    expect(mockApi.get).toHaveBeenCalledWith("/moradores/republica/rep-1");
    expect(result).toEqual([mockResident]);
  });

  it("chama toUserFriendlyError com as mensagens corretas ao falhar", async () => {
    const error = new Error("fail");
    mockApi.get.mockRejectedValue(error);

    await expect(residentService.getResidents("rep-1")).rejects.toBeDefined();

    expect(mockToUserFriendlyError).toHaveBeenCalledWith(error, {
      defaultMessage: "Erro ao obter moradores.",
      statusMessages: {
        400: "ID da república inválido.",
        401: "Não autenticado.",
        404: "República não encontrada.",
        500: "Erro interno do servidor.",
      },
    });
  });

  it("propaga o erro retornado por toUserFriendlyError", async () => {
    const friendly = new Error("amigável");
    mockApi.get.mockRejectedValue(new Error("original"));
    mockToUserFriendlyError.mockReturnValue(friendly);

    await expect(residentService.getResidents("rep-1")).rejects.toBe(friendly);
  });
});
