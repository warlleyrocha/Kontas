import { AxiosError, isAxiosError } from "axios";

type StatusMessageMap = Partial<Record<number, string>>;

type UserFriendlyErrorOptions = {
  defaultMessage: string;
  statusMessages?: StatusMessageMap;
  networkMessage?: string;
  timeoutMessage?: string;
};

export class AppError extends Error {
  status?: number;
  code?: string;
  originalError?: unknown;

  constructor(message: string, options?: { status?: number; code?: string; originalError?: unknown }) {
    super(message);
    this.name = "AppError";
    this.status = options?.status;
    this.code = options?.code;
    this.originalError = options?.originalError;
  }
}

export const toUserFriendlyError = (
  error: unknown,
  options: UserFriendlyErrorOptions
): AppError => {
  if (!isAxiosError(error)) {
    if (error instanceof AppError) return error;
    if (error instanceof Error) return new AppError(error.message, { originalError: error });
    return new AppError(options.defaultMessage, { originalError: error });
  }

  const axiosError = error as AxiosError;
  const status = axiosError.response?.status;
  const code = axiosError.code;

  const messageByStatus = status ? options.statusMessages?.[status] : undefined;
  if (messageByStatus) {
    return new AppError(messageByStatus, { status, code, originalError: error });
  }

  const isTimeout = code === "ECONNABORTED";
  if (isTimeout) {
    return new AppError(
      options.timeoutMessage ?? "Tempo de resposta excedido. Tente novamente.",
      { status, code, originalError: error }
    );
  }

  const hasNoResponse = !axiosError.response;
  if (hasNoResponse) {
    return new AppError(
      options.networkMessage ?? "Falha de conexão. Verifique sua internet.",
      { status, code, originalError: error }
    );
  }

  return new AppError(options.defaultMessage, { status, code, originalError: error });
};

export const isUnauthorizedError = (error: unknown): boolean => {
  if (error instanceof AppError) return error.status === 401;
  if (isAxiosError(error)) return error.response?.status === 401;
  return false;
};

export const getErrorMessage = (
  error: unknown,
  fallback = "Ocorreu um erro. Tente novamente."
): string => {
  if (error instanceof AppError) return error.message;
  if (error instanceof Error) return error.message;
  return fallback;
};
