import {
  feedbackIntegration,
  init,
  mobileReplayIntegration,
} from "@sentry/react-native";

export function initSentry() {
  init({
    dsn: "https://da32d972451786e6c1a0aea2f4024516@o4510817801928704.ingest.us.sentry.io/4510818996322304",
    sendDefaultPii: true,
    enableLogs: true,
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1,
    integrations: [mobileReplayIntegration(), feedbackIntegration()],
  });
}
