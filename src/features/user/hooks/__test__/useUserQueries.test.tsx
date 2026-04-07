import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react-native";
import * as SecureStore from "expo-secure-store";
import React from "react";
import * as authHeader from "@/src/services/authHeader";
import * as httpError from "@/src/services/httpError";
import { logger } from "@/src/shared/utils/logger";
import { showToast } from "@/src/shared/utils/showToast";
import { userService } from "../../services/user.service";
import type { User } from "../../types/user.types";
import {
  useCompleteProfileMutation,
  useCurrentUserQuery,
  useUpdateCurrentUserMutation,
} from "../useUserQueries";

// ─── Mocks ────────────────────────────────────────────────────────────────────

jest.mock("expo-secure-store", () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

jest.mock("@/src/services/authHeader", () => ({
  hydrateAuthorizationHeader: jest.fn().mockResolvedValue(undefined),
  hasAuthorizationHeader: jest.fn().mockReturnValue(true),
  clearAuthorizationHeader: jest.fn(),
}));

jest.mock("@/src/services/httpError", () => ({
  isUnauthorizedError: jest.fn(),
  getErrorMessage: jest.fn(),
}));

jest.mock("@/src/shared/utils/logger", () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

jest.mock("@/src/shared/utils/showToast", () => ({
  showToast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

jest.mock("../../services/user.service", () => ({
  userService: {
    fetchUser: jest.fn(),
    completeProfile: jest.fn(),
    updateUser: jest.fn(),
  },
}));

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const mockUser = {
  id: "u-1",
  nome: "Ana",
  email: "ana@email.com",
  fotoPerfil: null,
  chavePix: undefined,
  telefone: undefined,
  perfilCompleto: true,
} satisfies User;

const mockGetItemAsync = jest.mocked(SecureStore.getItemAsync);
const mockSetItemAsync = jest.mocked(SecureStore.setItemAsync);
const mockDeleteItemAsync = jest.mocked(SecureStore.deleteItemAsync);
const mockHydrate = jest.mocked(authHeader.hydrateAuthorizationHeader);
const mockHasHeader = jest.mocked(authHeader.hasAuthorizationHeader);
const mockClearHeader = jest.mocked(authHeader.clearAuthorizationHeader);
const mockIsUnauthorized = jest.mocked(httpError.isUnauthorizedError);
const mockGetErrorMessage = jest.mocked(httpError.getErrorMessage);
const mockFetchUser = jest.mocked(userService.fetchUser);
const mockCompleteProfile = jest.mocked(userService.completeProfile);
const mockUpdateUser = jest.mocked(userService.updateUser);
const mockShowToastSuccess = jest.mocked(showToast.success);
const mockShowToastError = jest.mocked(showToast.error);
const mockLoggerWarn = jest.mocked(logger.warn);
const mockLoggerInfo = jest.mocked(logger.info);
const mockLoggerError = jest.mocked(logger.error);

// ─── Helpers ──────────────────────────────────────────────────────────────────

function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
}

function setupWrapper(queryClient: QueryClient) {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };
}

// ─── Setup ────────────────────────────────────────────────────────────────────

beforeEach(() => {
  jest.clearAllMocks();
  mockHydrate.mockResolvedValue(undefined);
  mockHasHeader.mockReturnValue(true);
  mockGetItemAsync.mockResolvedValue(null);
  mockDeleteItemAsync.mockResolvedValue();
  mockSetItemAsync.mockResolvedValue();
  mockFetchUser.mockResolvedValue(mockUser);
  mockCompleteProfile.mockResolvedValue(undefined);
  mockUpdateUser.mockResolvedValue(mockUser);
  mockIsUnauthorized.mockReturnValue(false);
  mockGetErrorMessage.mockImplementation(
    (_err, fallback) => fallback ?? "erro"
  );
  jest.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  jest.restoreAllMocks();
});

// ─── useCurrentUserQuery ──────────────────────────────────────────────────────

describe("useCurrentUserQuery", () => {
  it("retorna null quando não há token de autorização", async () => {
    mockHasHeader.mockReturnValue(false);
    const qc = createQueryClient();

    const { result } = renderHook(() => useCurrentUserQuery(), {
      wrapper: setupWrapper(qc),
    });

    await waitFor(() => expect(result.current.data).toBeNull());
    expect(mockLoggerWarn).toHaveBeenCalledWith(
      "User",
      "Nenhum token encontrado"
    );
  });

  it("retorna o usuário quando fetchUser resolve com sucesso", async () => {
    const qc = createQueryClient();

    const { result } = renderHook(() => useCurrentUserQuery(), {
      wrapper: setupWrapper(qc),
    });

    await waitFor(() => expect(result.current.data).toEqual(mockUser));
    expect(mockFetchUser).toHaveBeenCalledTimes(1);
    expect(mockSetItemAsync).toHaveBeenCalled();
    expect(mockLoggerInfo).toHaveBeenCalledWith(
      "User",
      "Usuário autenticado e sincronizado"
    );
  });

  it("limpa storage e retorna null em caso de erro 401", async () => {
    const unauthorizedError = new Error("Unauthorized");
    mockFetchUser.mockRejectedValue(unauthorizedError);
    mockIsUnauthorized.mockReturnValue(true);
    const qc = createQueryClient();

    const { result } = renderHook(() => useCurrentUserQuery(), {
      wrapper: setupWrapper(qc),
    });

    await waitFor(() => {
      expect(mockClearHeader).toHaveBeenCalled();
      expect(mockDeleteItemAsync).toHaveBeenCalledTimes(2);
      expect(mockLoggerWarn).toHaveBeenCalledWith(
        "User",
        "Token inválido ou expirado"
      );
    });

    expect(result.current.data ?? null).toBeNull();
  });

  it("não autentica a sessão com cache local em caso de erro transitório", async () => {
    const transientError = new Error("Network error");
    mockFetchUser.mockRejectedValue(transientError);
    mockIsUnauthorized.mockReturnValue(false);
    mockGetItemAsync.mockResolvedValue(JSON.stringify(mockUser));
    const qc = createQueryClient();

    const { result } = renderHook(() => useCurrentUserQuery(), {
      wrapper: setupWrapper(qc),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(mockLoggerWarn).toHaveBeenCalledWith(
      "User",
      "Falha transitória ao validar sessão",
      expect.objectContaining({ message: "Erro ao validar sessão" })
    );
    expect(result.current.data).toBeUndefined();
    expect(mockGetItemAsync).not.toHaveBeenCalled();
  });

  it("re-lança o erro transitório sem tentar ler cache local", async () => {
    const transientError = new Error("Network error");
    mockFetchUser.mockRejectedValue(transientError);
    mockIsUnauthorized.mockReturnValue(false);
    mockGetItemAsync.mockResolvedValue("not-valid-json{");
    const qc = createQueryClient();

    const { result } = renderHook(() => useCurrentUserQuery(), {
      wrapper: setupWrapper(qc),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(mockGetItemAsync).not.toHaveBeenCalled();
    expect(mockDeleteItemAsync).not.toHaveBeenCalledWith("app_user");
  });
});

// ─── useCompleteProfileMutation ───────────────────────────────────────────────

describe("useCompleteProfileMutation", () => {
  it("onSuccess: invalida queries, mostra toast e loga info", async () => {
    const qc = createQueryClient();

    const { result } = renderHook(() => useCompleteProfileMutation(), {
      wrapper: setupWrapper(qc),
    });

    await result.current.mutateAsync({
      nome: "Ana Completa",
      telefone: "+5511999999999",
      chavePix: "pix@email.com",
    });

    await waitFor(() => {
      expect(mockShowToastSuccess).toHaveBeenCalledWith(
        "Perfil salvo com sucesso!"
      );
    });
    expect(mockLoggerInfo).toHaveBeenCalledWith(
      "User",
      "Perfil completado e sincronizado"
    );
  });

  it("onError: mostra toast de erro e loga error", async () => {
    mockCompleteProfile.mockRejectedValue(new Error("Erro de rede"));
    const qc = createQueryClient();

    const { result } = renderHook(() => useCompleteProfileMutation(), {
      wrapper: setupWrapper(qc),
    });

    await result.current
      .mutateAsync({
        nome: "Ana",
        telefone: "+5511999999999",
        chavePix: "pix@email.com",
      })
      .catch(() => {});

    await waitFor(() => {
      expect(mockShowToastError).toHaveBeenCalledWith(
        "Erro ao completar perfil"
      );
    });
    expect(mockLoggerError).toHaveBeenCalledWith(
      "User",
      "Erro ao completar perfil",
      expect.any(Error)
    );
  });
});

// ─── useUpdateCurrentUserMutation ─────────────────────────────────────────────

describe("useUpdateCurrentUserMutation", () => {
  it("onSuccess: atualiza cache, persiste no SecureStore e mostra toast", async () => {
    const qc = createQueryClient();

    const { result } = renderHook(() => useUpdateCurrentUserMutation(), {
      wrapper: setupWrapper(qc),
    });

    await result.current.mutateAsync({ nome: "Ana Atualizada" });

    await waitFor(() => {
      expect(mockShowToastSuccess).toHaveBeenCalledWith(
        "Perfil atualizado com sucesso!"
      );
    });
    expect(mockSetItemAsync).toHaveBeenCalled();
    expect(mockLoggerInfo).toHaveBeenCalledWith(
      "User",
      "Usuário atualizado com sucesso"
    );
  });

  it("onError: mostra toast de erro e loga error", async () => {
    mockUpdateUser.mockRejectedValue(new Error("Erro de rede"));
    const qc = createQueryClient();

    const { result } = renderHook(() => useUpdateCurrentUserMutation(), {
      wrapper: setupWrapper(qc),
    });

    await result.current.mutateAsync({ nome: "Ana" }).catch(() => {});

    await waitFor(() => {
      expect(mockShowToastError).toHaveBeenCalledWith(
        "Erro ao atualizar o perfil"
      );
    });
    expect(mockLoggerError).toHaveBeenCalledWith(
      "User",
      "Erro ao atualizar perfil",
      expect.any(Error)
    );
  });
});
