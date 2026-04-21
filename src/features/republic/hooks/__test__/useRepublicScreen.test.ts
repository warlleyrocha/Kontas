import { useIsFocused } from "@react-navigation/native";
import { act, renderHook } from "@testing-library/react-native";
import { useRouter } from "expo-router";

import { useLogoutMutation } from "@/src/features/auth/hooks/useAuthMutations";
import type { RepublicResponse } from "@/src/features/republic/types/republic.types";
import { useResidents } from "@/src/features/residents/hooks/useResidents";
import { useCurrentUserQuery } from "@/src/features/user/hooks/useUserQueries";
import { getErrorMessage } from "@/src/services/httpError";
import {
  type ResidentResponse,
  ResidentRole,
} from "@/src/shared/types/resident.types";
import { logger } from "@/src/shared/utils/logger";
import { showToast } from "@/src/shared/utils/showToast";
import { toastErrors } from "@/src/shared/utils/toastMessages";

import { useRepublicActions } from "../useRepublicActions";
import { useRepublicQuery, useRepublicsQuery } from "../useRepublicQueries";
import { useRepublicScreen } from "../useRepublicScreen";

jest.mock("@react-navigation/native", () => ({ useIsFocused: jest.fn() }));
jest.mock("expo-router", () => ({ useRouter: jest.fn() }));
jest.mock("@/src/features/auth/hooks/useAuthMutations", () => ({
  useLogoutMutation: jest.fn(),
}));
jest.mock("@/src/features/user/hooks/useUserQueries", () => ({
  useCurrentUserQuery: jest.fn(),
}));
jest.mock("../useRepublicActions", () => ({ useRepublicActions: jest.fn() }));
jest.mock("../useRepublicQueries", () => ({
  useRepublicQuery: jest.fn(),
  useRepublicsQuery: jest.fn(),
}));
jest.mock("@/src/features/residents/hooks/useResidents", () => ({
  useResidents: jest.fn(),
}));
jest.mock("@/src/services/httpError", () => ({ getErrorMessage: jest.fn() }));
jest.mock("@/src/shared/utils/logger", () => ({
  logger: { warn: jest.fn(), error: jest.fn() },
}));
jest.mock("@/src/shared/utils/showToast", () => ({
  showToast: { error: jest.fn(), success: jest.fn() },
}));
jest.mock("@/src/shared/utils/toastMessages", () => ({
  toastErrors: { logoutFailed: jest.fn() },
}));

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const mockRepublic: RepublicResponse = { id: "rep-1", nome: "Alpha" };

const mockResident: ResidentResponse = {
  id: "r-1",
  nome: "Ana",
  email: "ana@email.com",
  fotoPerfil: null,
  chavePix: null,
  telefone: null,
  role: ResidentRole.USER,
};

const mockRouter = { replace: jest.fn(), back: jest.fn() };
const mockLogout = jest.fn();
const mockFetchResidents = jest.fn();
const mockUpdateRepublic = jest.fn();
const mockSetShowEditModal = jest.fn();
const mockRefetchRepublic = jest.fn();
const mockRefetchRepublics = jest.fn();

function setupMocks(userOverrides = {}) {
  jest.mocked(useIsFocused).mockReturnValue(true);
  jest.mocked(useRouter).mockReturnValue(mockRouter as any);
  jest.mocked(useCurrentUserQuery).mockReturnValue({
    data: {
      id: "u-1",
      nome: "Ana",
      email: "ana@email.com",
      perfilCompleto: true,
      fotoPerfil: null,
      ...userOverrides,
    },
    logout: mockLogout,
  } as any);
  jest.mocked(useLogoutMutation).mockReturnValue({
    mutateAsync: mockLogout,
  } as any);
  jest.mocked(useRepublicsQuery).mockReturnValue({
    data: [mockRepublic],
    refetch: mockRefetchRepublics,
  } as any);
  jest.mocked(useRepublicQuery).mockReturnValue({
    data: mockRepublic,
    error: null,
    isLoading: false,
    isSuccess: true,
    refetch: mockRefetchRepublic,
  } as any);
  jest.mocked(useRepublicActions).mockReturnValue({
    updateRepublic: mockUpdateRepublic,
    showEditModal: false,
    setShowEditModal: mockSetShowEditModal,
  } as any);
  jest.mocked(useResidents).mockReturnValue({
    residents: [],
    fetchResidents: mockFetchResidents,
  } as any);
  jest
    .mocked(getErrorMessage)
    .mockImplementation((_err, fallback) => fallback ?? "erro");
}

// ─── Setup ────────────────────────────────────────────────────────────────────

beforeEach(() => {
  jest.clearAllMocks();
  setupMocks();
  mockRefetchRepublic.mockResolvedValue({ data: mockRepublic, error: null });
  mockRefetchRepublics.mockResolvedValue({ data: [mockRepublic], error: null });
});

// ─── loadRepublic effect ──────────────────────────────────────────────────────

