import {
  feedbackIntegration,
  init,
  mobileReplayIntegration,
} from "@sentry/react-native";

export function initSentry() {
  init({
    dsn: "...",
    sendDefaultPii: true,
    enableLogs: true,
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1,
    integrations: [mobileReplayIntegration(), feedbackIntegration()],
  });
}
