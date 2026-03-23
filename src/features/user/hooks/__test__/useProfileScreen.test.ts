import { act, renderHook } from "@testing-library/react-native";
import { useIsFocused } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { Alert } from "react-native";
import { useAuth } from "@/src/features/auth/contexts";
import { useInvitesContext } from "@/src/features/invites/contexts/InvitesContext";
import { useRepublicActions } from "@/src/features/republic/hooks/useRepublicActions";
import { useRepublicList } from "@/src/features/republic/hooks/useRepublicList";
import type { RepublicResponse } from "@/src/features/republic/types/republic.types";
import { useSideMenu } from "@/src/shared/components/SideMenu/useSideMenu";
import { useRefresh } from "@/src/shared/contexts/RefreshContext";
import { useRepublicResidents } from "@/src/shared/hooks/useRepublicResidents";
import { logger } from "@/src/shared/utils/logger";
import { showToast } from "@/src/shared/utils/showToast";
import { toastErrors } from "@/src/shared/utils/toastMessages";
import { useProfileScreen } from "../useProfileScreen";

jest.mock("@react-navigation/native", () => ({ useIsFocused: jest.fn() }));
jest.mock("expo-router", () => ({ useRouter: jest.fn() }));
jest.mock("@/src/features/auth/contexts", () => ({ useAuth: jest.fn() }));
jest.mock("@/src/features/invites/contexts/InvitesContext", () => ({
  useInvitesContext: jest.fn(),
}));
jest.mock("@/src/features/republic/hooks/useRepublicActions", () => ({
  useRepublicActions: jest.fn(),
}));
jest.mock("@/src/features/republic/hooks/useRepublicList", () => ({
  useRepublicList: jest.fn(),
}));
jest.mock("@/src/shared/components/SideMenu/useSideMenu", () => ({
  useSideMenu: jest.fn(),
}));
jest.mock("@/src/shared/contexts/RefreshContext", () => ({
  useRefresh: jest.fn(),
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
  showToast: { success: jest.fn(), confirm: jest.fn() },
}));
jest.mock("@/src/shared/utils/toastMessages", () => ({
  toastErrors: { logoutFailed: jest.fn(), profileUpdateFailed: jest.fn() },
}));

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const mockRepublic: RepublicResponse = { id: "rep-1", nome: "Alpha" };

const mockRouter = { replace: jest.fn(), push: jest.fn() };
const mockLogout = jest.fn();
const mockCompleteProfile = jest.fn();
const mockUpdateUser = jest.fn();
const mockFetchRepublics = jest.fn();
const mockDeleteRepublic = jest.fn();
const mockUpdateRepublic = jest.fn();
const mockSetShowEditModal = jest.fn();
const mockRegisterRefresh = jest.fn().mockReturnValue(jest.fn());
const mockSendInvite = jest.fn();

