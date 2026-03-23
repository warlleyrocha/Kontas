import { AxiosError } from "axios";
import { api } from "@/src/services/api";
import { toUserFriendlyError } from "@/src/services/httpError";
import { logger } from "@/src/shared/utils/logger";
import {
  StatusInvite,
  type GetInvitesByUser,
  type Invite,
  type InviteRequest,
  type PatchInviteStatusResponse,
} from "../../types/invite.types";
import { inviteService } from "../invite.service";

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

jest.mock("@/src/shared/utils/logger", () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
  },
}));

const mockApi = jest.mocked(api);
const mockToUserFriendlyError = jest.mocked(toUserFriendlyError);
const mockLogger = jest.mocked(logger);

const mockInvite: Invite = {
  id: "inv-1",
  email: "ana@email.com",
  republicaId: "rep-1",
  status: StatusInvite.PENDENTE,
  criadoEm: "2026-01-01",
  atualizadoEm: "2026-01-01",
};

const mockInvitesByUser: GetInvitesByUser[] = [
  {
    id: "inv-2",
    email: "bruno@email.com",
    republicaId: "rep-2",
    status: StatusInvite.PENDENTE,
    criadoEm: "2026-01-01",
    atualizadoEm: "2026-01-01",
  },
];

function makeCancelledError(): AxiosError {
  const error = new AxiosError("canceled");
  error.code = "ERR_CANCELED";
  return error;
}

beforeEach(() => {
  jest.clearAllMocks();
  mockToUserFriendlyError.mockImplementation((err) => err as Error);
});

// ─── sendInvite ───────────────────────────────────────────────────────────────

