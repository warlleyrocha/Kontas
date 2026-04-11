import { useIsFocused } from "@react-navigation/native";
import { act, renderHook } from "@testing-library/react-native";
import { useRouter } from "expo-router";

import { useLogoutMutation } from "@/src/features/auth/hooks/useAuthMutations";
import {
  usePendingInvitesCount,
  useSendInviteMutation,
} from "@/src/features/invites/hooks/useInvitesQueries";
import { useRepublicActions } from "@/src/features/republic/hooks/useRepublicActions";
import { useRepublicsQuery } from "@/src/features/republic/hooks/useRepublicQueries";
import type { RepublicResponse } from "@/src/features/republic/types/republic.types";
import {
  useCompleteProfileMutation,
  useCurrentUserQuery,
  useUpdateCurrentUserMutation,
  useUploadProfilePhotoMutation,
} from "@/src/features/user/hooks/useUserQueries";
import { getErrorMessage } from "@/src/services/httpError";
import { useSideMenu } from "@/src/shared/components/SideMenu/useSideMenu";
import { useRepublicResidents } from "@/src/shared/hooks/useRepublicResidents";
import { logger } from "@/src/shared/utils/logger";
import { showToast } from "@/src/shared/utils/showToast";
import { toastErrors } from "@/src/shared/utils/toastMessages";

import { useProfileScreen } from "../useProfileScreen";

jest.mock("@react-navigation/native", () => ({ useIsFocused: jest.fn() }));
jest.mock("expo-router", () => ({ useRouter: jest.fn() }));
jest.mock("@/src/features/auth/hooks/useAuthMutations", () => ({
  useLogoutMutation: jest.fn(),
}));
jest.mock("@/src/features/user/hooks/useUserQueries", () => ({
  useCompleteProfileMutation: jest.fn(),
  useCurrentUserQuery: jest.fn(),
  useUpdateCurrentUserMutation: jest.fn(),
  useUploadProfilePhotoMutation: jest.fn(),
}));
jest.mock("@/src/features/invites/hooks/useInvitesQueries", () => ({
  usePendingInvitesCount: jest.fn(),
  useSendInviteMutation: jest.fn(),
}));
jest.mock("@/src/features/republic/hooks/useRepublicActions", () => ({
  useRepublicActions: jest.fn(),
}));
jest.mock("@/src/features/republic/hooks/useRepublicQueries", () => ({
  useRepublicsQuery: jest.fn(),
}));
jest.mock("@/src/shared/components/SideMenu/useSideMenu", () => ({
  useSideMenu: jest.fn(),
}));
jest.mock("@/src/shared/hooks/useRepublicResidents", () => ({
  useRepublicResidents: jest.fn(),
}));
jest.mock("@/src/shared/utils/inputMasks", () => ({
  maskPhone: jest.fn((v: string) => v),
}));
jest.mock("@/src/shared/utils/logger", () => ({
  logger: { error: jest.fn() },
}));
jest.mock("@/src/shared/utils/showToast", () => ({
  showToast: {
    success: jest.fn(),
    error: jest.fn(),
    confirm: jest.fn(),
  },
}));
jest.mock("@/src/shared/utils/toastMessages", () => ({
  toastErrors: { logoutFailed: jest.fn(), profileUpdateFailed: jest.fn() },
}));
jest.mock("@/src/services/httpError", () => ({
  getErrorMessage: jest.fn(),
}));

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const mockRepublic: RepublicResponse = { id: "rep-1", nome: "Alpha" };

const mockRouter = { replace: jest.fn(), push: jest.fn() };
const mockLogout = jest.fn();
const mockCompleteProfile = jest.fn();
const mockUpdateUser = jest.fn();
const mockUploadProfilePhoto = jest.fn();
const mockFetchRepublics = jest.fn();
const mockDeleteRepublic = jest.fn();
const mockUpdateRepublic = jest.fn();
const mockSetShowEditModal = jest.fn();
const mockSendInvite = jest.fn();

