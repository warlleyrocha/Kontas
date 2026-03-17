import * as Sentry from "@sentry/react-native";

const IS_DEV = process.env.EXPO_PUBLIC_APP_ENV === "development";

export const logger = {
  /** Mensagens informativas — console.info */
  info(tag: string, msg: string, data?: unknown) {
    if (IS_DEV) console.info(`[INFO][${tag}]`, msg, data ?? "");
  },

  /** Detalhes de baixo nível (payloads, estados internos) — console.debug */
  debug(tag: string, msg: string, data?: unknown) {
    if (IS_DEV) console.debug(`[DEBUG][${tag}]`, msg, data ?? "");
  },

  /** Alertas não críticos — console.warn + Sentry breadcrumb */
  warn(tag: string, msg: string, data?: unknown) {
    if (IS_DEV) console.warn(`[WARN][${tag}]`, msg, data ?? "");
    Sentry.addBreadcrumb({
      category: tag,
      message: msg,
      level: "warning",
      data: data as Record<string, unknown>,
    });
  },

  /** Erros e exceções — console.error + Sentry captureException */
  error(tag: string, msg: string, error?: unknown, extra?: Record<string, unknown>) {
    if (IS_DEV) {
      console.error(`[ERROR][${tag}]`, msg, error ?? "");
      console.trace(`[TRACE][${tag}]`);
    }
    Sentry.withScope((scope) => {
      scope.setTag("module", tag);
      if (extra) scope.setExtra("context", extra);
      const errorMessage = typeof error === "string" ? error : msg;
      const exception = error instanceof Error ? error : new Error(errorMessage);
      Sentry.captureException(exception);
    });
  },

  /** Arrays e objetos em formato tabular — console.table */
  table(tag: string, msg: string, data: object) {
    if (!IS_DEV) return;
    console.info(`[TABLE][${tag}]`, msg);
    console.table(data);
  },

  /** Rastreamento de fluxo de execução — console.trace */
  trace(tag: string, msg: string) {
    if (IS_DEV) console.trace(`[TRACE][${tag}]`, msg);
  },
};
