import {
  feedbackIntegration,
  init,
  mobileReplayIntegration,
} from "@sentry/react-native";
import { initSentry, scrubPII } from "@/src/lib/sentry";

jest.mock("@sentry/react-native", () => ({
  __esModule: true,
  feedbackIntegration: jest.fn(),
  init: jest.fn(),
  mobileReplayIntegration: jest.fn(),
}));

const mockFeedbackIntegration = jest.mocked(feedbackIntegration);
const mockInit = jest.mocked(init);
const mockMobileReplayIntegration = jest.mocked(mobileReplayIntegration);

const MOCK_DSN = "https://test-key@sentry.io/test-project";

describe("initSentry", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.EXPO_PUBLIC_SENTRY_DSN = MOCK_DSN;
    mockMobileReplayIntegration.mockReturnValue({
      name: "mobile-replay",
    } as never);
    mockFeedbackIntegration.mockReturnValue({
      name: "feedback",
    } as never);
  });

  afterEach(() => {
    delete process.env.EXPO_PUBLIC_SENTRY_DSN;
  });

  it("inicializa o Sentry com as integrações e configurações do app", () => {
    initSentry();

    expect(mockMobileReplayIntegration).toHaveBeenCalledTimes(1);
    expect(mockMobileReplayIntegration).toHaveBeenCalledWith({
      maskAllText: true,
      maskAllImages: true,
    });
    expect(mockFeedbackIntegration).toHaveBeenCalledTimes(1);
    expect(mockInit).toHaveBeenCalledTimes(1);
    expect(mockInit).toHaveBeenCalledWith({
      dsn: MOCK_DSN,
      sendDefaultPii: false,
      enableLogs: true,
      replaysSessionSampleRate: 0,
      replaysOnErrorSampleRate: 0.5,
      integrations: [{ name: "mobile-replay" }, { name: "feedback" }],
      beforeSend: expect.any(Function),
    });
  });

  it("passa dsn=undefined quando a variável de ambiente não está definida", () => {
    delete process.env.EXPO_PUBLIC_SENTRY_DSN;
    initSentry();
    expect(mockInit).toHaveBeenCalledWith(
      expect.objectContaining({ dsn: undefined })
    );
  });
});

describe("scrubPII", () => {
  it("retorna null quando input é null", () => {
    expect(scrubPII(null)).toBeNull();
  });

  it("retorna undefined quando input é undefined", () => {
    expect(scrubPII(undefined)).toBeUndefined();
  });

  it("retorna string inalterada quando não contém PII", () => {
    expect(scrubPII("texto sem dados")).toBe("texto sem dados");
  });

  it("mascara CPF no formato 000.000.000-00", () => {
    expect(scrubPII("CPF: 123.456.789-00")).toBe("CPF: ***.***.***-**");
  });

  it("mascara CPF no formato sem pontos", () => {
    expect(scrubPII("CPF: 12345678900")).toBe("CPF: ***.***.***-**");
  });

  it("mascara email", () => {
    expect(scrubPII("contato@email.com")).toBe("***@***.***");
  });

  it("mascara email em texto longo", () => {
    expect(scrubPII("Meu email é teste@dominio.com.br ok")).toBe(
      "Meu email é ***@***.*** ok"
    );
  });

  it("mascara chaves sensíveis em objetos", () => {
    const input = { token: "abc123", nome: "João", idade: 25 };
    expect(scrubPII(input)).toEqual({
      token: "[FILTERED]",
      nome: "[FILTERED]",
      idade: 25,
    });
  });

  it("mascara chaves que contém parte sensível (case insensitive)", () => {
    const input = { access_token: "xyz", my_password: "123" };
    expect(scrubPII(input)).toEqual({
      access_token: "[FILTERED]",
      my_password: "[FILTERED]",
    });
  });

  it("processa objetos aninhados", () => {
    const input = { user: { nome: "Maria", cpf: "12345678900" } };
    expect(scrubPII(input)).toEqual({
      user: { nome: "[FILTERED]", cpf: "[FILTERED]" },
    });
  });

  it("mapeia arrays recursivamente", () => {
    const input = [{ nome: "Ana" }, { nome: "Bruno" }];
    expect(scrubPII(input)).toEqual([
      { nome: "[FILTERED]" },
      { nome: "[FILTERED]" },
    ]);
  });

  it("retorna números inalterados", () => {
    expect(scrubPII(42)).toBe(42);
    expect(scrubPII(3.14)).toBe(3.14);
  });

  it("retorna boolean inalterado", () => {
    expect(scrubPII(true)).toBe(true);
    expect(scrubPII(false)).toBe(false);
  });
});

describe("beforeSend", () => {
  const getBeforeSend = () => {
    const config = mockInit.mock.calls[0][0];
    expect(config).toBeDefined();
    return (
      config as { beforeSend: (event: unknown, hint: unknown) => unknown }
    ).beforeSend;
  };

  it("filtra event.message", () => {
    mockMobileReplayIntegration.mockReturnValue({
      name: "mobile-replay",
    } as never);
    mockFeedbackIntegration.mockReturnValue({ name: "feedback" } as never);
    process.env.EXPO_PUBLIC_SENTRY_DSN = MOCK_DSN;

    initSentry();
    const beforeSend = getBeforeSend();

    const event = { message: "cpf: 123.456.789-00" };
    const result = beforeSend(event, {});

    expect(result).toHaveProperty("message", "cpf: ***.***.***-**");
  });

  it("filtra breadcrumb.message", () => {
    initSentry();
    const beforeSend = getBeforeSend();

    const event = {
      breadcrumbs: [{ message: "email@teste.com" }, { message: "outro texto" }],
    };
    const result = beforeSend(event, {}) as {
      breadcrumbs?: { message: string }[];
    };

    expect(result.breadcrumbs?.[0].message).toBe("***@***.***");
    expect(result.breadcrumbs?.[1].message).toBe("outro texto");
  });

  it("filtra breadcrumb.data", () => {
    initSentry();
    const beforeSend = getBeforeSend();

    const event = {
      breadcrumbs: [{ data: { password: "123", outros: "valor" } }],
    };
    const result = beforeSend(event, {}) as {
      breadcrumbs?: { data: Record<string, unknown> }[];
    };

    expect(result.breadcrumbs?.[0].data).toEqual({
      password: "[FILTERED]",
      outros: "valor",
    });
  });

  it("filtra event.extra", () => {
    initSentry();
    const beforeSend = getBeforeSend();

    const event = {
      extra: { cpf: "00011122233", versao: "1.0" },
    };
    const result = beforeSend(event, {}) as { extra: Record<string, unknown> };

    expect(result.extra).toEqual({
      cpf: "[FILTERED]",
      versao: "1.0",
    });
  });

  it("filtra event.contexts", () => {
    initSentry();
    const beforeSend = getBeforeSend();

    const event = {
      contexts: {
        device: { nome: "Samsung", token: "abc" },
        os: { version: "12" },
      },
    };
    const result = beforeSend(event, {}) as {
      contexts: Record<string, Record<string, unknown>>;
    };

    expect(result.contexts.device).toEqual({
      nome: "[FILTERED]",
      token: "[FILTERED]",
    });
    expect(result.contexts.os).toEqual({ version: "12" });
  });

  it("retorna event inalterado quando event está vazio", () => {
    initSentry();
    const beforeSend = getBeforeSend();

    const result = beforeSend({}, {});
    expect(result).toEqual({});
  });
});
