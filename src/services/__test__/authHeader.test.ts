jest.mock("expo-secure-store", () => ({
  getItemAsync: jest.fn(),
}));

function loadAuthHeaderModule() {
  const { getItemAsync } = require("expo-secure-store");
  return {
    getAuthorizationHeader: require("../authHeader").getAuthorizationHeader,
    hasAuthorizationHeader: require("../authHeader").hasAuthorizationHeader,
    hydrateAuthorizationHeader:
      require("../authHeader").hydrateAuthorizationHeader,
    setAuthorizationHeader: require("../authHeader").setAuthorizationHeader,
    clearAuthorizationHeader: require("../authHeader").clearAuthorizationHeader,
    mockGetItemAsync: jest.mocked(getItemAsync),
  };
}

beforeEach(() => {
  jest.resetModules();
  jest.clearAllMocks();
});

describe("authHeader", () => {
  describe("getAuthorizationHeader", () => {
    it("retorna null no estado inicial", () => {
      const { getAuthorizationHeader } = loadAuthHeaderModule();

      expect(getAuthorizationHeader()).toBeNull();
    });

    it("retorna o header Bearer após setAuthorizationHeader", () => {
      const { getAuthorizationHeader, setAuthorizationHeader } =
        loadAuthHeaderModule();

      setAuthorizationHeader("abc123");

      expect(getAuthorizationHeader()).toBe("Bearer abc123");
    });
  });

  describe("hasAuthorizationHeader", () => {
    it("retorna false quando não há token", () => {
      const { hasAuthorizationHeader } = loadAuthHeaderModule();

      expect(hasAuthorizationHeader()).toBe(false);
    });

    it("retorna true quando há token", () => {
      const { hasAuthorizationHeader, setAuthorizationHeader } =
        loadAuthHeaderModule();

      setAuthorizationHeader("abc123");

      expect(hasAuthorizationHeader()).toBe(true);
    });
  });

  describe("setAuthorizationHeader", () => {
    it("define o header de autorização", () => {
      const {
        getAuthorizationHeader,
        hasAuthorizationHeader,
        setAuthorizationHeader,
      } = loadAuthHeaderModule();

      setAuthorizationHeader("token-xyz");

      expect(getAuthorizationHeader()).toBe("Bearer token-xyz");
      expect(hasAuthorizationHeader()).toBe(true);
    });
  });

  describe("clearAuthorizationHeader", () => {
    it("limpa o header de autorização", () => {
      const {
        getAuthorizationHeader,
        hasAuthorizationHeader,
        setAuthorizationHeader,
        clearAuthorizationHeader,
      } = loadAuthHeaderModule();

      setAuthorizationHeader("token-xyz");
      clearAuthorizationHeader();

      expect(getAuthorizationHeader()).toBeNull();
      expect(hasAuthorizationHeader()).toBe(false);
    });
  });

  describe("hydrateAuthorizationHeader", () => {
    it("lê o token do SecureStore e aplica no header", async () => {
      const { getAuthorizationHeader, hasAuthorizationHeader, hydrateAuthorizationHeader, mockGetItemAsync } =
        loadAuthHeaderModule();

      mockGetItemAsync.mockResolvedValue("stored-token");

      await hydrateAuthorizationHeader();

      expect(getAuthorizationHeader()).toBe("Bearer stored-token");
      expect(hasAuthorizationHeader()).toBe(true);
    });

    it("não faz nada quando já foi hidratado", async () => {
      const { getAuthorizationHeader, hydrateAuthorizationHeader, mockGetItemAsync } =
        loadAuthHeaderModule();

      mockGetItemAsync.mockResolvedValue("first-token");

      await hydrateAuthorizationHeader();

      mockGetItemAsync.mockResolvedValue("second-token");
      await hydrateAuthorizationHeader();

      expect(getAuthorizationHeader()).toBe("Bearer first-token");
      expect(mockGetItemAsync).toHaveBeenCalledTimes(1);
    });

    it("compartilha a mesma promise quando chamado concorrentemente", async () => {
      const { hydrateAuthorizationHeader, mockGetItemAsync } =
        loadAuthHeaderModule();

      mockGetItemAsync.mockResolvedValue("concurrent-token");

      const [a, b] = await Promise.all([
        hydrateAuthorizationHeader(),
        hydrateAuthorizationHeader(),
      ]);

      expect(a).toBeUndefined();
      expect(b).toBeUndefined();
      expect(mockGetItemAsync).toHaveBeenCalledTimes(1);
    });
  });
});
