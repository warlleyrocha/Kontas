import type { EventHint } from "@sentry/core";
import type { ErrorEvent } from "@sentry/react-native";
import {
  feedbackIntegration,
  init,
  mobileReplayIntegration,
} from "@sentry/react-native";

const SENSITIVE_KEYS = [
  "token",
  "access_token",
  "refresh_token",
  "password",
  "cpf",
  "cnpj",
  "email",
  "telefone",
  "phone",
  "nome",
  "name",
  "authorization",
  "cookie",
  "session",
];

function scrubPII(obj: unknown): unknown {
  if (obj === null || obj === undefined) return obj;

  if (typeof obj === "string") {
    let result = obj;
    // CPF: 000.000.000-00
    result = result.replace(
      /\b(\d{3})[.]?(\d{3})[.]?(\d{3})-?(\d{2})\b/g,
      "***.***.***-**"
    );
    // Email
    result = result.replace(
      /\b[A-Z0-9._%+@-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi,
      "***@***.***"
    );
    return result;
  }

  if (Array.isArray(obj)) {
    return obj.map(scrubPII);
  }

  if (typeof obj === "object") {
    const scrubbed: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      if (SENSITIVE_KEYS.some((k) => key.toLowerCase().includes(k))) {
        scrubbed[key] = "[FILTERED]";
      } else {
        scrubbed[key] = scrubPII(value);
      }
    }
    return scrubbed;
  }

  return obj;
}

export function initSentry() {
  init({
    dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
    sendDefaultPii: false,
    enableLogs: true,
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 0.5,
    integrations: [
      mobileReplayIntegration({ maskAllText: true, maskAllImages: true }),
      feedbackIntegration(),
    ],
    beforeSend(event: ErrorEvent, _hint: EventHint): ErrorEvent | null {
      if (event.message) {
        event.message = String(scrubPII(event.message));
      }

      if (event.breadcrumbs) {
        for (const breadcrumb of event.breadcrumbs) {
          if (breadcrumb.message) {
            breadcrumb.message = String(scrubPII(breadcrumb.message));
          }
          if (breadcrumb.data) {
            breadcrumb.data = scrubPII(breadcrumb.data) as Record<
              string,
              unknown
            >;
          }
        }
      }

      if (event.extra) {
        event.extra = scrubPII(event.extra) as Record<string, unknown>;
      }

      for (const key of Object.keys(event.contexts ?? {})) {
        if (event.contexts?.[key]) {
          event.contexts[key] = scrubPII(event.contexts[key]) as Record<
            string,
            unknown
          >;
        }
      }

      return event;
    },
  });
}
