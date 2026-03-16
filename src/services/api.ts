import AsyncStorage from "@react-native-async-storage/async-storage";
import axios, {
  AxiosError,
  isAxiosError,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from "axios";
import { getRandomBytesAsync } from "expo-crypto";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

if (!API_URL) {
  throw new Error(
    "EXPO_PUBLIC_API_URL não definida no runtime. Verifique o build preview/production."
  );
}

export const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

type CircuitState = "CLOSED" | "OPEN" | "HALF_OPEN";

type RetryConfig = {
  retries: number;
  baseDelayMs: number;
  maxDelayMs: number;
  retryOnStatuses: number[];
};

type RequestConfig = InternalAxiosRequestConfig & {
  _retryCount?: number;
  _cbHalfOpen?: boolean;
};

const RETRY_CONFIG: RetryConfig = {
  retries: 3,
  baseDelayMs: 300,
  maxDelayMs: 3000,
  retryOnStatuses: [408, 429, 500, 502, 503, 504],
};

const SAFE_RETRY_METHODS = new Set(["get", "head", "options"]);
const CIRCUIT_OPEN_CODE = "CIRCUIT_OPEN";

const circuitBreaker = {
  state: "CLOSED" as CircuitState,
  failureCount: 0,
  failureThreshold: 3,
  timeoutMs: 10_000,
  nextAttempt: 0,
  halfOpenInFlight: false,
};

const SHOULD_LOG_HTTP = process.env.NODE_ENV !== "production";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

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

const getRetryDelay = async (retryCount: number) => {
  const baseDelay = RETRY_CONFIG.baseDelayMs * 2 ** (retryCount - 1);
  const randomBytes = await getRandomBytesAsync(1);
  const jitter = randomBytes[0] % 100; // 0–99
  return Math.min(baseDelay + jitter, RETRY_CONFIG.maxDelayMs);
};
const isIdempotencyKeyPresent = (headers: AxiosRequestConfig["headers"]) => {
  if (!headers) return false;
  const normalized = headers as Record<string, unknown>;
  return Object.keys(normalized).some(
    (key) => key.toLowerCase() === "idempotency-key"
  );
};

const canRetryMethod = (config?: RequestConfig) => {
  const method = config?.method?.toLowerCase();
  if (!method) return true;
  if (SAFE_RETRY_METHODS.has(method)) return true;
  return isIdempotencyKeyPresent(config?.headers);
};

const shouldRetry = (error: AxiosError, config?: RequestConfig) => {
  if (!config) return false;
  if (config._cbHalfOpen) return false;
  if (error.code === "ERR_CANCELED") return false;
  if (!canRetryMethod(config)) return false;

  const retryCount = config._retryCount ?? 0;
  if (retryCount >= RETRY_CONFIG.retries) return false;

  if (!error.response) return true;
  return RETRY_CONFIG.retryOnStatuses.includes(error.response.status);
};

const shouldCountAsCircuitFailure = (error: AxiosError) => {
  if (error.code === "ERR_CANCELED") return false;
  if (!error.response) return true;

  const status = error.response.status;
  return status === 408 || status === 429 || status >= 500;
};

const logResponse = (status: number, url?: string, data?: unknown) => {
  if (!SHOULD_LOG_HTTP) return;
  console.log(`\n✅ ${status} ${url}`);
  if (data !== undefined) {
    console.log(JSON.stringify(data, null, 2));
  }
};

const logError = (status: number | string, url?: string, data?: unknown) => {
  if (!SHOULD_LOG_HTTP) return;
  console.log(`\n❌ ${status} ${url}`);
  if (data !== undefined) {
    console.log(JSON.stringify(data, null, 2));
  }
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

    const token = await AsyncStorage.getItem("@app:token");
    if (token) {
      if (config.headers) {
        config.headers["Authorization"] = `Bearer ${token}`;
      }
    }
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
      if (SHOULD_LOG_HTTP) {
        console.log("\n⛔ Circuit breaker aberto: requisição bloqueada.");
      }
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

    const retryable = shouldRetry(axiosError, config);
    if (retryable && config) {
      const nextRetry = (config._retryCount ?? 0) + 1;
      config._retryCount = nextRetry;
      config._cbHalfOpen = false;
      await sleep(await getRetryDelay(nextRetry));
      return api.request(config);
    }

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