describe("useRepublicScreen — loadRepublic", () => {
  it("carrega e define a república com sucesso", async () => {
    const { result } = renderHook(() => useRepublicScreen("rep-1"));
    await act(async () => {});

    expect(result.current.republic).toEqual(mockRepublic);
    expect(result.current.isLoading).toBe(false);
  });

  it("exibe toast e volta quando republicId está vazio", async () => {
    renderHook(() => useRepublicScreen(""));
    await act(async () => {});

    expect(jest.mocked(showToast.error)).toHaveBeenCalledWith(
      "ID da república não encontrado"
    );
    expect(mockRouter.back).toHaveBeenCalled();
  });

  it("exibe toast e volta quando a query retorna null com sucesso", async () => {
    jest.mocked(useRepublicQuery).mockReturnValue({
      data: null,
      error: null,
      isLoading: false,
      isSuccess: true,
      refetch: mockRefetchRepublic,
    } as any);
    renderHook(() => useRepublicScreen("rep-1"));
    await act(async () => {});

    expect(jest.mocked(showToast.error)).toHaveBeenCalledWith(
      "República não encontrada"
    );
    expect(mockRouter.back).toHaveBeenCalled();
  });

  it("loga warn, exibe toast e volta ao falhar", async () => {
    const error = new Error("network");
    jest.mocked(getErrorMessage).mockReturnValue("Erro ao carregar república");
    jest.mocked(useRepublicQuery).mockReturnValue({
      data: null,
      error,
      isLoading: false,
      isSuccess: false,
      refetch: mockRefetchRepublic,
    } as any);

    renderHook(() => useRepublicScreen("rep-1"));
    await act(async () => {});

    expect(jest.mocked(logger.warn)).toHaveBeenCalledWith(
      "Republic",
      "Não foi possível carregar república:",
      { republicId: "rep-1" }
    );
    expect(jest.mocked(showToast.error)).toHaveBeenCalledWith(
      "Erro ao carregar república"
    );
    expect(mockRouter.back).toHaveBeenCalled();
  });
});

// ─── loadResidents ────────────────────────────────────────────────────────────

describe("useRepublicScreen — loadResidents", () => {
  it("passa republicId para useResidents para habilitar a query automática", async () => {
    renderHook(() => useRepublicScreen("rep-1"));
    await act(async () => {});

    expect(jest.mocked(useResidents)).toHaveBeenCalledWith("rep-1");
  });
});

// ─── toggleFavorite ───────────────────────────────────────────────────────────

describe("useRepublicScreen — toggleFavorite", () => {
  it("alterna isFavorited e exibe toast ao favoritar", async () => {
    const { result } = renderHook(() => useRepublicScreen("rep-1"));
    await act(async () => {});

    act(() => {
      result.current.toggleFavorite();
    });

    expect(result.current.isFavorited).toBe(true);
    expect(jest.mocked(showToast.success)).toHaveBeenCalledWith(
      "República adicionada aos favoritos"
    );
  });

  it("exibe mensagem de remoção ao desfavoritar", async () => {
    const { result } = renderHook(() => useRepublicScreen("rep-1"));
    await act(async () => {});

    act(() => {
      result.current.toggleFavorite();
    });
    act(() => {
      result.current.toggleFavorite();
    });

    expect(result.current.isFavorited).toBe(false);
    expect(jest.mocked(showToast.success)).toHaveBeenLastCalledWith(
      "República removida dos favoritos"
    );
  });
});

// ─── handleSignOut ────────────────────────────────────────────────────────────

describe("useRepublicScreen — handleSignOut", () => {
  it("chama logout e redireciona para / em caso de sucesso", async () => {
    mockLogout.mockResolvedValue(undefined);
    const { result } = renderHook(() => useRepublicScreen("rep-1"));
    await act(async () => {});

    await act(async () => {
      await result.current.handleSignOut();
    });

    expect(mockLogout).toHaveBeenCalled();
    expect(mockRouter.replace).toHaveBeenCalledWith("/");
  });

  it("loga erro e chama toastErrors.logoutFailed ao falhar", async () => {
    const error = new Error("logout fail");
    mockLogout.mockRejectedValue(error);
    const { result } = renderHook(() => useRepublicScreen("rep-1"));
    await act(async () => {});

    await act(async () => {
      await result.current.handleSignOut();
    });

    expect(jest.mocked(logger.error)).toHaveBeenCalledWith(
      "Republic",
      "Erro ao fazer logout",
      error
    );
    expect(jest.mocked(toastErrors.logoutFailed)).toHaveBeenCalledWith(error);
  });
});

// ─── handleOpenMenu ───────────────────────────────────────────────────────────

