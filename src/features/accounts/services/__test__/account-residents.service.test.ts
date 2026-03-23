import { api } from "@/src/services/api";
import { toUserFriendlyError } from "@/src/services/httpError";
import { logger } from "@/src/shared/utils/logger";
import {
  StatusPagamento,
  type ContaMorador,
} from "../../types/accountResidents.types";
import { accountResidentsService } from "../account-residents.service";

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
    table: jest.fn(),
  },
}));

const mockApi = jest.mocked(api);
const mockToUserFriendlyError = jest.mocked(toUserFriendlyError);
const mockLogger = jest.mocked(logger);

const mockContaMorador: ContaMorador = {
  id: "cm-1",
  contaId: "c-1",
  moradorId: "r-1",
  moradorNome: "Ana",
  status: StatusPagamento.PENDENTE,
  valor: 100,
  visivel: true,
  pagoEm: null,
  metodoPagamento: null,
  criadoEm: "2026-01-01",
  atualizadoEm: "2026-01-01",
};

beforeEach(() => {
  jest.clearAllMocks();
  mockToUserFriendlyError.mockImplementation((err) => err as Error);
});

// ─── vincularMoradores ────────────────────────────────────────────────────────

describe("accountResidentsService.vincularMoradores", () => {
  const payload = { contaId: "c-1", moradorIds: ["r-1", "r-2"], valorTotal: 200 };

  it("chama POST /contas-moradores e retorna response.data", async () => {
    mockApi.post.mockResolvedValue({ data: [mockContaMorador] });

    const result = await accountResidentsService.vincularMoradores(payload);

    expect(mockApi.post).toHaveBeenCalledWith("/contas-moradores", payload);
    expect(result).toEqual([mockContaMorador]);
  });

  it("chama toUserFriendlyError com as mensagens corretas ao falhar", async () => {
    const error = new Error("fail");
    mockApi.post.mockRejectedValue(error);

    await expect(
      accountResidentsService.vincularMoradores(payload)
    ).rejects.toBeDefined();

    expect(mockToUserFriendlyError).toHaveBeenCalledWith(error, {
      defaultMessage: "Erro ao vincular moradores.",
      statusMessages: {
        400: "Dados inválidos.",
        401: "Não autenticado.",
        403: "Sem permissão.",
        404: "Conta não encontrada.",
        500: "Erro interno do servidor.",
      },
    });
  });

  it("propaga o erro retornado por toUserFriendlyError", async () => {
    const friendly = new Error("amigável");
    mockApi.post.mockRejectedValue(new Error("original"));
    mockToUserFriendlyError.mockReturnValue(friendly);

    await expect(
      accountResidentsService.vincularMoradores(payload)
    ).rejects.toBe(friendly);
  });
});

// ─── listarContasMoradores ────────────────────────────────────────────────────

describe("accountResidentsService.listarContasMoradores", () => {
  it("chama GET /contas-moradores/conta/:id, loga e retorna response.data", async () => {
    mockApi.get.mockResolvedValue({ data: [mockContaMorador] });

    const result = await accountResidentsService.listarContasMoradores("c-1");

    expect(mockApi.get).toHaveBeenCalledWith("/contas-moradores/conta/c-1");
    expect(mockLogger.table).toHaveBeenCalledWith(
      "AccountResidents",
      "Contas dos moradores da conta c-1",
      [mockContaMorador]
    );
    expect(result).toEqual([mockContaMorador]);
  });

  it("chama toUserFriendlyError com as mensagens corretas ao falhar", async () => {
    const error = new Error("fail");
    mockApi.get.mockRejectedValue(error);

    await expect(
      accountResidentsService.listarContasMoradores("c-1")
    ).rejects.toBeDefined();

    expect(mockToUserFriendlyError).toHaveBeenCalledWith(error, {
      defaultMessage: "Erro ao obter contas dos moradores.",
      statusMessages: {
        401: "Não autenticado.",
        404: "Nenhuma conta encontrada para estes moradores.",
        500: "Erro interno do servidor.",
      },
    });
  });

  it("propaga o erro retornado por toUserFriendlyError", async () => {
    const friendly = new Error("amigável");
    mockApi.get.mockRejectedValue(new Error("original"));
    mockToUserFriendlyError.mockReturnValue(friendly);

    await expect(
      accountResidentsService.listarContasMoradores("c-1")
    ).rejects.toBe(friendly);
  });
});

