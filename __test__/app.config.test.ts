import { version } from "../package.json";

const ORIGINAL_ENV = { ...process.env };
const CONTROLLED_ENV_KEYS = [
  "APP_ENV",
  "EXPO_PACKAGER_SOCKET_PORT",
  "EXPO_DEV_SERVER_URL",
  "REACT_NATIVE_PACKAGER_HOSTNAME",
  "RCT_METRO_PORT",
  "EXPO_PUBLIC_API_URL",
  "EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID",
  "EXISTING_KEY",
  "QUOTED_SINGLE",
  "QUOTED_DOUBLE",
];

function restoreControlledEnv() {
  for (const key of CONTROLLED_ENV_KEYS) {
    if (ORIGINAL_ENV[key] === undefined) {
      delete process.env[key];
      continue;
    }

    process.env[key] = ORIGINAL_ENV[key];
  }
}

interface ImportFreshAppConfigOptions {
  env?: Record<string, string | undefined>;
  envContent?: string;
  envFileExists?: boolean;
  readFileError?: Error;
}

function importFreshAppConfig({
  env = {},
  envContent = "",
  envFileExists = false,
  readFileError,
}: ImportFreshAppConfigOptions = {}) {
  jest.resetModules();

  for (const key of CONTROLLED_ENV_KEYS) {
    delete process.env[key];
  }

  for (const [key, value] of Object.entries(env)) {
    if (value === undefined) {
      delete process.env[key];
      continue;
    }

    process.env[key] = value;
  }

  const fsMock = {
    existsSync: jest.fn(() => envFileExists),
    readFileSync: jest.fn(() => {
      if (readFileError) {
        throw readFileError;
      }

      return envContent;
    }),
  };

  jest.doMock("expo/config", () => ({}));
  jest.doMock("fs", () => ({
    __esModule: true,
    default: fsMock,
    ...fsMock,
  }));

  let appConfigModule: Record<string, unknown> | undefined;
  jest.isolateModules(() => {
    // biome-ignore lint/style/noCommonJs: jest.isolateModules requer require
    appConfigModule = require("../app.config") as Record<string, unknown>;
  });

  return {
    fsMock,
    appConfigModule: appConfigModule as Record<string, unknown>,
  };
}

