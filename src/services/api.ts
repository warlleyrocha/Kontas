import axios, {
  AxiosError,
  type InternalAxiosRequestConfig,
  isAxiosError,
} from "axios";
import {
  getAuthorizationHeader,
  hydrateAuthorizationHeader,
} from "@/src/services/authHeader";
import { logger } from "@/src/shared/utils/logger";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

if (!API_URL) {
  throw new Error(
    "EXPO_PUBLIC_API_URL não definida no runtime. Verifique o build preview/production."
  );
}

if (!__DEV__ && !API_URL.startsWith("https://")) {
  throw new Error("EXPO_PUBLIC_API_URL deve usar HTTPS em produção.");
}

export const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

const AUTHORIZATION_HEADER_KEY = "Authorization";

type CircuitState = "CLOSED" | "OPEN" | "HALF_OPEN";

type RequestConfig = InternalAxiosRequestConfig & {
  _cbHalfOpen?: boolean;
};
const CIRCUIT_OPEN_CODE = "CIRCUIT_OPEN";

const circuitBreaker = {
  state: "CLOSED" as CircuitState,
  failureCount: 0,
  failureThreshold: 3,
  timeoutMs: 10_000,
  nextAttempt: 0,
  halfOpenInFlight: false,
};

const canProceed = (): { allowed: boolean; halfOpen: boolean } => {
  if (circuitBreaker.state === "OPEN") {
    if (Date.now() >= circuitBreaker.nextAttempt) {
      circuitBreaker.state = "HALF_OPEN";
    } else {
      return { allowed: false, halfOpen: false };
    }
  }

  if (circuitBreaker.state === "HALF_OPEN") {
    if (circuitBreaker.halfOpenInFlight) {
      return { allowed: false, halfOpen: false };
    }
    circuitBreaker.halfOpenInFlight = true;
    return { allowed: true, halfOpen: true };
  }

  return { allowed: true, halfOpen: false };
};

const onSuccess = (wasHalfOpen: boolean) => {
  if (wasHalfOpen) {
    circuitBreaker.state = "CLOSED";
    circuitBreaker.failureCount = 0;
    circuitBreaker.halfOpenInFlight = false;
    return;
  }

  if (circuitBreaker.state === "CLOSED") {
    circuitBreaker.failureCount = 0;
  }
};

const openCircuit = () => {
  circuitBreaker.state = "OPEN";
  circuitBreaker.nextAttempt = Date.now() + circuitBreaker.timeoutMs;
  circuitBreaker.halfOpenInFlight = false;
};

const onFailure = (wasHalfOpen: boolean) => {
  if (wasHalfOpen) {
    openCircuit();
    return;
  }

  if (circuitBreaker.state === "CLOSED") {
    circuitBreaker.failureCount += 1;
    if (circuitBreaker.failureCount >= circuitBreaker.failureThreshold) {
      openCircuit();
    }
  }
};

const shouldCountAsCircuitFailure = (error: AxiosError) => {
  if (error.code === "ERR_CANCELED") return false;
  if (!error.response) return true;

  const status = error.response.status;
  return status === 408 || status === 429 || status >= 500;
};

const logResponse = (status: number, url?: string, data?: unknown) => {
  if (Array.isArray(data)) {
    logger.table("API", `✅ ${status} ${url}`, data);
  } else {
    logger.info("API", `✅ ${status} ${url}`, data);
  }
};

const logError = (status: number | string, url?: string, data?: unknown) => {
  logger.warn("API", `❌ ${status} ${url}`, data);
};

const createCircuitOpenError = () => {
  const error = new Error(
    "Circuit Breaker aberto: aguardando tempo de reset."
  ) as Error & { code: string };
  error.name = "CircuitBreakerError";
  error.code = CIRCUIT_OPEN_CODE;
  return error;
};

api.interceptors.request.use(
  async (config) => {
    const typedConfig = config as RequestConfig;

    const { allowed, halfOpen } = canProceed();
    if (!allowed) {
      return Promise.reject(createCircuitOpenError());
    }

    typedConfig._cbHalfOpen = halfOpen;

    await hydrateAuthorizationHeader();

    const authorizationHeader = getAuthorizationHeader();
    if (authorizationHeader && config.headers) {
      config.headers[AUTHORIZATION_HEADER_KEY] = authorizationHeader;
    }

    logger.debug(
      "API",
      `➡️ ${String(config.method).toUpperCase()} ${config.url}`,
      config.data ?? config.params
    );

    return config;
  },

  (error) =>
    Promise.reject(error instanceof Error ? error : new Error(String(error)))
);

// Interceptor para visualizar respostas
api.interceptors.response.use(
  (response) => {
    logResponse(response.status, response.config.url, response.data);

    const config = response.config as RequestConfig;
    onSuccess(Boolean(config._cbHalfOpen));

    return response;
  },

  async (error) => {
    const knownError = error as Error & { code?: string };
    if (knownError.code === CIRCUIT_OPEN_CODE) {
      logger.warn("API", "⛔ Circuit breaker aberto: requisição bloqueada.");
      return Promise.reject(knownError);
    }

    if (!isAxiosError(error)) {
      return Promise.reject(
        error instanceof Error ? error : new Error(String(error))
      );
    }

    const axiosError = error;
    const config = axiosError.config as RequestConfig | undefined;
    const wasHalfOpen = Boolean(config?._cbHalfOpen);

    logError(
      axiosError.response?.status ?? "Network Error",
      config?.url,
      axiosError.response?.data
    );

    const shouldOpenByFailure = shouldCountAsCircuitFailure(axiosError);
    if (shouldOpenByFailure) {
      onFailure(wasHalfOpen);
    } else if (wasHalfOpen) {
      onSuccess(true);
    }

    return Promise.reject(
      error instanceof Error ? error : new Error(String(error))
    );
  }
);