function setupMocks(userOverrides = {}) {
  jest.mocked(useIsFocused).mockReturnValue(true);
  jest.mocked(useRouter).mockReturnValue(mockRouter as any);
  jest.mocked(useAuth).mockReturnValue({
    user: {
      id: "u-1",
      nome: "Ana",
      email: "ana@email.com",
      perfilCompleto: true,
      chavePix: "ana@pix",
      telefone: "11999",
      fotoPerfil: null,
      ...userOverrides,
    },
    logout: mockLogout,
    completeProfile: mockCompleteProfile,
    updateUser: mockUpdateUser,
  } as any);
  jest.mocked(useRepublicList).mockReturnValue({
    republics: [mockRepublic],
    fetchRepublics: mockFetchRepublics,
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
  jest.mocked(useInvitesContext).mockReturnValue({
    pendingCount: 0,
    sendInvite: mockSendInvite,
    sendLoading: false,
    sendError: null,
  } as any);
  jest.mocked(useRefresh).mockReturnValue({
    refreshing: false,
    onRefresh: jest.fn(),
    registerRefresh: mockRegisterRefresh,
  } as any);
  jest.mocked(useSideMenu).mockReturnValue({
    menuItems: [],
    footerItems: [],
  } as any);
}

// ─── Setup ────────────────────────────────────────────────────────────────────

let alertSpy: jest.SpyInstance;

beforeEach(() => {
  jest.clearAllMocks();
  mockRegisterRefresh.mockReturnValue(jest.fn());
  setupMocks();
  alertSpy = jest.spyOn(Alert, "alert").mockImplementation(() => {});
});

afterEach(() => {
  alertSpy.mockRestore();
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
  // handleSignOut é passado como 2º argumento ao useSideMenu
  return (jest.mocked(useSideMenu).mock.calls[0] as unknown[])[1] as () => Promise<void>;
}

describe("useProfileScreen — handleSignOut", () => {
  it("chama logout e redireciona para / em caso de sucesso", async () => {
    mockLogout.mockResolvedValue(undefined);
    renderHook(() => useProfileScreen());
    const handleSignOut = getHandleSignOut();

    await act(async () => { await handleSignOut(); });

    expect(mockLogout).toHaveBeenCalled();
    expect(mockRouter.replace).toHaveBeenCalledWith("/");
  });

  it("loga erro e chama toastErrors.logoutFailed ao falhar", async () => {
    const error = new Error("logout fail");
    mockLogout.mockRejectedValue(error);
    renderHook(() => useProfileScreen());
    const handleSignOut = getHandleSignOut();

    await act(async () => { await handleSignOut(); });

    expect(jest.mocked(logger.error)).toHaveBeenCalledWith("User", "Erro ao fazer logout", error);
    expect(jest.mocked(toastErrors.logoutFailed)).toHaveBeenCalledWith(error);
  });

  it("loga undefined quando o erro não é instância de Error", async () => {
    mockLogout.mockRejectedValue("string error");
    renderHook(() => useProfileScreen());
    const handleSignOut = getHandleSignOut();

    await act(async () => { await handleSignOut(); });

    expect(jest.mocked(logger.error)).toHaveBeenCalledWith("User", "Erro ao fazer logout", undefined);
  });
});

// ─── handleSaveProfile ────────────────────────────────────────────────────────

describe("useProfileScreen — handleSaveProfile", () => {
  it("retorna imediatamente quando user é null", async () => {
    jest.mocked(useAuth).mockReturnValue({ user: null, logout: mockLogout, completeProfile: mockCompleteProfile, updateUser: mockUpdateUser } as any);
    const { result } = renderHook(() => useProfileScreen());

    await act(async () => { await result.current.handleSaveProfile("Ana"); });

    expect(mockCompleteProfile).not.toHaveBeenCalled();
    expect(mockUpdateUser).not.toHaveBeenCalled();
  });

  it("exibe Alert quando perfil incompleto e phone ou pixKey estão ausentes", async () => {
    jest.mocked(useAuth).mockReturnValue({
      user: { id: "u-1", nome: "Ana", email: "ana@email.com", perfilCompleto: false },
      logout: mockLogout, completeProfile: mockCompleteProfile, updateUser: mockUpdateUser,
    } as any);
    const { result } = renderHook(() => useProfileScreen());

    await act(async () => { await result.current.handleSaveProfile("Ana"); });

    expect(alertSpy).toHaveBeenCalledWith("Campos Obrigatórios", expect.any(String));
    expect(mockCompleteProfile).not.toHaveBeenCalled();
  });

  it("chama completeProfile quando o perfil está incompleto e todos os campos preenchidos", async () => {
    mockCompleteProfile.mockResolvedValue(undefined);
    jest.mocked(useAuth).mockReturnValue({
      user: { id: "u-1", nome: "Ana", email: "ana@email.com", perfilCompleto: false },
      logout: mockLogout, completeProfile: mockCompleteProfile, updateUser: mockUpdateUser,
    } as any);
    const { result } = renderHook(() => useProfileScreen());

    await act(async () => {
      await result.current.handleSaveProfile("Ana", "ana@pix", undefined, "11999");
    });

    expect(mockCompleteProfile).toHaveBeenCalledWith({
      nome: "Ana", telefone: "11999", chavePix: "ana@pix", fotoPerfil: undefined,
    });
    expect(jest.mocked(showToast.success)).toHaveBeenCalledWith("Perfil salvo com sucesso!");
  });

  it("chama updateUser quando o perfil já está completo", async () => {
    mockUpdateUser.mockResolvedValue(undefined);
    const { result } = renderHook(() => useProfileScreen());

    await act(async () => {
      await result.current.handleSaveProfile("Ana", "ana@pix", undefined, "11999");
    });

    expect(mockUpdateUser).toHaveBeenCalledWith({
      nome: "Ana", telefone: "11999", chavePix: "ana@pix", fotoPerfil: undefined,
    });
    expect(jest.mocked(showToast.success)).toHaveBeenCalledWith("Perfil atualizado com sucesso!");
  });

  it("loga erro e chama toastErrors.profileUpdateFailed ao falhar", async () => {
    const error = new Error("save fail");
    mockUpdateUser.mockRejectedValue(error);
    const { result } = renderHook(() => useProfileScreen());

    await act(async () => {
      await result.current.handleSaveProfile("Ana", "ana@pix", undefined, "11999");
    });

    expect(jest.mocked(logger.error)).toHaveBeenCalledWith("User", "Erro ao salvar perfil", error);
    expect(jest.mocked(toastErrors.profileUpdateFailed)).toHaveBeenCalledWith(error);
  });

  it("loga undefined quando a atualização falha com valor que não é Error", async () => {
    mockUpdateUser.mockRejectedValue("save fail");
    const { result } = renderHook(() => useProfileScreen());

    await act(async () => {
      await result.current.handleSaveProfile("Ana", "ana@pix", undefined, "11999");
    });

    expect(jest.mocked(logger.error)).toHaveBeenCalledWith(
      "User",
      "Erro ao salvar perfil",
      undefined
    );
    expect(jest.mocked(toastErrors.profileUpdateFailed)).toHaveBeenCalledWith(
      "save fail"
    );
  });
});

// ─── navegação ────────────────────────────────────────────────────────────────

describe("useProfileScreen — navegação", () => {
  it("handleCreateRepublic navega para /register/republic", () => {
    const { result } = renderHook(() => useProfileScreen());
    act(() => { result.current.handleCreateRepublic(); });
    expect(mockRouter.push).toHaveBeenCalledWith("/register/republic");
  });

  it("handleViewInvites navega para /(userProfile)/invites", () => {
    const { result } = renderHook(() => useProfileScreen());
    act(() => { result.current.handleViewInvites(); });
    expect(mockRouter.push).toHaveBeenCalledWith("/(userProfile)/invites");
  });

  it("handleSelectRepublic navega para /(republics)/:id", () => {
    const { result } = renderHook(() => useProfileScreen());
    act(() => { result.current.handleSelectRepublic("rep-1"); });
    expect(mockRouter.push).toHaveBeenCalledWith("/(republics)/rep-1");
  });
});

// ─── context menu ─────────────────────────────────────────────────────────────

describe("useProfileScreen — context menu", () => {
  it("handleLongPressRepublic define selectedRepublic, position e abre o menu", () => {
    const position = { x: 10, y: 20, width: 100, height: 50 };
    const { result } = renderHook(() => useProfileScreen());

    act(() => { result.current.handleLongPressRepublic(mockRepublic, position); });

    expect(result.current.selectedRepublic).toEqual(mockRepublic);
    expect(result.current.contextMenuPosition).toEqual(position);
    expect(result.current.contextMenuVisible).toBe(true);
  });

  it("handleCloseContextMenu fecha o menu", () => {
    const { result } = renderHook(() => useProfileScreen());
    act(() => { result.current.handleLongPressRepublic(mockRepublic, { x: 0, y: 0, width: 0, height: 0 }); });
    act(() => { result.current.handleCloseContextMenu(); });
    expect(result.current.contextMenuVisible).toBe(false);
  });

  it("handleOpenEditFromMenu fecha o menu e abre o modal de edição", () => {
    const { result } = renderHook(() => useProfileScreen());
    act(() => { result.current.handleOpenEditFromMenu(); });
    expect(result.current.contextMenuVisible).toBe(false);
    expect(mockSetShowEditModal).toHaveBeenCalledWith(true);
  });

  it("handleCloseEditModal fecha o modal e limpa selectedRepublic", () => {
    const { result } = renderHook(() => useProfileScreen());
    act(() => { result.current.handleLongPressRepublic(mockRepublic, { x: 0, y: 0, width: 0, height: 0 }); });
    act(() => { result.current.handleCloseEditModal(); });
    expect(mockSetShowEditModal).toHaveBeenCalledWith(false);
    expect(result.current.selectedRepublic).toBeNull();
  });

  it("handleInviteFromMenu fecha o menu e abre o modal de convite", () => {
    const { result } = renderHook(() => useProfileScreen());
    act(() => { result.current.handleInviteFromMenu(); });
    expect(result.current.contextMenuVisible).toBe(false);
    expect(result.current.showInviteModal).toBe(true);
  });

  it("handleCloseInviteModal fecha o modal de convite", () => {
    const { result } = renderHook(() => useProfileScreen());
    act(() => { result.current.handleInviteFromMenu(); });
    act(() => { result.current.handleCloseInviteModal(); });
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

  it("chama updateRepublic, fecha o modal e refaz fetch quando selectedRepublic está definida", async () => {
    mockUpdateRepublic.mockResolvedValue(undefined);
    const { result } = renderHook(() => useProfileScreen());

    act(() => { result.current.handleLongPressRepublic(mockRepublic, { x: 0, y: 0, width: 0, height: 0 }); });

    await act(async () => {
      await result.current.handleSaveRepublicEdit("Novo Nome", "img.jpg");
    });

    expect(mockUpdateRepublic).toHaveBeenCalledWith("rep-1", {
      nome: "Novo Nome", imagemRepublica: "img.jpg",
    });
    expect(mockFetchRepublics).toHaveBeenCalled();
  });
});

// ─── handleDeleteFromMenu ─────────────────────────────────────────────────────

describe("useProfileScreen — handleDeleteFromMenu", () => {
  it("retorna imediatamente quando selectedRepublic é null", () => {
    const { result } = renderHook(() => useProfileScreen());
    act(() => { result.current.handleDeleteFromMenu(); });
    expect(jest.mocked(showToast.confirm)).not.toHaveBeenCalled();
  });

  it("exibe confirmação com o nome da república quando selectedRepublic está definida", () => {
    const { result } = renderHook(() => useProfileScreen());

    act(() => { result.current.handleLongPressRepublic(mockRepublic, { x: 0, y: 0, width: 0, height: 0 }); });
    act(() => { result.current.handleDeleteFromMenu(); });

    expect(jest.mocked(showToast.confirm)).toHaveBeenCalledWith(
      'Excluir "Alpha"?',
      expect.any(Function)
    );
  });

  it("chama deleteRepublic e refaz fetch ao confirmar exclusão", async () => {
    mockDeleteRepublic.mockResolvedValue(undefined);
    jest.mocked(showToast.confirm).mockImplementation((_msg, cb) => cb());

    const { result } = renderHook(() => useProfileScreen());

    act(() => { result.current.handleLongPressRepublic(mockRepublic, { x: 0, y: 0, width: 0, height: 0 }); });
    await act(async () => { result.current.handleDeleteFromMenu(); });

    expect(mockDeleteRepublic).toHaveBeenCalledWith("rep-1");
    await act(async () => {});
    expect(mockFetchRepublics).toHaveBeenCalled();
  });
});

// ─── efeitos ──────────────────────────────────────────────────────────────────

describe("useProfileScreen — efeitos", () => {
  it("chama fetchRepublics quando perfilCompleto é true", () => {
    renderHook(() => useProfileScreen());
    expect(mockFetchRepublics).toHaveBeenCalled();
  });

  it("não chama fetchRepublics quando perfilCompleto é false", () => {
    jest.mocked(useAuth).mockReturnValue({
      user: { id: "u-1", nome: "Ana", email: "ana@email.com", perfilCompleto: false },
      logout: mockLogout, completeProfile: mockCompleteProfile, updateUser: mockUpdateUser,
    } as any);

    renderHook(() => useProfileScreen());

    expect(mockFetchRepublics).not.toHaveBeenCalled();
  });

  it("registra fetchRepublics no sistema de refresh com chave 'profile'", () => {
    renderHook(() => useProfileScreen());
    expect(mockRegisterRefresh).toHaveBeenCalledWith("profile", mockFetchRepublics);
  });
});

// ─── sideMenuUser ─────────────────────────────────────────────────────────────

describe("useProfileScreen — sideMenuUser", () => {
  it("retorna null quando user é null", () => {
    jest.mocked(useAuth).mockReturnValue({
      user: null, logout: mockLogout, completeProfile: mockCompleteProfile, updateUser: mockUpdateUser,
    } as any);

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
