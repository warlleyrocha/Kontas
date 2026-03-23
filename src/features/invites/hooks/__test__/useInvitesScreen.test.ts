import { act, renderHook } from "@testing-library/react-native";
import { useAuth } from "@/src/features/auth/contexts";
import { useInvitesContext } from "@/src/features/invites/contexts/InvitesContext";
import { useSideMenu } from "@/src/shared/components/SideMenu/useSideMenu";
import { toastErrors } from "@/src/shared/utils/toastMessages";
import { useInvitesScreen } from "../useInvitesScreen";

jest.mock("@/src/features/auth/contexts", () => ({ useAuth: jest.fn() }));
jest.mock("@/src/features/invites/contexts/InvitesContext", () => ({
  useInvitesContext: jest.fn(),
}));
jest.mock("@/src/shared/components/SideMenu/useSideMenu", () => ({
  useSideMenu: jest.fn(),
}));
jest.mock("@/src/shared/utils/toastMessages", () => ({
  toastErrors: { logoutFailed: jest.fn() },
}));

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const mockLogout = jest.fn();
const mockFetchInvitesByUser = jest.fn();
const mockHandleAcceptInvite = jest.fn();
const mockHandleRejectInvite = jest.fn();

function setupMocks(userOverrides = {}) {
  jest.mocked(useAuth).mockReturnValue({
    user: {
      id: "u-1",
      nome: "Ana",
      fotoPerfil: null,
      ...userOverrides,
    },
    logout: mockLogout,
  } as any);
  jest.mocked(useInvitesContext).mockReturnValue({
    invitesByUser: [],
    pendingCount: 2,
    error: null,
    fetchInvitesByUser: mockFetchInvitesByUser,
    handleAcceptInvite: mockHandleAcceptInvite,
    handleRejectInvite: mockHandleRejectInvite,
  } as any);
  jest.mocked(useSideMenu).mockReturnValue({
    menuItems: [],
    footerItems: [],
  } as any);
}

// ─── Setup ────────────────────────────────────────────────────────────────────

let consoleErrorSpy: jest.SpyInstance;

beforeEach(() => {
  jest.clearAllMocks();
  setupMocks();
  consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  consoleErrorSpy.mockRestore();
});

// ─── useInvitesScreen ─────────────────────────────────────────────────────────

describe("useInvitesScreen — estado inicial", () => {
  it("retorna as propriedades esperadas", () => {
    const { result } = renderHook(() => useInvitesScreen());

    expect(result.current.isMenuOpen).toBe(false);
    expect(result.current.invitesByUser).toEqual([]);
    expect(result.current.error).toBeNull();
    expect(typeof result.current.fetchInvitesByUser).toBe("function");
    expect(typeof result.current.handleAcceptInvite).toBe("function");
    expect(typeof result.current.handleRejectInvite).toBe("function");
    expect(result.current.menuItems).toEqual([]);
    expect(result.current.footerItems).toEqual([]);
  });

  it("passa pendingCount ao useSideMenu", () => {
    renderHook(() => useInvitesScreen());

    expect(jest.mocked(useSideMenu)).toHaveBeenCalledWith(
      "invite",
      expect.any(Function),
      { pendingInvitesCount: 2 }
    );
  });
});

describe("useInvitesScreen — handleSignOut", () => {
  it("chama logout com sucesso sem lançar erros", async () => {
    mockLogout.mockResolvedValue(undefined);

    // handleSignOut é passado ao useSideMenu como 2º argumento
    renderHook(() => useInvitesScreen());
    const handleSignOut = (jest.mocked(useSideMenu).mock.calls[0] as unknown[])[1] as () => Promise<void>;

    await act(async () => { await handleSignOut(); });

    expect(mockLogout).toHaveBeenCalled();
    expect(jest.mocked(toastErrors.logoutFailed)).not.toHaveBeenCalled();
  });

  it("loga erro e chama toastErrors.logoutFailed ao falhar", async () => {
    const error = new Error("logout fail");
    mockLogout.mockRejectedValue(error);

    renderHook(() => useInvitesScreen());
    const handleSignOut = (jest.mocked(useSideMenu).mock.calls[0] as unknown[])[1] as () => Promise<void>;

    await act(async () => { await handleSignOut(); });

    expect(consoleErrorSpy).toHaveBeenCalledWith("Erro ao fazer logout da conta:", error);
    expect(jest.mocked(toastErrors.logoutFailed)).toHaveBeenCalledWith(error);
    consoleErrorSpy.mockClear();
  });
});

describe("useInvitesScreen — sideMenuUser", () => {
  it("retorna nome e foto do usuário", () => {
    const { result } = renderHook(() => useInvitesScreen());

    expect(result.current.sideMenuUser).toEqual({ name: "Ana", photo: null });
  });

  it("usa 'Usuário' como fallback quando user.nome é undefined", () => {
    setupMocks({ nome: undefined });
    const { result } = renderHook(() => useInvitesScreen());

    expect(result.current.sideMenuUser.name).toBe("Usuário");
  });
});