function setupMocks(userOverrides = {}) {
  jest.mocked(useIsFocused).mockReturnValue(true);
  jest.mocked(useRouter).mockReturnValue(mockRouter as any);
  jest.mocked(useCurrentUserQuery).mockReturnValue({
    data: {
      id: "u-1",
      nome: "Ana",
      email: "ana@email.com",
      perfilCompleto: true,
      chavePix: "ana@pix",
      telefone: "11999",
      fotoPerfil: null,
      ...userOverrides,
    },
  } as any);
  jest.mocked(useLogoutMutation).mockReturnValue({
    mutateAsync: mockLogout,
  } as any);
  jest.mocked(useCompleteProfileMutation).mockReturnValue({
    mutateAsync: mockCompleteProfile,
  } as any);
  jest.mocked(useUpdateCurrentUserMutation).mockReturnValue({
    mutateAsync: mockUpdateUser,
  } as any);
  jest.mocked(useUploadProfilePhotoMutation).mockReturnValue({
    mutateAsync: mockUploadProfilePhoto,
  } as any);
  jest.mocked(useRepublicsQuery).mockReturnValue({
    data: [mockRepublic],
    error: null,
    refetch: mockFetchRepublics,
  } as any);
  jest.mocked(useRepublicActions).mockReturnValue({
    deleteRepublic: mockDeleteRepublic,
    updateRepublic: mockUpdateRepublic,
    showEditModal: false,
    setShowEditModal: mockSetShowEditModal,
  } as any);
  jest.mocked(useRepublicResidents).mockReturnValue({
    getResidentsCount: jest.fn().mockReturnValue(0),
    isAdmin: jest.fn().mockReturnValue(false),
  } as any);
  jest.mocked(usePendingInvitesCount).mockReturnValue(0);
  jest.mocked(useSendInviteMutation).mockReturnValue({
    mutateAsync: mockSendInvite,
    isPending: false,
    error: null,
  } as any);
  jest.mocked(useSideMenu).mockReturnValue({
    menuItems: [],
    footerItems: [],
  } as any);
  jest
    .mocked(getErrorMessage)
    .mockImplementation((_err, fallback) => fallback ?? "erro");
}

// ─── Setup ────────────────────────────────────────────────────────────────────

beforeEach(() => {
  jest.clearAllMocks();
  setupMocks();
  mockUploadProfilePhoto.mockResolvedValue({
    id: "u-1",
    nome: "Ana",
    email: "ana@email.com",
    fotoPerfil: "https://example.com/nova-foto.jpg",
  });
});

// ─── estado inicial ───────────────────────────────────────────────────────────

describe("useProfileScreen — estado inicial", () => {
  it("retorna as propriedades esperadas", () => {
    const { result } = renderHook(() => useProfileScreen());

    expect(result.current.user).toBeDefined();
    expect(result.current.republics).toEqual([mockRepublic]);
    expect(result.current.isMenuOpen).toBe(false);
    expect(result.current.showEditProfileModal).toBe(false);
    expect(result.current.contextMenuVisible).toBe(false);
    expect(result.current.contextMenuPosition).toBeNull();
    expect(result.current.selectedRepublic).toBeNull();
    expect(result.current.showInviteModal).toBe(false);
  });
});

// ─── handleSignOut (passado ao useSideMenu, não retornado pelo hook) ──────────

function getHandleSignOut(): () => Promise<void> {
  return (
    jest.mocked(useSideMenu).mock.calls[0] as unknown[]
  )[1] as () => Promise<void>;
}