describe("useRepublicScreen — handleOpenMenu", () => {
  it("abre o menu diretamente quando república já está na lista", async () => {
    const { result } = renderHook(() => useRepublicScreen("rep-1"));
    await act(async () => {});

    await act(async () => {
      await result.current.handleOpenMenu();
    });

    expect(mockRefetchRepublics).not.toHaveBeenCalled();
    expect(result.current.isMenuOpen).toBe(true);
  });

  it("chama refetch da lista antes de abrir o menu quando república não está na lista", async () => {
    jest.mocked(useRepublicsQuery).mockReturnValue({
      data: [],
      refetch: mockRefetchRepublics,
    } as any);
    mockRefetchRepublics.mockResolvedValue({ data: [], error: null });

    const { result } = renderHook(() => useRepublicScreen("rep-1"));
    await act(async () => {});

    await act(async () => {
      await result.current.handleOpenMenu();
    });

    expect(mockRefetchRepublics).toHaveBeenCalled();
    expect(result.current.isMenuOpen).toBe(true);
  });

  it("loga warn e ainda abre o menu quando o refetch da lista falha", async () => {
    jest.mocked(useRepublicsQuery).mockReturnValue({
      data: [],
      refetch: mockRefetchRepublics,
    } as any);
    mockRefetchRepublics.mockResolvedValue({
      data: [],
      error: new Error("fetch fail"),
    });

    const { result } = renderHook(() => useRepublicScreen("rep-1"));
    await act(async () => {});

    await act(async () => {
      await result.current.handleOpenMenu();
    });

    expect(jest.mocked(logger.warn)).toHaveBeenCalled();
    expect(result.current.isMenuOpen).toBe(true);
  });
});

// ─── handleSaveRepublic ───────────────────────────────────────────────────────

describe("useRepublicScreen — handleSaveRepublic", () => {
  it("retorna imediatamente quando republic é null", async () => {
    jest.mocked(useRepublicQuery).mockReturnValue({
      data: null,
      error: null,
      isLoading: false,
      isSuccess: true,
      refetch: mockRefetchRepublic,
    } as any);
    const { result } = renderHook(() => useRepublicScreen("rep-1"));
    await act(async () => {});

    await act(async () => {
      await result.current.handleSaveRepublic("Novo Nome");
    });

    expect(mockUpdateRepublic).not.toHaveBeenCalled();
  });

  it("chama updateRepublic com republic e payload correto", async () => {
    mockUpdateRepublic.mockResolvedValue(undefined);
    const { result } = renderHook(() => useRepublicScreen("rep-1"));
    await act(async () => {});

    await act(async () => {
      await result.current.handleSaveRepublic("Novo Nome", "img.jpg");
    });

    expect(mockUpdateRepublic).toHaveBeenCalledWith("rep-1", mockRepublic, {
      nome: "Novo Nome",
      imagemRepublica: "img.jpg",
    });
  });
});

// ─── currentResident / roleLabel ─────────────────────────────────────────────

describe("useRepublicScreen — currentResident e roleLabel", () => {
  it("encontra o morador atual pelo email do usuário", async () => {
    jest.mocked(useResidents).mockReturnValue({
      residents: [mockResident],
      fetchResidents: mockFetchResidents,
    } as any);

    const { result } = renderHook(() => useRepublicScreen("rep-1"));
    await act(async () => {});

    expect(result.current.currentUserRole).toBe(ResidentRole.USER);
    expect(result.current.currentResidentId).toBe("r-1");
  });

  it("define roleLabel='Admin' quando role é ADMIN", async () => {
    const adminResident: ResidentResponse = {
      ...mockResident,
      role: ResidentRole.ADMIN,
    };
    jest.mocked(useResidents).mockReturnValue({
      residents: [adminResident],
      fetchResidents: mockFetchResidents,
    } as any);

    const { result } = renderHook(() => useRepublicScreen("rep-1"));
    await act(async () => {});

    expect(result.current.userMenu.roleLabel).toBe("Admin");
  });

  it("define roleLabel='Morador' quando role é USER", async () => {
    jest.mocked(useResidents).mockReturnValue({
      residents: [mockResident],
      fetchResidents: mockFetchResidents,
    } as any);

    const { result } = renderHook(() => useRepublicScreen("rep-1"));
    await act(async () => {});

    expect(result.current.userMenu.roleLabel).toBe("Morador");
  });

  it("define roleLabel=null quando usuário não é morador", async () => {
    const { result } = renderHook(() => useRepublicScreen("rep-1"));
    await act(async () => {});

    expect(result.current.userMenu.roleLabel).toBeNull();
  });

  it("retorna currentResident nulo quando user.email é null", async () => {
    setupMocks({ email: null });
    jest.mocked(useResidents).mockReturnValue({
      residents: [mockResident],
      fetchResidents: mockFetchResidents,
    } as any);

    const { result } = renderHook(() => useRepublicScreen("rep-1"));
    await act(async () => {});

    expect(result.current.currentUserRole).toBeNull();
    expect(result.current.currentResidentId).toBeNull();
  });
});

// ─── userMenu ─────────────────────────────────────────────────────────────────

describe("useRepublicScreen — userMenu", () => {
  it("retorna os dados do usuário mapeados corretamente", async () => {
    const { result } = renderHook(() => useRepublicScreen("rep-1"));
    await act(async () => {});

    expect(result.current.userMenu).toMatchObject({
      name: "Ana",
      email: "ana@email.com",
    });
  });

  it("usa 'Usuário' como fallback quando user.nome é null", async () => {
    setupMocks({ nome: null });
    const { result } = renderHook(() => useRepublicScreen("rep-1"));
    await act(async () => {});

    expect(result.current.userMenu.name).toBe("Usuário");
  });
});