describe("inviteService.sendInvite", () => {
  const payload: InviteRequest = { email: "ana@email.com", republicaId: "rep-1" };

  it("chama POST /convites e retorna response.data", async () => {
    mockApi.post.mockResolvedValue({ data: mockInvite });

    const result = await inviteService.sendInvite(payload);

    expect(mockApi.post).toHaveBeenCalledWith("/convites", payload);
    expect(result).toEqual(mockInvite);
  });

  it("chama toUserFriendlyError com as mensagens corretas ao falhar", async () => {
    const error = new Error("fail");
    mockApi.post.mockRejectedValue(error);

    await expect(inviteService.sendInvite(payload)).rejects.toBeDefined();

    expect(mockToUserFriendlyError).toHaveBeenCalledWith(error, {
      defaultMessage: "Erro ao enviar convite.",
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

    await expect(inviteService.sendInvite(payload)).rejects.toBe(friendly);
  });
});

// ─── getInvitesByRepublicId ───────────────────────────────────────────────────

describe("inviteService.getInvitesByRepublicId", () => {
  it("chama GET /convites/republica/:id e retorna a lista", async () => {
    mockApi.get.mockResolvedValue({ data: [mockInvite] });

    const result = await inviteService.getInvitesByRepublicId("rep-1");

    expect(mockApi.get).toHaveBeenCalledWith("/convites/republica/rep-1", {
      signal: undefined,
    });
    expect(result).toEqual([mockInvite]);
  });

  it("repassa o AbortSignal para a chamada à API", async () => {
    mockApi.get.mockResolvedValue({ data: [] });
    const signal = new AbortController().signal;

    await inviteService.getInvitesByRepublicId("rep-1", signal);

    expect(mockApi.get).toHaveBeenCalledWith("/convites/republica/rep-1", {
      signal,
    });
  });

  it("relança diretamente erros ERR_CANCELED sem chamar toUserFriendlyError", async () => {
    const cancelError = makeCancelledError();
    mockApi.get.mockRejectedValue(cancelError);

    await expect(
      inviteService.getInvitesByRepublicId("rep-1")
    ).rejects.toBe(cancelError);

    expect(mockToUserFriendlyError).not.toHaveBeenCalled();
  });

  it("chama toUserFriendlyError com as mensagens corretas em erros não-cancelados", async () => {
    const error = new Error("fail");
    mockApi.get.mockRejectedValue(error);

    await expect(inviteService.getInvitesByRepublicId("rep-1")).rejects.toBeDefined();

    expect(mockToUserFriendlyError).toHaveBeenCalledWith(error, {
      defaultMessage: "Erro ao obter convites.",
      statusMessages: {
        401: "Não autenticado.",
        404: "Nenhum convite encontrado para este usuário.",
        500: "Erro interno do servidor.",
      },
    });
  });

  it("propaga o erro retornado por toUserFriendlyError", async () => {
    const friendly = new Error("amigável");
    mockApi.get.mockRejectedValue(new Error("original"));
    mockToUserFriendlyError.mockReturnValue(friendly);

    await expect(inviteService.getInvitesByRepublicId("rep-1")).rejects.toBe(friendly);
  });
});

// ─── getInvitesByUser ─────────────────────────────────────────────────────────

describe("inviteService.getInvitesByUser", () => {
  it("loga info antes de buscar e retorna a lista", async () => {
    mockApi.get.mockResolvedValue({ data: mockInvitesByUser });

    const result = await inviteService.getInvitesByUser();

    expect(mockLogger.info).toHaveBeenCalledWith(
      "Invites",
      "Buscando convites do usuário"
    );
    expect(mockApi.get).toHaveBeenCalledWith("/convites/me", {
      signal: undefined,
    });
    expect(result).toEqual(mockInvitesByUser);
  });

  it("repassa o AbortSignal para a chamada à API", async () => {
    mockApi.get.mockResolvedValue({ data: [] });
    const signal = new AbortController().signal;

    await inviteService.getInvitesByUser(signal);

    expect(mockApi.get).toHaveBeenCalledWith("/convites/me", { signal });
  });

  it("relança diretamente erros ERR_CANCELED sem chamar toUserFriendlyError", async () => {
    const cancelError = makeCancelledError();
    mockApi.get.mockRejectedValue(cancelError);

    await expect(inviteService.getInvitesByUser()).rejects.toBe(cancelError);

    expect(mockToUserFriendlyError).not.toHaveBeenCalled();
    expect(mockLogger.error).not.toHaveBeenCalled();
  });

  it("loga o erro com instância de Error ao falhar", async () => {
    const error = new Error("network");
    mockApi.get.mockRejectedValue(error);

    await expect(inviteService.getInvitesByUser()).rejects.toBeDefined();

    expect(mockLogger.error).toHaveBeenCalledWith(
      "Invites",
      "Erro ao buscar convites do usuário",
      error
    );
  });

  it("loga undefined quando o erro não é instância de Error", async () => {
    mockApi.get.mockRejectedValue("string error");

    await expect(inviteService.getInvitesByUser()).rejects.toBeDefined();

    expect(mockLogger.error).toHaveBeenCalledWith(
      "Invites",
      "Erro ao buscar convites do usuário",
      undefined
    );
  });

  it("chama toUserFriendlyError com as mensagens corretas ao falhar", async () => {
    const error = new Error("fail");
    mockApi.get.mockRejectedValue(error);

    await expect(inviteService.getInvitesByUser()).rejects.toBeDefined();

    expect(mockToUserFriendlyError).toHaveBeenCalledWith(error, {
      defaultMessage: "Erro ao obter convites.",
      statusMessages: {
        401: "Não autenticado.",
        500: "Erro interno do servidor.",
      },
    });
  });

  it("propaga o erro retornado por toUserFriendlyError", async () => {
    const friendly = new Error("amigável");
    mockApi.get.mockRejectedValue(new Error("original"));
    mockToUserFriendlyError.mockReturnValue(friendly);

    await expect(inviteService.getInvitesByUser()).rejects.toBe(friendly);
  });
});

// ─── patchInviteStatus ────────────────────────────────────────────────────────

describe("inviteService.patchInviteStatus", () => {
  const patchResponse: PatchInviteStatusResponse = {
    id: "inv-1",
    status: StatusInvite.ACEITO,
  };

  it("chama PATCH /convites/:id com { status } e retorna response.data", async () => {
    mockApi.patch.mockResolvedValue({ data: patchResponse });

    const result = await inviteService.patchInviteStatus(
      "inv-1",
      StatusInvite.ACEITO
    );

    expect(mockApi.patch).toHaveBeenCalledWith("/convites/inv-1", {
      status: StatusInvite.ACEITO,
    });
    expect(result).toEqual(patchResponse);
  });

  it("chama toUserFriendlyError com as mensagens corretas ao falhar", async () => {
    const error = new Error("fail");
    mockApi.patch.mockRejectedValue(error);

    await expect(
      inviteService.patchInviteStatus("inv-1", StatusInvite.RECUSADO)
    ).rejects.toBeDefined();

    expect(mockToUserFriendlyError).toHaveBeenCalledWith(error, {
      defaultMessage: "Erro ao atualizar status do convite.",
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
      inviteService.patchInviteStatus("inv-1", StatusInvite.ACEITO)
    ).rejects.toBe(friendly);
  });
});