describe("useProfileScreen — handleSignOut", () => {
  it("chama logout e não dispara toast de erro em caso de sucesso", async () => {
    mockLogout.mockResolvedValue(undefined);
    renderHook(() => useProfileScreen());
    const handleSignOut = getHandleSignOut();

    await act(async () => {
      await handleSignOut();
    });

    expect(mockLogout).toHaveBeenCalled();
    expect(jest.mocked(toastErrors.logoutFailed)).not.toHaveBeenCalled();
  });

  it("loga erro e chama toastErrors.logoutFailed ao falhar", async () => {
    const error = new Error("logout fail");
    mockLogout.mockRejectedValue(error);
    renderHook(() => useProfileScreen());
    const handleSignOut = getHandleSignOut();

    await act(async () => {
      await handleSignOut();
    });

    expect(jest.mocked(logger.error)).toHaveBeenCalledWith(
      "User",
      "Erro ao fazer logout",
      error
    );
    expect(jest.mocked(toastErrors.logoutFailed)).toHaveBeenCalledWith(error);
  });

  it("loga undefined quando o erro não é instância de Error", async () => {
    mockLogout.mockRejectedValue("string error");
    renderHook(() => useProfileScreen());
    const handleSignOut = getHandleSignOut();

    await act(async () => {
      await handleSignOut();
    });

    expect(jest.mocked(logger.error)).toHaveBeenCalledWith(
      "User",
      "Erro ao fazer logout",
      undefined
    );
  });
});

// ─── handleSaveProfile ────────────────────────────────────────────────────────