// ─── listarContasPorMorador ───────────────────────────────────────────────────

describe("accountResidentsService.listarContasPorMorador", () => {
  it("chama GET contas-moradores/morador/:id, loga e retorna response.data", async () => {
    mockApi.get.mockResolvedValue({ data: [mockContaMorador] });

    const result = await accountResidentsService.listarContasPorMorador("r-1");

    expect(mockApi.get).toHaveBeenCalledWith("contas-moradores/morador/r-1");
    expect(mockLogger.table).toHaveBeenCalledWith(
      "AccountResidents",
      "Contas do morador r-1",
      [mockContaMorador]
    );
    expect(result).toEqual([mockContaMorador]);
  });

  it("chama toUserFriendlyError com as mensagens corretas ao falhar", async () => {
    const error = new Error("fail");
    mockApi.get.mockRejectedValue(error);

    await expect(
      accountResidentsService.listarContasPorMorador("r-1")
    ).rejects.toBeDefined();

    expect(mockToUserFriendlyError).toHaveBeenCalledWith(error, {
      defaultMessage: "Erro ao obter contas dos moradores.",
      statusMessages: {
        401: "Não autenticado.",
        404: "Morador não encontrado.",
        500: "Erro interno do servidor.",
      },
    });
  });

  it("propaga o erro retornado por toUserFriendlyError", async () => {
    const friendly = new Error("amigável");
    mockApi.get.mockRejectedValue(new Error("original"));
    mockToUserFriendlyError.mockReturnValue(friendly);

    await expect(
      accountResidentsService.listarContasPorMorador("r-1")
    ).rejects.toBe(friendly);
  });
});

// ─── confirmarPagamentoMorador ────────────────────────────────────────────────

describe("accountResidentsService.confirmarPagamentoMorador", () => {
  it("chama PATCH /contas-moradores/:id/pagar, loga e resolve sem valor", async () => {
    mockApi.patch.mockResolvedValue({});

    await expect(
      accountResidentsService.confirmarPagamentoMorador({ id: "cm-1" })
    ).resolves.toBeUndefined();

    expect(mockApi.patch).toHaveBeenCalledWith("/contas-moradores/cm-1/pagar");
    expect(mockLogger.info).toHaveBeenCalledWith(
      "AccountResidents",
      "Pagamento da conta cm-1 enviado para confirmação do ADMIN"
    );
  });

  it("chama toUserFriendlyError com as mensagens corretas ao falhar", async () => {
    const error = new Error("fail");
    mockApi.patch.mockRejectedValue(error);

    await expect(
      accountResidentsService.confirmarPagamentoMorador({ id: "cm-1" })
    ).rejects.toBeDefined();

    expect(mockToUserFriendlyError).toHaveBeenCalledWith(error, {
      defaultMessage: "Erro ao marcar conta como paga",
      statusMessages: {
        400: "Dados inválidos.",
        401: "Não Autenticado.",
        403: "Sem permissão.",
        404: "Registro não encontrado",
        409: "Pagamento já em processamento ou pago",
        500: "Erro interno do servidor",
      },
    });
  });

  it("propaga o erro retornado por toUserFriendlyError", async () => {
    const friendly = new Error("amigável");
    mockApi.patch.mockRejectedValue(new Error("original"));
    mockToUserFriendlyError.mockReturnValue(friendly);

    await expect(
      accountResidentsService.confirmarPagamentoMorador({ id: "cm-1" })
    ).rejects.toBe(friendly);
  });
});