describe("app.config.ts", () => {
  let consoleLogSpy: jest.SpyInstance;
  let consoleWarnSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleLogSpy = jest.spyOn(console, "log").mockImplementation(() => {});
    consoleWarnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
    consoleWarnSpy.mockRestore();
    restoreControlledEnv();
    jest.resetModules();
    jest.dontMock("expo/config");
    jest.dontMock("fs");
  });

  it("não carrega o .env fora do dev server", () => {
    const { fsMock } = importFreshAppConfig({
      envFileExists: true,
      envContent: "EXPO_PUBLIC_API_URL=http://localhost:3333",
    });

    expect(fsMock.existsSync).not.toHaveBeenCalled();
    expect(fsMock.readFileSync).not.toHaveBeenCalled();
    expect(process.env.EXPO_PUBLIC_API_URL).toBeUndefined();
    expect(consoleLogSpy).not.toHaveBeenCalled();
    expect(consoleWarnSpy).not.toHaveBeenCalled();
  });

  it("não lê o .env quando a API já está definida no ambiente", () => {
    const { fsMock } = importFreshAppConfig({
      env: {
        EXPO_DEV_SERVER_URL: "http://127.0.0.1:8081",
        EXPO_PUBLIC_API_URL: "https://api.kontas.app",
      },
      envFileExists: true,
      envContent: "APP_ENV=preview",
    });

    expect(fsMock.existsSync).toHaveBeenCalledTimes(1);
    expect(fsMock.readFileSync).not.toHaveBeenCalled();
    expect(process.env.EXPO_PUBLIC_API_URL).toBe("https://api.kontas.app");
    expect(process.env.APP_ENV).toBeUndefined();
    expect(consoleLogSpy).not.toHaveBeenCalled();
  });

  it("ignora o .env quando o arquivo não existe", () => {
    const { fsMock } = importFreshAppConfig({
      env: {
        EXPO_PACKAGER_SOCKET_PORT: "8081",
      },
      envFileExists: false,
    });

    expect(fsMock.existsSync).toHaveBeenCalledTimes(1);
    expect(fsMock.readFileSync).not.toHaveBeenCalled();
    expect(consoleLogSpy).not.toHaveBeenCalled();
    expect(consoleWarnSpy).not.toHaveBeenCalled();
  });

  it("carrega o .env no dev server, remove aspas e preserva variáveis já existentes", () => {
    const { fsMock } = importFreshAppConfig({
      env: {
        REACT_NATIVE_PACKAGER_HOSTNAME: "localhost",
        EXISTING_KEY: "keep-this",
      },
      envFileExists: true,
      envContent: [
        "# comment",
        'EXPO_PUBLIC_API_URL="http://localhost:3333"',
        "APP_ENV=preview",
        "INVALID_LINE",
        "QUOTED_SINGLE='abc'",
        "EXISTING_KEY=override-attempt",
      ].join("\n"),
    });

    expect(fsMock.existsSync).toHaveBeenCalledTimes(1);
    expect(fsMock.readFileSync).toHaveBeenCalledTimes(1);
    expect(process.env.EXPO_PUBLIC_API_URL).toBe("http://localhost:3333");
    expect(process.env.APP_ENV).toBe("preview");
    expect(process.env.QUOTED_SINGLE).toBe("abc");
    expect(process.env.EXISTING_KEY).toBe("keep-this");
    expect(consoleLogSpy).toHaveBeenCalledWith(
      expect.stringContaining(".env carregado")
    );
    expect(consoleWarnSpy).not.toHaveBeenCalled();
  });

  it("avisa quando ocorre falha ao carregar o .env", () => {
    const error = new Error("boom");

    const { fsMock } = importFreshAppConfig({
      env: {
        RCT_METRO_PORT: "8081",
      },
      envFileExists: true,
      readFileError: error,
    });

    expect(fsMock.existsSync).toHaveBeenCalledTimes(1);
    expect(fsMock.readFileSync).toHaveBeenCalledTimes(1);
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      expect.stringContaining("Falha ao carregar .env"),
      error
    );
  });

  it("retorna a configuração dinâmica correta para production, preview e development", () => {
    const { appConfigModule } = importFreshAppConfig();
    const { getDynamicAppConfig } = appConfigModule as {
      getDynamicAppConfig: (env: string) => Record<string, string>;
    };

    expect(getDynamicAppConfig("production")).toEqual({
      name: "Kontas",
      bundleIdentifier: "br.com.kontas.ios",
      packageName: "br.com.kontas.android",
      scheme: "kontas",
    });

    expect(getDynamicAppConfig("preview")).toEqual({
      name: "Kontas Preview",
      bundleIdentifier: "br.com.kontas.ios",
      packageName: "br.com.kontas.android",
      scheme: "kontas",
    });

    expect(getDynamicAppConfig("development")).toEqual({
      name: "Kontas Dev",
      bundleIdentifier: "br.com.kontas.ios",
      packageName: "br.com.kontas.android",
      scheme: "kontas",
    });
  });

  it("monta o Expo config completo usando development por padrão", () => {
    const { appConfigModule } = importFreshAppConfig({
      env: {
        EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID:
          "475215012202-oq93e4s85f7uuhfji6k2nkhdb7i2dfm3.apps.googleusercontent.com",
      },
    });
    const createConfig = (
      appConfigModule as { default: (ctx: unknown) => Record<string, unknown> }
    ).default;

    const result = createConfig({
      config: {
        description: "Base config",
      },
    });

    expect(result).toEqual(
      expect.objectContaining({
        description: "Base config",
        name: "Kontas Dev",
        version,
        slug: "kontas",
        orientation: "portrait",
        icon: "./assets/images/app-icon/1024.png",
        scheme: "kontas",
        userInterfaceStyle: "automatic",
        newArchEnabled: true,
        runtimeVersion: {
          policy: "appVersion",
        },
        updates: {
          url: "https://u.expo.dev/024de3bb-27e4-4a7c-ac6f-e32a95eaa23a",
        },
        owner: "kontas",
      })
    );

    expect(result.ios).toEqual({
      supportsTablet: true,
      bundleIdentifier: "br.com.kontas.ios",
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false,
      },
    });

    expect(result.android).toEqual({
      adaptiveIcon: {
        backgroundColor: "#E6F4FE",
        foregroundImage:
          "./assets/images/app-icon/res/mipmap-xxxhdpi/app-icon_adaptive_fore.png",
        backgroundImage:
          "./assets/images/app-icon/res/mipmap-xxxhdpi/app-icon_adaptive_back.png",
      },
      splash: {
        image: "./assets/images/splash.png",
        resizeMode: "cover",
        backgroundColor: "#ffffff",
      },
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
      package: "br.com.kontas.android",
    });

    expect(result.web).toEqual({
      output: "static",
      favicon: "./assets/images/app-icon/play_store_512.png",
      bundler: "metro",
    });

    expect(result.plugins).toEqual([
      "expo-router",
      [
        "expo-splash-screen",
        {
          image: "./assets/images/splash.png",
          resizeMode: "cover",
          backgroundColor: "#ffffff",
        },
      ],
      [
        "@react-native-google-signin/google-signin",
        {
          iosUrlScheme:
            "com.googleusercontent.apps.475215012202-oq93e4s85f7uuhfji6k2nkhdb7i2dfm3",
        },
      ],
      [
        "expo-secure-store",
        {
          configureAndroidBackup: true,
        },
      ],
    ]);

    expect(result.experiments).toEqual({
      typedRoutes: true,
      reactCompiler: true,
    });

    expect(result.extra).toEqual({
      env: "development",
      router: {},
      eas: {
        projectId: "024de3bb-27e4-4a7c-ac6f-e32a95eaa23a",
      },
    });
  });
});
