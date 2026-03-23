const mockAddBreadcrumb = jest.fn();
const mockCaptureException = jest.fn();
const mockSetTag = jest.fn();
const mockSetExtra = jest.fn();
const mockWithScope = jest.fn(
  (
    callback: (scope: {
      setTag: typeof mockSetTag;
      setExtra: typeof mockSetExtra;
    }) => void
  ) => {
    callback({
      setTag: mockSetTag,
      setExtra: mockSetExtra,
    });
  }
);

jest.mock("@sentry/react-native", () => ({
  __esModule: true,
  addBreadcrumb: mockAddBreadcrumb,
  captureException: mockCaptureException,
  withScope: mockWithScope,
}));

const ORIGINAL_ENV = { ...process.env };
const ORIGINAL_DEV = global.__DEV__;

function importLoggerModule() {
  jest.resetModules();
  let importedModule: typeof import("../logger") | undefined;

  jest.isolateModules(() => {
    importedModule = jest.requireActual("../logger");
  });

  return importedModule as typeof import("../logger");
}

describe("logger", () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    mockAddBreadcrumb.mockReset();
    mockCaptureException.mockReset();
    mockSetTag.mockReset();
    mockSetExtra.mockReset();
    mockWithScope.mockClear();
    process.env = { ...ORIGINAL_ENV };
    delete process.env.EXPO_PUBLIC_APP_ENV;
  });

  afterAll(() => {
    process.env = { ...ORIGINAL_ENV };
    global.__DEV__ = ORIGINAL_DEV;
  });

  it("loga info, debug, warn, error, table e trace em ambiente de desenvolvimento", () => {
    global.__DEV__ = true;
    const infoSpy = jest.spyOn(console, "info").mockImplementation(() => {});
    const debugSpy = jest.spyOn(console, "debug").mockImplementation(() => {});
    const warnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});
    const errorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    const traceSpy = jest.spyOn(console, "trace").mockImplementation(() => {});
    const { logger } = importLoggerModule();
    const error = new Error("falha controlada");

    logger.info("Auth", "mensagem info", { ok: true });
    logger.debug("Auth", "mensagem debug", { payload: 1 });
    logger.warn("Auth", "mensagem warn", { step: "x" });
    logger.error("Auth", "mensagem error", error, { requestId: "1" });
    logger.table("Auth", "mensagem table", { rows: 2 });
    logger.trace("Auth", "mensagem trace");

    expect(infoSpy).toHaveBeenCalledWith(
      "[INFO][Auth]",
      "mensagem info",
      JSON.stringify({ ok: true }, null, 2)
    );
    expect(debugSpy).toHaveBeenCalledWith(
      "[DEBUG][Auth]",
      "mensagem debug",
      JSON.stringify({ payload: 1 }, null, 2)
    );
    expect(warnSpy).toHaveBeenCalledWith(
      "[WARN][Auth]",
      "mensagem warn",
      JSON.stringify({ step: "x" }, null, 2)
    );
    expect(mockAddBreadcrumb).toHaveBeenCalledWith({
      category: "Auth",
      message: "mensagem warn",
      level: "warning",
      data: { step: "x" },
    });
    expect(errorSpy).toHaveBeenCalledWith(
      "[ERROR][Auth]",
      "mensagem error",
      JSON.stringify(error, Object.getOwnPropertyNames(error), 2)
    );
    expect(traceSpy).toHaveBeenNthCalledWith(1, "[TRACE][Auth]");
    expect(traceSpy).toHaveBeenNthCalledWith(
      2,
      "[TRACE][Auth]",
      "mensagem trace"
    );
    expect(mockSetTag).toHaveBeenCalledWith("module", "Auth");
    expect(mockSetExtra).toHaveBeenCalledWith("context", { requestId: "1" });
    expect(mockCaptureException).toHaveBeenCalledWith(error);
    expect(infoSpy).toHaveBeenNthCalledWith(
      2,
      "[TABLE][Auth]",
      "mensagem table",
      JSON.stringify({ rows: 2 }, null, 2)
    );
  });

  it("não usa console para info/debug/table/trace fora de desenvolvimento, mas continua reportando warn e error", () => {
    global.__DEV__ = false;
    process.env.EXPO_PUBLIC_APP_ENV = "production";
    const infoSpy = jest.spyOn(console, "info").mockImplementation(() => {});
    const debugSpy = jest.spyOn(console, "debug").mockImplementation(() => {});
    const warnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});
    const errorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    const traceSpy = jest.spyOn(console, "trace").mockImplementation(() => {});
    const { logger } = importLoggerModule();

    logger.info("API", "info");
    logger.debug("API", "debug");
    logger.warn("API", "warn");
    logger.error("API", "msg padrao");
    logger.table("API", "table", { ok: true });
    logger.trace("API", "trace");

    expect(infoSpy).not.toHaveBeenCalled();
    expect(debugSpy).not.toHaveBeenCalled();
    expect(warnSpy).not.toHaveBeenCalled();
    expect(errorSpy).not.toHaveBeenCalled();
    expect(traceSpy).not.toHaveBeenCalled();
    expect(mockAddBreadcrumb).toHaveBeenCalledWith({
      category: "API",
      message: "warn",
      level: "warning",
      data: undefined,
    });
    expect(mockSetTag).toHaveBeenCalledWith("module", "API");
    expect(mockSetExtra).not.toHaveBeenCalled();
    expect(mockCaptureException).toHaveBeenCalledWith(expect.any(Error));
    expect(mockCaptureException.mock.calls[0]?.[0]).toMatchObject({
      message: "msg padrao",
    });
  });

  it("usa os fallbacks quando data e error não forem informados ou quando error for string", () => {
    global.__DEV__ = true;
    const infoSpy = jest.spyOn(console, "info").mockImplementation(() => {});
    const debugSpy = jest.spyOn(console, "debug").mockImplementation(() => {});
    const warnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});
    const errorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    const traceSpy = jest.spyOn(console, "trace").mockImplementation(() => {});
    const { logger } = importLoggerModule();

    logger.info("Billing", "info sem data");
    logger.debug("Billing", "debug sem data");
    logger.warn("Billing", "warn sem data");
    logger.error("Billing", "erro sem payload");
    logger.error("Billing", "erro com string", "falha em texto");

    expect(infoSpy).toHaveBeenCalledWith(
      "[INFO][Billing]",
      "info sem data",
      ""
    );
    expect(debugSpy).toHaveBeenCalledWith(
      "[DEBUG][Billing]",
      "debug sem data",
      ""
    );
    expect(warnSpy).toHaveBeenCalledWith(
      "[WARN][Billing]",
      "warn sem data",
      ""
    );
    expect(mockAddBreadcrumb).toHaveBeenCalledWith({
      category: "Billing",
      message: "warn sem data",
      level: "warning",
      data: undefined,
    });
    expect(errorSpy).toHaveBeenNthCalledWith(
      1,
      "[ERROR][Billing]",
      "erro sem payload",
      ""
    );
    expect(errorSpy).toHaveBeenNthCalledWith(
      2,
      "[ERROR][Billing]",
      "erro com string",
      JSON.stringify(
        "falha em texto",
        Object.getOwnPropertyNames("falha em texto"),
        2
      )
    );
    expect(traceSpy).toHaveBeenNthCalledWith(1, "[TRACE][Billing]");
    expect(traceSpy).toHaveBeenNthCalledWith(2, "[TRACE][Billing]");
    expect(mockCaptureException).toHaveBeenNthCalledWith(1, expect.any(Error));
    expect(mockCaptureException.mock.calls[0]?.[0]).toMatchObject({
      message: "erro sem payload",
    });
    expect(mockCaptureException).toHaveBeenNthCalledWith(2, expect.any(Error));
    expect(mockCaptureException.mock.calls[1]?.[0]).toMatchObject({
      message: "falha em texto",
    });
  });
});
