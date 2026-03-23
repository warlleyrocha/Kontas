import { api } from "@/src/services/api";
import { toUserFriendlyError } from "@/src/services/httpError";
import { logger } from "@/src/shared/utils/logger";
import {
  MetodoPagamento,
  StatusConta,
  type Conta,
  type CriarContaRequest,
} from "../../types/account.types";
import { accountService } from "../account.service";

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
    debug: jest.fn(),
    info: jest.fn(),
    table: jest.fn(),
  },
}));

const mockApi = jest.mocked(api);
const mockToUserFriendlyError = jest.mocked(toUserFriendlyError);
const mockLogger = jest.mocked(logger);

const mockConta: Conta = {
  id: "c-1",
  descricao: "Conta de luz",
  valor: 150,
  vencimento: "2026-03-20",
  status: StatusConta.PENDENTE,
  republicaId: "rep-1",
  criadoPorId: "u-1",
  criadoPorNome: "Admin",
  metodoPagamento: null,
  pago: false,
  criadoEm: "2026-01-01",
  atualizadoEm: "2026-01-01",
};

const criarPayload: CriarContaRequest = {
  descricao: "Conta de luz",
  valor: 150,
  vencimento: "2026-03-20",
  republicaId: "rep-1",
  status: StatusConta.PENDENTE,
  metodoPagamento: MetodoPagamento.PIX,
};

beforeEach(() => {
  jest.clearAllMocks();
  mockToUserFriendlyError.mockImplementation((err) => err as Error);
});

// ─── criarConta ───────────────────────────────────────────────────────────────

describe("accountService.criarConta", () => {
  it("loga debug, chama POST /contas, loga info e retorna response.data", async () => {
    mockApi.post.mockResolvedValue({ data: mockConta });

    const result = await accountService.criarConta(criarPayload);

    expect(mockLogger.debug).toHaveBeenCalledWith(
      "Accounts",
      "Payload de criação de conta",
      criarPayload
    );
    expect(mockApi.post).toHaveBeenCalledWith("/contas", criarPayload);
    expect(mockLogger.info).toHaveBeenCalledWith(
      "Accounts",
      "Conta criada com sucesso",
      mockConta
    );
    expect(result).toEqual(mockConta);
  });

  it("chama toUserFriendlyError com as mensagens corretas ao falhar", async () => {
    const error = new Error("fail");
    mockApi.post.mockRejectedValue(error);

    await expect(accountService.criarConta(criarPayload)).rejects.toBeDefined();

    expect(mockToUserFriendlyError).toHaveBeenCalledWith(error, {
      defaultMessage: "Erro ao criar conta.",
      statusMessages: {
        400: "Descrição não pode ser vazia.",
        401: "Não autenticado.",
        403: "Apenas ADMIN pode criar contas.",
        500: "Erro interno do servidor.",
      },
    });
  });

  it("propaga o erro retornado por toUserFriendlyError", async () => {
    const friendly = new Error("amigável");
    mockApi.post.mockRejectedValue(new Error("original"));
    mockToUserFriendlyError.mockReturnValue(friendly);

    await expect(accountService.criarConta(criarPayload)).rejects.toBe(
      friendly
    );
  });
});

// ─── listarContasPorRepublica ─────────────────────────────────────────────────

describe("accountService.listarContasPorRepublica", () => {
  it("chama GET /contas/republica/:id, loga table e retorna response.data", async () => {
    mockApi.get.mockResolvedValue({ data: [mockConta] });

    const result = await accountService.listarContasPorRepublica("rep-1");

    expect(mockApi.get).toHaveBeenCalledWith("/contas/republica/rep-1");
    expect(mockLogger.table).toHaveBeenCalledWith(
      "Accounts",
      "Contas da república rep-1",
      [mockConta]
    );
    expect(result).toEqual([mockConta]);
  });

  it("chama toUserFriendlyError com as mensagens corretas ao falhar", async () => {
    const error = new Error("fail");
    mockApi.get.mockRejectedValue(error);

    await expect(
      accountService.listarContasPorRepublica("rep-1")
    ).rejects.toBeDefined();

    expect(mockToUserFriendlyError).toHaveBeenCalledWith(error, {
      defaultMessage: "Erro ao obter contas.",
      statusMessages: {
        401: "Não autenticado.",
        404: "Nenhuma conta encontrada para esta república.",
        500: "Erro interno do servidor.",
      },
    });
  });

  it("propaga o erro retornado por toUserFriendlyError", async () => {
    const friendly = new Error("amigável");
    mockApi.get.mockRejectedValue(new Error("original"));
    mockToUserFriendlyError.mockReturnValue(friendly);

    await expect(accountService.listarContasPorRepublica("rep-1")).rejects.toBe(
      friendly
    );
  });
});

// ─── removerConta ─────────────────────────────────────────────────────────────

