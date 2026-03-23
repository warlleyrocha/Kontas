import { AxiosError } from "axios";
import {
  AppError,
  getErrorMessage,
  isUnauthorizedError,
  toUserFriendlyError,
} from "../httpError";

function createAxiosError({
  message = "erro axios",
  code,
  status,
  data,
}: {
  message?: string;
  code?: string;
  status?: number;
  data?: unknown;
} = {}) {
  return new AxiosError(
    message,
    code,
    undefined,
    undefined,
    status
      ? ({
          status,
          statusText: "error",
          headers: {},
          config: { headers: {} },
          data,
        } as never)
      : undefined,
  );
}

describe("httpError", () => {
  it("preserva metadados ao instanciar AppError", () => {
    const originalError = new Error("origem");
    const error = new AppError("mensagem amigável", {
      status: 422,
      code: "VALIDATION",
      originalError,
    });

    expect(error.name).toBe("AppError");
    expect(error.message).toBe("mensagem amigável");
    expect(error.status).toBe(422);
    expect(error.code).toBe("VALIDATION");
    expect(error.originalError).toBe(originalError);
  });

  it("retorna o AppError original sem reempacotar", () => {
    const error = new AppError("já tratado", { status: 401 });

    expect(
      toUserFriendlyError(error, {
        defaultMessage: "fallback",
      }),
    ).toBe(error);
  });

  it("transforma Error comum preservando code e status quando existirem", () => {
    const error = Object.assign(new Error("erro comum"), {
      code: "ERR_CUSTOM",
      status: 409,
    });

    const result = toUserFriendlyError(error, {
      defaultMessage: "fallback",
    });

    expect(result).toBeInstanceOf(AppError);
    expect(result.message).toBe("erro comum");
    expect(result.code).toBe("ERR_CUSTOM");
    expect(result.status).toBe(409);
    expect(result.originalError).toBe(error);
  });

  it("usa defaultMessage para valores desconhecidos", () => {
    const result = toUserFriendlyError("falha", {
      defaultMessage: "mensagem padrão",
    });

    expect(result).toBeInstanceOf(AppError);
    expect(result.message).toBe("mensagem padrão");
    expect(result.originalError).toBe("falha");
  });

  it("usa statusMessages quando o status possui mapeamento", () => {
    const error = createAxiosError({ status: 404, code: "ERR_BAD_REQUEST" });

    const result = toUserFriendlyError(error, {
      defaultMessage: "fallback",
      statusMessages: {
        404: "recurso não encontrado",
      },
    });

    expect(result.message).toBe("recurso não encontrado");
    expect(result.status).toBe(404);
    expect(result.code).toBe("ERR_BAD_REQUEST");
    expect(result.originalError).toBe(error);
  });

  it("usa timeoutMessage para ECONNABORTED", () => {
    const error = createAxiosError({ code: "ECONNABORTED" });

    const result = toUserFriendlyError(error, {
      defaultMessage: "fallback",
      timeoutMessage: "tempo esgotado",
    });

    expect(result.message).toBe("tempo esgotado");
    expect(result.code).toBe("ECONNABORTED");
  });

  it("usa mensagem padrão de timeout quando timeoutMessage não é fornecido (L65)", () => {
    const error = createAxiosError({ code: "ECONNABORTED" });

    const result = toUserFriendlyError(error, { defaultMessage: "fallback" });

    expect(result.message).toBe("Tempo de resposta excedido. Tente novamente.");
  });

  it("usa networkMessage quando não há response", () => {
    const error = createAxiosError({ code: "ERR_NETWORK" });

    const result = toUserFriendlyError(error, {
      defaultMessage: "fallback",
      networkMessage: "sem conexão",
    });

    expect(result.message).toBe("sem conexão");
    expect(result.code).toBe("ERR_NETWORK");
  });

  it("usa mensagem padrão de rede quando networkMessage não é fornecido (L73)", () => {
    const error = createAxiosError({ code: "ERR_NETWORK" });

    const result = toUserFriendlyError(error, { defaultMessage: "fallback" });

    expect(result.message).toBe("Falha de conexão. Verifique sua internet.");
  });

  it("usa defaultMessage para erro axios com response sem mapeamento", () => {
    const error = createAxiosError({ status: 400, code: "ERR_BAD_REQUEST" });

    const result = toUserFriendlyError(error, {
      defaultMessage: "erro genérico",
    });

    expect(result.message).toBe("erro genérico");
    expect(result.status).toBe(400);
    expect(result.code).toBe("ERR_BAD_REQUEST");
  });

  it("identifica erro 401 para AppError e AxiosError", () => {
    expect(isUnauthorizedError(new AppError("sem acesso", { status: 401 }))).toBe(
      true,
    );
    expect(isUnauthorizedError(createAxiosError({ status: 401 }))).toBe(true);
    expect(isUnauthorizedError(new AppError("outro", { status: 403 }))).toBe(
      false,
    );
    expect(isUnauthorizedError(new Error("sem status"))).toBe(false);
  });

  it("retorna a mensagem correta para AppError, Error comum e fallback", () => {
    expect(getErrorMessage(new AppError("mensagem app"))).toBe("mensagem app");
    expect(getErrorMessage(new Error("mensagem comum"))).toBe("mensagem comum");
    expect(getErrorMessage(null, "fallback customizado")).toBe(
      "fallback customizado",
    );
  });
});
