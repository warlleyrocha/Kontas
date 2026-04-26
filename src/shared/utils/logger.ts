import * as Sentry from "@sentry/react-native";

const IS_DEV =
  __DEV__ || process.env.EXPO_PUBLIC_APP_ENV?.trim() === "development";

export const logger = {
  /** Mensagens informativas — console.info */
  info(tag: string, msg: string, data?: unknown) {
    if (IS_DEV)
      console.info(
        `[INFO][${tag}]`,
        msg,
        data !== undefined ? JSON.stringify(data, null, 2) : ""
      );
  },

  /** Detalhes de baixo nível (payloads, estados internos) — console.debug */
  debug(tag: string, msg: string, data?: unknown) {
    if (IS_DEV)
      (console.debug || console.log)(
        `[DEBUG][${tag}]`,
        msg,
        data !== undefined ? JSON.stringify(data, null, 2) : ""
      );
  },

  /** Alertas não críticos — console.warn + Sentry breadcrumb */
  warn(tag: string, msg: string, _data?: unknown) {
    if (IS_DEV)
      console.warn(
        `[WARN][${tag}]`,
        msg,
        _data !== undefined ? JSON.stringify(_data, null, 2) : ""
      );
    Sentry.addBreadcrumb({
      category: tag,
      message: msg,
      level: "warning",
      // Never send raw payload data to Sentry — scrubbed by beforeSend anyway,
      // but keeping data out of breadcrumbs reduces attack surface.
    });
  },

  /** Erros e exceções — console.error + Sentry captureException */
  error(
    tag: string,
    msg: string,
    error?: unknown,
    _extra?: Record<string, unknown>
  ) {
    if (IS_DEV) {
      console.error(
        `[ERROR][${tag}]`,
        msg,
        error !== undefined
          ? JSON.stringify(error, Object.getOwnPropertyNames(error), 2)
          : ""
      );
      console.trace(`[TRACE][${tag}]`);
    }
    Sentry.withScope((scope) => {
      scope.setTag("module", tag);
      // Never send raw extra/context payloads to Sentry.
      // All events are scrubbed by beforeSend in initSentry, but defense-in-
      // depth: we simply don't attach arbitrary data here in the first place.
      const errorMessage = typeof error === "string" ? error : msg;
      const exception =
        error instanceof Error ? error : new Error(errorMessage);
      Sentry.captureException(exception);
    });
  },

  /** Arrays e objetos em formato JSON indentado — substitui console.table */
  table(tag: string, msg: string, data: object) {
    if (!IS_DEV) return;
    console.info(`[TABLE][${tag}]`, msg, JSON.stringify(data, null, 2));
  },

  /** Rastreamento de fluxo de execução — console.trace */
  trace(tag: string, msg: string) {
    if (IS_DEV) console.trace(`[TRACE][${tag}]`, msg);
  },
};
