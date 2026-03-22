const mockAlertAlert = jest.fn();
const mockCanOpenURL = jest.fn();
const mockOpenURL = jest.fn();

jest.mock("react-native", () => ({
  __esModule: true,
  Alert: {
    alert: mockAlertAlert,
  },
  Linking: {
    canOpenURL: mockCanOpenURL,
    openURL: mockOpenURL,
  },
}));

const ORIGINAL_ENV = { ...process.env };

function importLegalModule() {
  jest.resetModules();
  let importedModule: typeof import("./legal") | undefined;

  jest.isolateModules(() => {
    importedModule = jest.requireActual("./legal");
  });

  return importedModule as typeof import("./legal");
}

describe("legal constants", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...ORIGINAL_ENV };
    delete process.env.EXPO_PUBLIC_TERMS_OF_USE_URL;
    delete process.env.EXPO_PUBLIC_PRIVACY_POLICY_URL;
  });

  afterAll(() => {
    process.env = { ...ORIGINAL_ENV };
  });

  it("exporta legalLinks com URLs tratadas do ambiente", () => {
    process.env.EXPO_PUBLIC_TERMS_OF_USE_URL = " https://kontas.app/terms ";
    process.env.EXPO_PUBLIC_PRIVACY_POLICY_URL =
      " https://kontas.app/privacy ";

    const { legalLinks } = importLegalModule();

    expect(legalLinks).toEqual({
      termsOfUse: "https://kontas.app/terms",
      privacyPolicy: "https://kontas.app/privacy",
    });
  });

  it("exporta strings vazias quando as URLs não estiverem no ambiente", () => {
    const { legalLinks } = importLegalModule();

    expect(legalLinks).toEqual({
      termsOfUse: "",
      privacyPolicy: "",
    });
  });
});

describe("openLegalLink", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("mostra alerta quando a URL não estiver configurada", async () => {
    const { openLegalLink } = importLegalModule();

    await openLegalLink("", "termos de uso");

    expect(mockAlertAlert).toHaveBeenCalledWith(
      "Link não configurado",
      "Defina a URL pública de termos de uso no ambiente do app.",
    );
    expect(mockCanOpenURL).not.toHaveBeenCalled();
    expect(mockOpenURL).not.toHaveBeenCalled();
  });

  it("abre o link quando a URL for suportada", async () => {
    const { openLegalLink } = importLegalModule();
    mockCanOpenURL.mockResolvedValue(true as never);

    await openLegalLink("https://kontas.app/terms", "termos de uso");

    expect(mockCanOpenURL).toHaveBeenCalledWith(
      "https://kontas.app/terms",
    );
    expect(mockOpenURL).toHaveBeenCalledWith(
      "https://kontas.app/terms",
    );
    expect(mockAlertAlert).not.toHaveBeenCalled();
  });

  it("mostra alerta quando a URL não for suportada", async () => {
    const { openLegalLink } = importLegalModule();
    mockCanOpenURL.mockResolvedValue(false as never);

    await openLegalLink("https://kontas.app/privacy", "política de privacidade");

    expect(mockCanOpenURL).toHaveBeenCalledWith(
      "https://kontas.app/privacy",
    );
    expect(mockOpenURL).not.toHaveBeenCalled();
    expect(mockAlertAlert).toHaveBeenCalledWith(
      "Não foi possível abrir o link",
      "Verifique se a URL pública de política de privacidade está válida.",
    );
  });

  it("mostra alerta quando openURL falhar", async () => {
    const { openLegalLink } = importLegalModule();
    mockCanOpenURL.mockResolvedValue(true as never);
    mockOpenURL.mockRejectedValue(new Error("falha ao abrir"));

    await openLegalLink("https://kontas.app/privacy", "política de privacidade");

    expect(mockOpenURL).toHaveBeenCalledWith(
      "https://kontas.app/privacy",
    );
    expect(mockAlertAlert).toHaveBeenCalledWith(
      "Não foi possível abrir o link",
      "Verifique se a URL pública de política de privacidade está válida.",
    );
  });
});