// ─── confirmarPagamentoAdmin ──────────────────────────────────────────────────

describe("accountResidentsService.confirmarPagamentoAdmin", () => {
  it("chama PATCH /contas-moradores/:id/confirmar, loga e retorna response.data", async () => {
    mockApi.patch.mockResolvedValue({ data: mockContaMorador });

    const result = await accountResidentsService.confirmarPagamentoAdmin({
      id: "cm-1",
    });

    expect(mockApi.patch).toHaveBeenCalledWith(
      "/contas-moradores/cm-1/confirmar"
    );
    expect(mockLogger.info).toHaveBeenCalledWith(
      "AccountResidents",
      "Pagamento da conta cm-1 confirmado pelo ADMIN"
    );
    expect(result).toEqual(mockContaMorador);
  });

  it("chama toUserFriendlyError com as mensagens corretas ao falhar", async () => {
    const error = new Error("fail");
    mockApi.patch.mockRejectedValue(error);

    await expect(
      accountResidentsService.confirmarPagamentoAdmin({ id: "cm-1" })
    ).rejects.toBeDefined();

    expect(mockToUserFriendlyError).toHaveBeenCalledWith(error, {
      defaultMessage: "Erro ao confirmar pagamento.",
      statusMessages: {
        401: "Não autenticado.",
        403: "Apenas ADMIN pode confirmar pagamentos.",
        404: "Registro não encontrado.",
        409: "Pagamento não está aguardando confirmação.",
        500: "Erro interno do servidor.",
      },
    });
  });

  it("propaga o erro retornado por toUserFriendlyError", async () => {
    const friendly = new Error("amigável");
    mockApi.patch.mockRejectedValue(new Error("original"));
    mockToUserFriendlyError.mockReturnValue(friendly);

    await expect(
      accountResidentsService.confirmarPagamentoAdmin({ id: "cm-1" })
    ).rejects.toBe(friendly);
  });
});

// ─── atualizarVisibilidadeAdmin ───────────────────────────────────────────────

describe("accountResidentsService.atualizarVisibilidadeAdmin", () => {
  it("chama PATCH /contas-moradores/:id/visibilidade com { visivel }, loga e retorna response.data", async () => {
    const updated = { ...mockContaMorador, visivel: false };
    mockApi.patch.mockResolvedValue({ data: updated });

    const result = await accountResidentsService.atualizarVisibilidadeAdmin({
      id: "cm-1",
      visivel: false,
    });

    expect(mockApi.patch).toHaveBeenCalledWith(
      "/contas-moradores/cm-1/visibilidade",
      { visivel: false }
    );
    expect(mockLogger.info).toHaveBeenCalledWith(
      "AccountResidents",
      "Visibilidade da conta cm-1 atualizada pelo ADMIN"
    );
    expect(result).toEqual(updated);
  });

  it("chama toUserFriendlyError com as mensagens corretas ao falhar", async () => {
    const error = new Error("fail");
    mockApi.patch.mockRejectedValue(error);

    await expect(
      accountResidentsService.atualizarVisibilidadeAdmin({
        id: "cm-1",
        visivel: true,
      })
    ).rejects.toBeDefined();

    expect(mockToUserFriendlyError).toHaveBeenCalledWith(error, {
      defaultMessage: "Erro ao atualizar visibilidade.",
      statusMessages: {
        401: "Não autenticado.",
        403: "Apenas ADMIN pode alterar visibilidade.",
        404: "Registro não encontrado.",
        500: "Erro interno do servidor.",
      },
    });
  });

  it("propaga o erro retornado por toUserFriendlyError", async () => {
    const friendly = new Error("amigável");
    mockApi.patch.mockRejectedValue(new Error("original"));
    mockToUserFriendlyError.mockReturnValue(friendly);

    await expect(
      accountResidentsService.atualizarVisibilidadeAdmin({
        id: "cm-1",
        visivel: true,
      })
    ).rejects.toBe(friendly);
  });
});