describe("useProfileScreen — handleSaveProfile", () => {
  it("retorna imediatamente quando user é null", async () => {
    jest.mocked(useCurrentUserQuery).mockReturnValue({ data: null } as any);
    const { result } = renderHook(() => useProfileScreen());

    await act(async () => {
      await result.current.handleSaveProfile("Ana");
    });

    expect(mockCompleteProfile).not.toHaveBeenCalled();
    expect(mockUpdateUser).not.toHaveBeenCalled();
  });

  it("exibe toast de erro quando perfil incompleto e phone ou pixKey ausentes", async () => {
    jest.mocked(useCurrentUserQuery).mockReturnValue({
      data: {
        id: "u-1",
        nome: "Ana",
        email: "ana@email.com",
        perfilCompleto: false,
      },
    } as any);
    const { result } = renderHook(() => useProfileScreen());

    await act(async () => {
      await result.current.handleSaveProfile("Ana");
    });

    expect(jest.mocked(showToast.error)).toHaveBeenCalledWith(
      "Por favor, preencha o telefone e a chave Pix."
    );
    expect(mockCompleteProfile).not.toHaveBeenCalled();
  });

  it("chama completeProfile quando perfil incompleto e campos preenchidos", async () => {
    mockCompleteProfile.mockResolvedValue(undefined);
    jest.mocked(useCurrentUserQuery).mockReturnValue({
      data: {
        id: "u-1",
        nome: "Ana",
        email: "ana@email.com",
        perfilCompleto: false,
      },
    } as any);
    const { result } = renderHook(() => useProfileScreen());

    await act(async () => {
      await result.current.handleSaveProfile(
        "Ana",
        "ana@pix",
        undefined,
        "11999"
      );
    });

    expect(mockCompleteProfile).toHaveBeenCalledWith({
      nome: "Ana",
      telefone: "11999",
      chavePix: "ana@pix",
      fotoPerfil: undefined,
    });
  });

  it("faz upload de foto quando URI é local (file://) e perfil incompleto", async () => {
    mockCompleteProfile.mockResolvedValue(undefined);
    mockUploadProfilePhoto.mockResolvedValue({
      id: "u-1",
      nome: "Ana",
      fotoPerfil: "https://example.com/nova-foto.jpg",
    });
    jest.mocked(useCurrentUserQuery).mockReturnValue({
      data: {
        id: "u-1",
        nome: "Ana",
        email: "ana@email.com",
        perfilCompleto: false,
      },
    } as any);
    const { result } = renderHook(() => useProfileScreen());

    await act(async () => {
      await result.current.handleSaveProfile(
        "Ana",
        "ana@pix",
        "file:///photo.jpg",
        "11999"
      );
    });

    expect(mockUploadProfilePhoto).toHaveBeenCalledWith("file:///photo.jpg");
    expect(mockCompleteProfile).toHaveBeenCalledWith({
      nome: "Ana",
      telefone: "11999",
      chavePix: "ana@pix",
      fotoPerfil: "https://example.com/nova-foto.jpg",
    });
  });

  it("usa URL da foto diretamente quando não é URI local e perfil incompleto", async () => {
    mockCompleteProfile.mockResolvedValue(undefined);
    jest.mocked(useCurrentUserQuery).mockReturnValue({
      data: {
        id: "u-1",
        nome: "Ana",
        email: "ana@email.com",
        perfilCompleto: false,
      },
    } as any);
    const { result } = renderHook(() => useProfileScreen());

    await act(async () => {
      await result.current.handleSaveProfile(
        "Ana",
        "ana@pix",
        "https://example.com/existing.jpg",
        "11999"
      );
    });

    expect(mockUploadProfilePhoto).not.toHaveBeenCalled();
    expect(mockCompleteProfile).toHaveBeenCalledWith({
      nome: "Ana",
      telefone: "11999",
      chavePix: "ana@pix",
      fotoPerfil: "https://example.com/existing.jpg",
    });
  });

  it("chama updateUser quando perfil já está completo", async () => {
    mockUpdateUser.mockResolvedValue(undefined);
    setupMocks({
      nome: "João",
      telefone: "11888888888",
      chavePix: "joao@pix.com",
    });
    const { result } = renderHook(() => useProfileScreen());

    await act(async () => {
      await result.current.handleSaveProfile(
        "Ana",
        "ana@pix",
        undefined,
        "11999"
      );
    });

    expect(mockUpdateUser).toHaveBeenCalledWith({
      nome: "Ana",
      telefone: "11999",
      chavePix: "ana@pix",
    });
  });

  it("retorna imediatamente quando perfil completo e nada mudou", async () => {
    setupMocks({
      nome: "Ana",
      telefone: "11999",
      chavePix: "ana@pix",
    });
    const { result } = renderHook(() => useProfileScreen());

    await act(async () => {
      await result.current.handleSaveProfile(
        "Ana",
        "ana@pix",
        undefined,
        "11999"
      );
    });

    expect(mockUpdateUser).not.toHaveBeenCalled();
    expect(result.current.showEditProfileModal).toBe(false);
  });

  it("loga erro e exibe toast ao falhar", async () => {
    const error = new Error("save fail");
    mockUpdateUser.mockRejectedValue(error);
    jest
      .mocked(getErrorMessage)
      .mockImplementationOnce(() => "Erro personalizado ao salvar");
    setupMocks({
      nome: "João",
      telefone: "11888888888",
      chavePix: "joao@pix.com",
    });
    const { result } = renderHook(() => useProfileScreen());

    await act(async () => {
      await result.current.handleSaveProfile(
        "Ana",
        "ana@pix",
        undefined,
        "11999"
      );
    });

    expect(jest.mocked(logger.error)).toHaveBeenCalledWith(
      "User",
      "Erro ao salvar perfil",
      error
    );
    expect(jest.mocked(showToast.error)).toHaveBeenCalledWith(
      "Erro personalizado ao salvar"
    );
  });

  it("faz upload de foto quando URI é local e perfil completo", async () => {
    mockUpdateUser.mockResolvedValue(undefined);
    mockUploadProfilePhoto.mockResolvedValue({
      id: "u-1",
      nome: "Ana",
      fotoPerfil: "https://example.com/nova-foto.jpg",
    });
    setupMocks({
      nome: "João",
      telefone: "11888888888",
      chavePix: "joao@pix.com",
    });
    const { result } = renderHook(() => useProfileScreen());

    await act(async () => {
      await result.current.handleSaveProfile(
        "Ana",
        "ana@pix",
        "file:///photo.jpg",
        "11999"
      );
    });

    expect(mockUploadProfilePhoto).toHaveBeenCalledWith("file:///photo.jpg");
    expect(mockUpdateUser).toHaveBeenCalledWith({
      nome: "Ana",
      telefone: "11999",
      chavePix: "ana@pix",
      fotoPerfil: "https://example.com/nova-foto.jpg",
    });
  });
});

// ─── navegação ────────────────────────────────────────────────────────────────

