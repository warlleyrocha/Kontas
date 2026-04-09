import { ConfigContext, ExpoConfig } from "expo/config";
import fs from "fs";
import path from "path";
import { version } from "./package.json";

/**
 * Carrega `.env` manualmente quando necessário (sem depender de dotenv)
 * Só carrega se `process.env.APP_ENV` não estiver definido e o arquivo existir.
 */
(function loadEnv() {
  try {
    const envPath = path.resolve(process.cwd(), ".env");

    // ✅ Só carrega em DEV SERVER (expo start / metro)
    const isDevServer =
      !!process.env.EXPO_PACKAGER_SOCKET_PORT ||
      !!process.env.EXPO_DEV_SERVER_URL ||
      !!process.env.REACT_NATIVE_PACKAGER_HOSTNAME ||
      !!process.env.RCT_METRO_PORT;

    if (!isDevServer) {
      return; // ⛔ nunca carrega em eas build / expo prebuild / etc
    }

    // Só carrega se ainda não tiver URL no ambiente
    if (fs.existsSync(envPath) && !process.env.EXPO_PUBLIC_API_URL) {
      const content = fs.readFileSync(envPath, { encoding: "utf8" });
      const lines = content.split(/\r?\n/);

      for (const raw of lines) {
        const line = raw.trim();
        if (!line || line.startsWith("#")) continue;

        const equalsIndex = line.indexOf("=");
        if (equalsIndex === -1) continue;

        const key = line.slice(0, equalsIndex).trim();
        let value = line.slice(equalsIndex + 1).trim();

        if (
          (value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))
        ) {
          value = value.slice(1, -1);
        }

        if (!process.env[key]) {
          process.env[key] = value;
        }
      }

      console.log("🔒 .env carregado (apenas dev server)");
    }
  } catch (err) {
    console.warn("⚠️ Falha ao carregar .env:", err);
  }
})();

// EAS Project Info
const EAS_PROJECT_ID = "024de3bb-27e4-4a7c-ac6f-e32a95eaa23a";
const PROJECT_SLUG = "kontas";
const OWNER = "kontas";

// App production config
const APP_NAME = "Kontas";
const BUNDLE_IDENTIFIER_IOS = "br.com.kontas.ios";
const PACKAGE_NAME_ANDROID = "br.com.kontas.android";
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

  const { name, bundleIdentifier, packageName, scheme } =
    getDynamicAppConfig(appEnv);

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
        image: "./assets/images/splash.png",
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
          image: "./assets/images/splash.png",
          resizeMode: "cover",
          backgroundColor: "#ffffff",
        },
      ],
      [
        "@react-native-google-signin/google-signin",
        {
          iosUrlScheme: `com.googleusercontent.apps.${process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID?.split(".")[0]}`,
        },
      ],
      [
        "expo-secure-store",
        {
          configureAndroidBackup: true,
        },
      ],
    ],
    experiments: {
      typedRoutes: true,
      reactCompiler: true,
    },
    extra: {
      env: appEnv,
      router: {},
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
    };
  }

  if (environment === "preview") {
    return {
      name: `${APP_NAME} Preview`,
      bundleIdentifier: `${BUNDLE_IDENTIFIER_IOS}`,
      packageName: `${PACKAGE_NAME_ANDROID}`,
      scheme: `${SCHEME}`,
    };
  }

  // Development
  return {
    name: `${APP_NAME} Dev`,
    bundleIdentifier: `${BUNDLE_IDENTIFIER_IOS}`,
    packageName: `${PACKAGE_NAME_ANDROID}`,
    scheme: `${SCHEME}`,
  };
};
