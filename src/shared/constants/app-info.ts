import * as Application from "expo-application";
import Constants from "expo-constants";

const APP_VERSION = Application.nativeApplicationVersion ?? "0.0.0";
const APP_BUILD = Application.nativeBuildVersion ?? "0";

const APP_ENV =
  Constants.expoConfig?.extra?.env ??
  (Constants.manifest2?.extra as any)?.env ??
  "development";

const APP_VERSION_LABEL = `v${APP_VERSION} (${APP_BUILD})`;

export const APP_INFO = `${APP_ENV} • ${APP_VERSION_LABEL}`;