describe("useProfileScreen — navegação", () => {
  it("handleCreateRepublic navega para /register/republic", () => {
    const { result } = renderHook(() => useProfileScreen());
    act(() => {
      result.current.handleCreateRepublic();
    });
    expect(mockRouter.push).toHaveBeenCalledWith("/register/republic");
  });

  it("handleViewInvites navega para /(userProfile)/invites", () => {
    const { result } = renderHook(() => useProfileScreen());
    act(() => {
      result.current.handleViewInvites();
    });
    expect(mockRouter.push).toHaveBeenCalledWith("/(userProfile)/invites");
  });

  it("handleSelectRepublic navega para /(republics)/:id", () => {
    const { result } = renderHook(() => useProfileScreen());
    act(() => {
      result.current.handleSelectRepublic("rep-1");
    });
    expect(mockRouter.push).toHaveBeenCalledWith("/(republics)/rep-1");
  });
});

// ─── context menu ─────────────────────────────────────────────────────────────

describe("useProfileScreen — context menu", () => {
  it("handleLongPressRepublic define selectedRepublic, position e abre o menu", () => {
    const position = { x: 10, y: 20, width: 100, height: 50 };
    const { result } = renderHook(() => useProfileScreen());

    act(() => {
      result.current.handleLongPressRepublic(mockRepublic, position);
    });

    expect(result.current.selectedRepublic).toEqual(mockRepublic);
    expect(result.current.contextMenuPosition).toEqual(position);
    expect(result.current.contextMenuVisible).toBe(true);
  });

  it("handleCloseContextMenu fecha o menu", () => {
    const { result } = renderHook(() => useProfileScreen());
    act(() => {
      result.current.handleLongPressRepublic(mockRepublic, {
        x: 0,
        y: 0,
        width: 0,
        height: 0,
      });
    });
    act(() => {
      result.current.handleCloseContextMenu();
    });
    expect(result.current.contextMenuVisible).toBe(false);
  });

  it("handleOpenEditFromMenu fecha o menu e abre o modal de edição", () => {
    const { result } = renderHook(() => useProfileScreen());
    act(() => {
      result.current.handleOpenEditFromMenu();
    });
    expect(result.current.contextMenuVisible).toBe(false);
    expect(mockSetShowEditModal).toHaveBeenCalledWith(true);
  });

  it("handleCloseEditModal fecha o modal e limpa selectedRepublic", () => {
    const { result } = renderHook(() => useProfileScreen());
    act(() => {
      result.current.handleLongPressRepublic(mockRepublic, {
        x: 0,
        y: 0,
        width: 0,
        height: 0,
      });
    });
    act(() => {
      result.current.handleCloseEditModal();
    });
    expect(mockSetShowEditModal).toHaveBeenCalledWith(false);
    expect(result.current.selectedRepublic).toBeNull();
  });

  it("handleInviteFromMenu fecha o menu e abre o modal de convite", () => {
    const { result } = renderHook(() => useProfileScreen());
    act(() => {
      result.current.handleInviteFromMenu();
    });
    expect(result.current.contextMenuVisible).toBe(false);
    expect(result.current.showInviteModal).toBe(true);
  });

  it("handleCloseInviteModal fecha o modal de convite", () => {
    const { result } = renderHook(() => useProfileScreen());
    act(() => {
      result.current.handleInviteFromMenu();
    });
    act(() => {
      result.current.handleCloseInviteModal();
    });
    expect(result.current.showInviteModal).toBe(false);
  });
});

// ─── handleSaveRepublicEdit ───────────────────────────────────────────────────

describe("useProfileScreen — handleSaveRepublicEdit", () => {
  it("retorna imediatamente quando selectedRepublic é null", async () => {
    const { result } = renderHook(() => useProfileScreen());

    await act(async () => {
      await result.current.handleSaveRepublicEdit("Nome");
    });

    expect(mockUpdateRepublic).not.toHaveBeenCalled();
  });

  it("chama updateRepublic com selectedRepublic e fecha o modal", async () => {
    mockUpdateRepublic.mockResolvedValue(undefined);
    const { result } = renderHook(() => useProfileScreen());

    act(() => {
      result.current.handleLongPressRepublic(mockRepublic, {
        x: 0,
        y: 0,
        width: 0,
        height: 0,
      });
    });

    await act(async () => {
      await result.current.handleSaveRepublicEdit("Novo Nome", "img.jpg");
    });

    expect(mockUpdateRepublic).toHaveBeenCalledWith("rep-1", mockRepublic, {
      nome: "Novo Nome",
      imagemRepublica: "img.jpg",
    });
  });
});

