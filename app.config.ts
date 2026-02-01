import { ConfigContext, ExpoConfig } from "expo/config";
import fs from "fs";
import path from "path";
import { version } from "./package.json";

/**
 * Carrega `.env.local` manualmente quando necessário (sem depender de dotenv)
 * Só carrega se `process.env.APP_ENV` não estiver definido e o arquivo existir.
 */
(function loadLocalEnv() {
  try {
    const envPath = path.resolve(process.cwd(), ".env.local");
    if (fs.existsSync(envPath) && !process.env.APP_ENV) {
      const content = fs.readFileSync(envPath, { encoding: "utf8" });
      const lines = content.split(/\r?\n/);
      for (const raw of lines) {
        const line = raw.trim();
        if (!line || line.startsWith("#")) continue;
        const equalsIndex = line.indexOf("=");
        if (equalsIndex === -1) continue;
        const key = line.slice(0, equalsIndex).trim();
        let value = line.slice(equalsIndex + 1).trim();
        // remove surrounding quotes
        if (
          (value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))
        ) {
          value = value.slice(1, -1);
        }
        // unescape simple escapes
        value = value.replace(/\\n/g, "\n").replace(/\\r/g, "\r");
        if (!process.env[key]) {
          process.env[key] = value;
        }
      }
      console.log(
        "🔒 .env.local carregado para desenvolvimento (variáveis injetadas no process.env)"
      );
    }
  } catch (err) {
    // não bloquear a execução do config em caso de erro
    console.warn("⚠️ Falha ao carregar .env.local:", err);
  }
})();

// EAS Project Info
const EAS_PROJECT_ID = "04e033a1-b0fb-4572-9158-cfefac3041cf";
const PROJECT_SLUG = "kontas";
const OWNER = "warlleyrocha";

// App production config
const APP_NAME = "Kontas";
const BUNDLE_IDENTIFIER_IOS = "com.googleauth.ios";
const PACKAGE_NAME_ANDROID = "com.googleauth.android";
const ICON = "./assets/images/app-icon/1024.png";
const ADAPTIVE_ICON_FORE =
  "./assets/images/app-icon/res/mipmap-xxxhdpi/app-icon_adaptive_fore.png";
const ADAPTIVE_ICON_BACK =
  "./assets/images/app-icon/res/mipmap-xxxhdpi/app-icon_adaptive_back.png";
const SCHEME = "kontas";

export default ({ config }: ConfigContext): ExpoConfig => {
  // Detecta o ambiente pela variável APP_ENV configurada no eas.json
  // A variável APP_ENV é injetada durante o build do EAS através do campo "env" no eas.json
  const appEnv =
    (process.env.APP_ENV as "development" | "preview" | "production") ||
    "development";

  console.log("🔍 DEBUG - APP_ENV:", process.env.APP_ENV);
  console.log("⚙️ Building app for environment:", appEnv);

  const {
    name,
    bundleIdentifier,
    packageName,
    scheme,
    apiUrl: defaultApiUrl,
  } = getDynamicAppConfig(appEnv);

  // Usa EXPO_PUBLIC_API_URL se disponível (do EAS), caso contrário usa a URL padrão do ambiente
  const apiUrl = process.env.EXPO_PUBLIC_API_URL || defaultApiUrl;

  console.log("🌐 API URL:", apiUrl);

  return {
    ...config,
    name: name,
    version,
    slug: PROJECT_SLUG,
    orientation: "portrait",
    icon: ICON,
    scheme: scheme,
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    ios: {
      supportsTablet: true,
      bundleIdentifier: bundleIdentifier,
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false,
      },
    },
    android: {
      adaptiveIcon: {
        backgroundColor: "#E6F4FE",
        foregroundImage: ADAPTIVE_ICON_FORE,
        backgroundImage: ADAPTIVE_ICON_BACK,
      },
      splash: {
        image: "./assets/images/splash-icon-kontas.png",
        resizeMode: "cover",
        backgroundColor: "#ffffff",
      },
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
      package: packageName,
    },
    web: {
      output: "static",
      favicon: "./assets/images/app-icon/play_store_512.png",
      bundler: "metro",
    },
    plugins: [
      "expo-router",
      [
        "expo-splash-screen",
        {
          image: "./assets/images/splash-icon-kontas.png",
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
    ],
    experiments: {
      typedRoutes: true,
      reactCompiler: true,
    },
    extra: {
      router: {},
      apiUrl: apiUrl,
      eas: {
        projectId: EAS_PROJECT_ID,
      },
    },
    runtimeVersion: {
      policy: "appVersion",
    },
    updates: {
      url: `https://u.expo.dev/${EAS_PROJECT_ID}`,
    },
    owner: OWNER,
  };
};

// Configuração dinâmica baseada no ambiente
export const getDynamicAppConfig = (
  environment: "development" | "preview" | "production"
) => {
  if (environment === "production") {
    return {
      name: APP_NAME,
      bundleIdentifier: BUNDLE_IDENTIFIER_IOS,
      packageName: PACKAGE_NAME_ANDROID,
      scheme: SCHEME,
      apiUrl: "https://kontas-back-end-production.up.railway.app",
    };
  }

  if (environment === "preview") {
    return {
      name: `${APP_NAME} Preview`,
      bundleIdentifier: `${BUNDLE_IDENTIFIER_IOS}`,
      packageName: `${PACKAGE_NAME_ANDROID}`,
      scheme: `${SCHEME}`,
      apiUrl: "https://kontas-back-end-production.up.railway.app",
    };
  }

  // Development
  return {
    name: `${APP_NAME} Dev`,
    bundleIdentifier: `${BUNDLE_IDENTIFIER_IOS}`,
    packageName: `${PACKAGE_NAME_ANDROID}`,
    scheme: `${SCHEME}`,
    apiUrl: "http://10.0.2.2:3333",
  };
};