describe("accountService.removerConta", () => {
  it("chama DELETE /contas/:id, loga info e resolve sem valor", async () => {
    mockApi.delete.mockResolvedValue({});

    await expect(
      accountService.removerConta({ id: "c-1" })
    ).resolves.toBeUndefined();

    expect(mockApi.delete).toHaveBeenCalledWith("/contas/c-1");
    expect(mockLogger.info).toHaveBeenCalledWith(
      "Accounts",
      "Conta c-1 removida com sucesso"
    );
  });

  it("chama toUserFriendlyError com as mensagens corretas ao falhar", async () => {
    const error = new Error("fail");
    mockApi.delete.mockRejectedValue(error);

    await expect(
      accountService.removerConta({ id: "c-1" })
    ).rejects.toBeDefined();

    expect(mockToUserFriendlyError).toHaveBeenCalledWith(error, {
      defaultMessage: "Erro ao remover conta.",
      statusMessages: {
        401: "Não autenticado.",
        404: "Conta não encontrada.",
        500: "Erro interno do servidor.",
      },
    });
  });

  it("propaga o erro retornado por toUserFriendlyError", async () => {
    const friendly = new Error("amigável");
    mockApi.delete.mockRejectedValue(new Error("original"));
    mockToUserFriendlyError.mockReturnValue(friendly);

    await expect(accountService.removerConta({ id: "c-1" })).rejects.toBe(
      friendly
    );
  });
});

// ─── restaurarConta ───────────────────────────────────────────────────────────

describe("accountService.restaurarConta", () => {
  it("chama PATCH /contas/:id/restaurar, loga info e resolve sem valor", async () => {
    mockApi.patch.mockResolvedValue({});

    await expect(accountService.restaurarConta("c-1")).resolves.toBeUndefined();

    expect(mockApi.patch).toHaveBeenCalledWith("/contas/c-1/restaurar");
    expect(mockLogger.info).toHaveBeenCalledWith(
      "Accounts",
      "Conta c-1 restaurada com sucesso"
    );
  });

  it("chama toUserFriendlyError com as mensagens corretas ao falhar", async () => {
    const error = new Error("fail");
    mockApi.patch.mockRejectedValue(error);

    await expect(accountService.restaurarConta("c-1")).rejects.toBeDefined();

    expect(mockToUserFriendlyError).toHaveBeenCalledWith(error, {
      defaultMessage: "Erro ao recuperar conta.",
      statusMessages: {
        401: "Não autenticado.",
        403: "Apenas ADMIN pode restaurar conta.",
        404: "Conta não encontrada.",
        500: "Erro interno do servidor.",
      },
    });
  });

  it("propaga o erro retornado por toUserFriendlyError", async () => {
    const friendly = new Error("amigável");
    mockApi.patch.mockRejectedValue(new Error("original"));
    mockToUserFriendlyError.mockReturnValue(friendly);

    await expect(accountService.restaurarConta("c-1")).rejects.toBe(friendly);
  });
});

// ─── pagarConta ───────────────────────────────────────────────────────────────

describe("accountService.pagarConta", () => {
  it("chama PATCH /contas/:id com { status: PAGA, metodoPagamento }, loga info e resolve sem valor", async () => {
    mockApi.patch.mockResolvedValue({});

    await expect(
      accountService.pagarConta({
        id: "c-1",
        metodoPagamento: MetodoPagamento.PIX,
      })
    ).resolves.toBeUndefined();

    expect(mockApi.patch).toHaveBeenCalledWith("/contas/c-1", {
      status: StatusConta.PAGA,
      metodoPagamento: MetodoPagamento.PIX,
    });
    expect(mockLogger.info).toHaveBeenCalledWith(
      "Accounts",
      "Conta c-1 marcada como paga"
    );
  });

  it("chama toUserFriendlyError com as mensagens corretas ao falhar", async () => {
    const error = new Error("fail");
    mockApi.patch.mockRejectedValue(error);

    await expect(
      accountService.pagarConta({
        id: "c-1",
        metodoPagamento: MetodoPagamento.DINHEIRO,
      })
    ).rejects.toBeDefined();

    expect(mockToUserFriendlyError).toHaveBeenCalledWith(error, {
      defaultMessage: "Erro ao marcar conta como paga",
      statusMessages: {
        400: "Dados inválidos.",
        401: "Não Autenticado.",
        403: "Apenas ADMIN pode alterar a conta",
        404: "Conta não encontrada",
        500: "Erro interno do servidor",
      },
    });
  });

  it("propaga o erro retornado por toUserFriendlyError", async () => {
    const friendly = new Error("amigável");
    mockApi.patch.mockRejectedValue(new Error("original"));
    mockToUserFriendlyError.mockReturnValue(friendly);

    await expect(
      accountService.pagarConta({
        id: "c-1",
        metodoPagamento: MetodoPagamento.CARTAO,
      })
    ).rejects.toBe(friendly);
  });
});