// ─── handleDeleteFromMenu ─────────────────────────────────────────────────────

describe("useProfileScreen — handleDeleteFromMenu", () => {
  it("retorna imediatamente quando selectedRepublic é null", () => {
    const { result } = renderHook(() => useProfileScreen());
    act(() => {
      result.current.handleDeleteFromMenu();
    });
    expect(jest.mocked(showToast.confirm)).not.toHaveBeenCalled();
  });

  it("exibe confirmação com o nome da república quando selectedRepublic está definida", () => {
    const { result } = renderHook(() => useProfileScreen());

    act(() => {
      result.current.handleLongPressRepublic(mockRepublic, {
        x: 0,
        y: 0,
        width: 0,
        height: 0,
      });
    });
    act(() => {
      result.current.handleDeleteFromMenu();
    });

    expect(jest.mocked(showToast.confirm)).toHaveBeenCalledWith(
      'Excluir "Alpha"?',
      expect.any(Function)
    );
  });

  it("chama deleteRepublic ao confirmar exclusão", async () => {
    mockDeleteRepublic.mockResolvedValue(undefined);
    jest.mocked(showToast.confirm).mockImplementation((_msg, cb) => cb());

    const { result } = renderHook(() => useProfileScreen());

    act(() => {
      result.current.handleLongPressRepublic(mockRepublic, {
        x: 0,
        y: 0,
        width: 0,
        height: 0,
      });
    });
    await act(async () => {
      result.current.handleDeleteFromMenu();
    });

    expect(mockDeleteRepublic).toHaveBeenCalledWith("rep-1");
    await act(async () => {});
    expect(mockFetchRepublics).not.toHaveBeenCalled();
  });
});

// ─── efeitos ──────────────────────────────────────────────────────────────────

describe("useProfileScreen — efeitos", () => {
  it("não força refetch inicial quando perfilCompleto é true", () => {
    renderHook(() => useProfileScreen());
    expect(mockFetchRepublics).not.toHaveBeenCalled();
  });

  it("configura a query com enabled=false quando perfilCompleto é false", () => {
    jest.mocked(useCurrentUserQuery).mockReturnValue({
      data: {
        id: "u-1",
        nome: "Ana",
        email: "ana@email.com",
        perfilCompleto: false,
      },
    } as any);

    renderHook(() => useProfileScreen());

    expect(jest.mocked(useRepublicsQuery)).toHaveBeenCalledWith({
      enabled: false,
    });
  });

  it("onRefresh chama refetchRepublics e controla o estado refreshing", async () => {
    let resolve!: (v: unknown) => void;
    mockFetchRepublics.mockReturnValue(
      new Promise((r) => {
        resolve = r;
      })
    );

    const { result } = renderHook(() => useProfileScreen());

    act(() => {
      void result.current.onRefresh();
    });
    expect(result.current.refreshing).toBe(true);

    await act(async () => {
      resolve({});
    });
    expect(result.current.refreshing).toBe(false);
    expect(mockFetchRepublics).toHaveBeenCalled();
  });
});

// ─── sideMenuUser ─────────────────────────────────────────────────────────────

describe("useProfileScreen — sideMenuUser", () => {
  it("retorna null quando user é null", () => {
    jest.mocked(useCurrentUserQuery).mockReturnValue({ data: null } as any);

    const { result } = renderHook(() => useProfileScreen());
    expect(result.current.sideMenuUser).toBeNull();
  });

  it("retorna os dados mapeados do usuário", () => {
    const { result } = renderHook(() => useProfileScreen());

    expect(result.current.sideMenuUser).toMatchObject({
      name: "Ana",
      email: "ana@email.com",
    });
  });

  it("usa string vazia quando user.nome é null", () => {
    setupMocks({ nome: null });

    const { result } = renderHook(() => useProfileScreen());

    expect(result.current.sideMenuUser).toMatchObject({
      name: "",
      email: "ana@email.com",
    });
  });
});
