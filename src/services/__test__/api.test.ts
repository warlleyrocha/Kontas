import {
  AxiosError,
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from "axios";

type ApiModule = typeof import("../api");

type RequestConfig = InternalAxiosRequestConfig & { _cbHalfOpen?: boolean };

type MockedLogger = {
  debug: jest.Mock;
  info: jest.Mock;
  warn: jest.Mock;
  table: jest.Mock;
};

type InterceptorHandler<TArg, TResult = TArg> = {
  fulfilled: (value: TArg) => TResult | Promise<TResult>;
  rejected: (error: unknown) => Promise<never>;
};

const originalApiUrl = process.env.EXPO_PUBLIC_API_URL;

function createConfig(
  overrides: Partial<InternalAxiosRequestConfig> = {}
): InternalAxiosRequestConfig {
  return {
    method: "get",
    url: "/resource",
    headers: {},
    ...overrides,
  } as InternalAxiosRequestConfig;
}

function createAxiosError({
  message = "erro axios",
  code,
  status,
  config = createConfig(),
  data,
}: {
  message?: string;
  code?: string;
  status?: number;
  config?: InternalAxiosRequestConfig;
  data?: unknown;
} = {}) {
  return new AxiosError(
    message,
    code,
    config,
    undefined,
    status
      ? ({
          status,
          statusText: "error",
          headers: {},
          config,
          data,
        } as never)
      : undefined
  );
}

function getHandlers(api: AxiosInstance) {
  const requestHandlers = (
    api.interceptors.request as unknown as {
      handlers: InterceptorHandler<InternalAxiosRequestConfig>[];
    }
  ).handlers;

  const responseHandlers = (
    api.interceptors.response as unknown as {
      handlers: InterceptorHandler<unknown, unknown>[];
    }
  ).handlers;

  return {
    request: requestHandlers[0],
    response: responseHandlers[0],
  };
}

function importApiModule(apiUrl = "https://api.example.com") {
  jest.resetModules();

  const asyncStorage = {
    getItem: jest.fn(),
  };

  const logger: MockedLogger = {
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    table: jest.fn(),
  };

  jest.doMock("@react-native-async-storage/async-storage", () => ({
    __esModule: true,
    default: asyncStorage,
  }));

  jest.doMock("@/src/shared/utils/logger", () => ({
    __esModule: true,
    logger,
  }));

  if (apiUrl) {
    process.env.EXPO_PUBLIC_API_URL = apiUrl;
  } else {
    Reflect.deleteProperty(process.env, "EXPO_PUBLIC_API_URL");
  }

  let importedModule: ApiModule | undefined;

  jest.isolateModules(() => {
    importedModule = jest.requireActual("../api") as ApiModule;
  });

  const api = importedModule?.api as AxiosInstance;

  return {
    api,
    asyncStorage,
    logger,
    ...getHandlers(api),
  };
}

describe("api service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  afterAll(() => {
    if (originalApiUrl) {
      process.env.EXPO_PUBLIC_API_URL = originalApiUrl;
      return;
    }

    Reflect.deleteProperty(process.env, "EXPO_PUBLIC_API_URL");
  });

  it("lança erro ao importar quando EXPO_PUBLIC_API_URL não existe", () => {
    expect(() => importApiModule("")).toThrow(
      "EXPO_PUBLIC_API_URL não definida no runtime. Verifique o build preview/production."
    );
  });

  it("cria a instância axios com configuração base do app", () => {
    const { api } = importApiModule("https://contas.example.com");

    expect(api.defaults.baseURL).toBe("https://contas.example.com");
    expect(api.defaults.timeout).toBe(10000);
    expect(api.defaults.headers["Content-Type"]).toBe("application/json");
  });

  it("anexa o token no request e loga o payload enviado", async () => {
    const { asyncStorage, logger, request } = importApiModule();
    asyncStorage.getItem.mockResolvedValue("token-123");

    const config = createConfig({
      method: "post",
      url: "/payments",
      data: { id: 1 },
    });

    const result = await request.fulfilled(config);

    expect(asyncStorage.getItem).toHaveBeenCalledWith("@app:token");
    expect(result.headers.Authorization).toBe("Bearer token-123");
    expect((result as RequestConfig)._cbHalfOpen).toBe(false);
    expect(logger.debug).toHaveBeenCalledWith("API", "➡️ POST /payments", {
      id: 1,
    });
  });

  it("loga params quando não há data e não injeta Authorization sem token", async () => {
    const { asyncStorage, logger, request } = importApiModule();
    asyncStorage.getItem.mockResolvedValue(null);

    const config = createConfig({
      method: "get",
      url: "/accounts",
      params: { page: 2 },
    });

    const result = await request.fulfilled(config);

    expect(result.headers.Authorization).toBeUndefined();
    expect(logger.debug).toHaveBeenCalledWith("API", "➡️ GET /accounts", {
      page: 2,
    });
  });

  it("normaliza o erro do interceptor de request", async () => {
    const { request } = importApiModule();

    await expect(request.rejected("falha request")).rejects.toMatchObject({
      message: "falha request",
    });
  });

  it("loga resposta de sucesso com objeto", () => {
    const { logger, response } = importApiModule();
    const config = createConfig({ url: "/me" });
    const apiResponse = {
      status: 200,
      config,
      data: { ok: true },
    };

    expect(response.fulfilled(apiResponse)).toBe(apiResponse);
    expect(logger.info).toHaveBeenCalledWith("API", "✅ 200 /me", { ok: true });
  });

  it("abre o circuit breaker após falhas consecutivas e bloqueia novas requisições", async () => {
    const { logger, request, response } = importApiModule();
    const failure = createAxiosError({
      status: 500,
      config: createConfig({ url: "/unstable" }),
      data: { message: "boom" },
    });

    await expect(response.rejected(failure)).rejects.toBe(failure);
    await expect(response.rejected(failure)).rejects.toBe(failure);
    await expect(response.rejected(failure)).rejects.toBe(failure);

    await expect(
      request.fulfilled(createConfig({ url: "/blocked" }))
    ).rejects.toMatchObject({
      name: "CircuitBreakerError",
      code: "CIRCUIT_OPEN",
    });

    await expect(
      response.rejected(
        Object.assign(new Error("circuit open"), {
          code: "CIRCUIT_OPEN",
        })
      )
    ).rejects.toMatchObject({
      code: "CIRCUIT_OPEN",
    });

    expect(logger.warn).toHaveBeenCalledWith("API", "❌ 500 /unstable", {
      message: "boom",
    });
    expect(logger.warn).toHaveBeenCalledWith(
      "API",
      "⛔ Circuit breaker aberto: requisição bloqueada."
    );
  });

  it("entra em half-open após o timeout, bloqueia concorrência e fecha ao sucesso", async () => {
    const nowSpy = jest.spyOn(Date, "now");
    nowSpy.mockReturnValue(1000);

    const { asyncStorage, logger, request, response } = importApiModule();
    asyncStorage.getItem.mockResolvedValue(null);

    const failure = createAxiosError({
      status: 500,
      config: createConfig({ url: "/retry" }),
    });

    await expect(response.rejected(failure)).rejects.toBe(failure);
    await expect(response.rejected(failure)).rejects.toBe(failure);
    await expect(response.rejected(failure)).rejects.toBe(failure);

    nowSpy.mockReturnValue(11000);

    const halfOpenConfig = await request.fulfilled(
      createConfig({ url: "/retry-success" })
    );

    await expect(
      request.fulfilled(createConfig({ url: "/retry-concurrent" }))
    ).rejects.toMatchObject({
      code: "CIRCUIT_OPEN",
    });

    const apiResponse = {
      status: 200,
      config: halfOpenConfig,
      data: [{ id: 1 }],
    };

    expect(response.fulfilled(apiResponse)).toBe(apiResponse);
    expect(logger.table).toHaveBeenCalledWith("API", "✅ 200 /retry-success", [
      { id: 1 },
    ]);

    const normalConfig = await request.fulfilled(
      createConfig({ url: "/next" })
    );
    expect((normalConfig as RequestConfig)._cbHalfOpen).toBe(false);
  });

  it("reabre o circuito quando a tentativa half-open falha com erro contabilizável", async () => {
    const nowSpy = jest.spyOn(Date, "now");
    nowSpy.mockReturnValue(1000);

    const { request, response } = importApiModule();
    const failure = createAxiosError({
      status: 500,
      config: createConfig({ url: "/half-open-fail" }),
    });

    await expect(response.rejected(failure)).rejects.toBe(failure);
    await expect(response.rejected(failure)).rejects.toBe(failure);
    await expect(response.rejected(failure)).rejects.toBe(failure);

    nowSpy.mockReturnValue(11000);

    const halfOpenConfig = await request.fulfilled(
      createConfig({ url: "/half-open-fail" })
    );

    const halfOpenFailure = createAxiosError({
      status: 500,
      config: halfOpenConfig,
    });

    await expect(response.rejected(halfOpenFailure)).rejects.toBe(
      halfOpenFailure
    );
    await expect(
      request.fulfilled(createConfig({ url: "/still-blocked" }))
    ).rejects.toMatchObject({
      code: "CIRCUIT_OPEN",
    });
  });

  it("fecha o half-open quando o erro não deve contar para o circuito", async () => {
    const nowSpy = jest.spyOn(Date, "now");
    nowSpy.mockReturnValue(1000);

    const { request, response } = importApiModule();
    const failure = createAxiosError({
      status: 500,
      config: createConfig({ url: "/recoverable" }),
    });

    await expect(response.rejected(failure)).rejects.toBe(failure);
    await expect(response.rejected(failure)).rejects.toBe(failure);
    await expect(response.rejected(failure)).rejects.toBe(failure);

    nowSpy.mockReturnValue(11000);

    const halfOpenConfig = await request.fulfilled(
      createConfig({ url: "/recoverable" })
    );
    const canceledError = createAxiosError({
      code: "ERR_CANCELED",
      config: halfOpenConfig,
    });

    await expect(response.rejected(canceledError)).rejects.toBe(canceledError);

    const nextConfig = await request.fulfilled(
      createConfig({ url: "/allowed-again" })
    );

    expect((nextConfig as RequestConfig)._cbHalfOpen).toBe(false);
  });

  it("trata erro axios sem response como network error", async () => {
    const { logger, response } = importApiModule();
    const networkError = createAxiosError({
      config: createConfig({ url: "/network-error" }),
    });

    await expect(response.rejected(networkError)).rejects.toBe(networkError);

    expect(logger.warn).toHaveBeenCalledWith(
      "API",
      "❌ Network Error /network-error",
      undefined
    );
  });

  it("normaliza erro não axios no interceptor de resposta", async () => {
    const { response } = importApiModule();

    await expect(response.rejected("falha desconhecida")).rejects.toMatchObject(
      {
        message: "falha desconhecida",
      }
    );
  });

  it("repassa instância de Error no rejected do interceptor de request (L151)", async () => {
    const { request } = importApiModule();
    const err = new Error("already an error");

    await expect(request.rejected(err)).rejects.toBe(err);
  });

  it("repassa instância de Error não-axios no rejected do interceptor de resposta (L174)", async () => {
    const { response } = importApiModule();
    const err = new Error("plain non-axios error");

    await expect(response.rejected(err)).rejects.toBe(err);
  });

  it("não define Authorization quando config.headers é nulo com token presente (L136)", async () => {
    const { asyncStorage, request } = importApiModule();
    asyncStorage.getItem.mockResolvedValue("token-abc");

    const config = createConfig({ headers: null as any });
    const result = await request.fulfilled(config);

    expect(result.headers).toBeNull();
  });

  it("onFailure não modifica nada quando circuito já está OPEN (L86)", async () => {
    const { response } = importApiModule();
    const failure = createAxiosError({
      status: 500,
      config: createConfig({ url: "/unstable" }),
    });

    await expect(response.rejected(failure)).rejects.toBe(failure);
    await expect(response.rejected(failure)).rejects.toBe(failure);
    await expect(response.rejected(failure)).rejects.toBe(failure);

    // 4ª falha: circuito já está OPEN — onFailure(false) chamado com state=OPEN → L86 false branch
    await expect(response.rejected(failure)).rejects.toBe(failure);
  });

  it("onSuccess(false) não altera failureCount quando circuito está em HALF_OPEN (L69)", async () => {
    const nowSpy = jest.spyOn(Date, "now");
    nowSpy.mockReturnValue(1000);

    const { asyncStorage, request, response } = importApiModule();
    asyncStorage.getItem.mockResolvedValue(null);

    const failure = createAxiosError({
      status: 500,
      config: createConfig({ url: "/probe" }),
    });

    await expect(response.rejected(failure)).rejects.toBe(failure);
    await expect(response.rejected(failure)).rejects.toBe(failure);
    await expect(response.rejected(failure)).rejects.toBe(failure);

    nowSpy.mockReturnValue(11000);

    // Abre a sonda half-open (state → HALF_OPEN, halfOpenInFlight=true)
    await request.fulfilled(createConfig({ url: "/probe" }));

    // Resposta bem-sucedida de uma request normal (sem _cbHalfOpen) enquanto estado é HALF_OPEN
    // → onSuccess(false) chamado com state=HALF_OPEN → L69 false branch (não reseta failureCount)
    const normalConfig = Object.assign(createConfig({ url: "/other" }), {
      _cbHalfOpen: false,
    });
    const apiResponse = { status: 200, config: normalConfig, data: {} };
    expect(response.fulfilled(apiResponse)).toBe(apiResponse);
  });

  it("normaliza objeto axios-like que não é instância de Error (L196)", async () => {
    const { response } = importApiModule();

    // isAxiosError() verifica apenas a flag `isAxiosError: true`, não o instanceof.
    // Passando um objeto simples com essa flag chegamos ao final do handler (L195-196)
    // com error instanceof Error === false → cria new Error(String(error)).
    const fakeAxiosLike = {
      isAxiosError: true,
      code: undefined as string | undefined,
      config: createConfig({ url: "/fake" }),
      response: undefined,
      message: "fake axios",
      toString: () => "fake axios error",
    };

    await expect(response.rejected(fakeAxiosLike)).rejects.toMatchObject({
      message: "fake axios error",
    });
  });

  it("erro cancelado em request normal não modifica o circuito (L191–196)", async () => {
    const { asyncStorage, request, response } = importApiModule();
    asyncStorage.getItem.mockResolvedValue(null);

    const normalConfig = await request.fulfilled(
      createConfig({ url: "/cancel-test" })
    );
    const canceledError = createAxiosError({
      code: "ERR_CANCELED",
      config: normalConfig,
    });

    // shouldOpenByFailure=false, wasHalfOpen=false → nem if nem else-if é tomado → L195 direto
    await expect(response.rejected(canceledError)).rejects.toBe(canceledError);

    // Circuito permanece CLOSED
    const nextConfig = await request.fulfilled(createConfig({ url: "/next" }));
    expect((nextConfig as RequestConfig)._cbHalfOpen).toBe(false);
  });
});
