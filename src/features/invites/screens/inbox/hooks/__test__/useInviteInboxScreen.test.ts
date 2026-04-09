import { act, renderHook } from "@testing-library/react-native";
import { useRouter } from "expo-router";
import { useLogoutMutation } from "@/src/features/auth/hooks/useAuthMutations";
import { StatusInvite } from "@/src/features/invites/types/invite.types";
import { useCurrentUserQuery } from "@/src/features/user/hooks/useUserQueries";
import { getErrorMessage } from "@/src/services/httpError";
import { useSideMenu } from "@/src/shared/components/SideMenu/useSideMenu";
import { toastErrors } from "@/src/shared/utils/toastMessages";
import {
  useInvitesByUserQuery,
  useUpdateInviteStatusMutation,
} from "../../../../hooks/useInvitesQueries";
import { useInviteInboxScreen } from "../useInviteInboxScreen";

jest.mock("expo-router", () => ({ useRouter: jest.fn() }));
jest.mock("@/src/features/auth/hooks/useAuthMutations", () => ({
  useLogoutMutation: jest.fn(),
}));
jest.mock("@/src/features/user/hooks/useUserQueries", () => ({
  useCurrentUserQuery: jest.fn(),
}));
jest.mock("@/src/features/invites/hooks/useInvitesQueries", () => ({
  useInvitesByUserQuery: jest.fn(),
  useUpdateInviteStatusMutation: jest.fn(),
}));
jest.mock("@/src/services/httpError", () => ({
  getErrorMessage: jest.fn(),
}));
jest.mock("@/src/shared/components/SideMenu/useSideMenu", () => ({
  useSideMenu: jest.fn(),
}));
jest.mock("@/src/shared/utils/toastMessages", () => ({
  toastErrors: { logoutFailed: jest.fn() },
}));

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const mockLogout = jest.fn();
const mockRefetch = jest.fn();
const mockMutateAsync = jest.fn();
const mockRouterReplace = jest.fn();

const serializeError = (error: Error) =>
  JSON.stringify(error, Object.getOwnPropertyNames(error), 2);

function setupMocks(userOverrides = {}) {
  jest.mocked(useRouter).mockReturnValue({ replace: mockRouterReplace } as any);
  jest.mocked(useCurrentUserQuery).mockReturnValue({
    data: { id: "u-1", nome: "Ana", fotoPerfil: null, ...userOverrides },
  } as any);
  jest.mocked(useLogoutMutation).mockReturnValue({
    mutateAsync: mockLogout,
  } as any);
  jest.mocked(useInvitesByUserQuery).mockReturnValue({
    data: [],
    error: null,
    refetch: mockRefetch,
  } as any);
  jest.mocked(useUpdateInviteStatusMutation).mockReturnValue({
    mutateAsync: mockMutateAsync,
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

let consoleErrorSpy: jest.SpyInstance;

beforeEach(() => {
  jest.clearAllMocks();
  setupMocks();
  consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  consoleErrorSpy.mockRestore();
});

// ─── Estado inicial ───────────────────────────────────────────────────────────

describe("useInviteInboxScreen — estado inicial", () => {
  it("retorna as propriedades esperadas", () => {
    const { result } = renderHook(() => useInviteInboxScreen());

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
    jest.mocked(useInvitesByUserQuery).mockReturnValue({
      data: [
        { id: "1", status: StatusInvite.PENDENTE },
        { id: "2", status: StatusInvite.PENDENTE },
        { id: "3", status: StatusInvite.ACEITO },
      ],
      error: null,
      refetch: mockRefetch,
    } as any);

    renderHook(() => useInviteInboxScreen());

    expect(jest.mocked(useSideMenu)).toHaveBeenCalledWith(
      "invite",
      expect.any(Function),
      { pendingInvitesCount: 2 }
    );
  });

  it("formata error da query quando presente", () => {
    const error = new Error("fetch fail");
    jest.mocked(useInvitesByUserQuery).mockReturnValue({
      data: [],
      error,
      refetch: mockRefetch,
    } as any);

    const { result } = renderHook(() => useInviteInboxScreen());

    expect(jest.mocked(getErrorMessage)).toHaveBeenCalledWith(
      error,
      "Não foi possível carregar os convites."
    );
    expect(result.current.error).toBe("Não foi possível carregar os convites.");
  });
});

// ─── handleSignOut ────────────────────────────────────────────────────────────

describe("useInviteInboxScreen — handleSignOut", () => {
  it("chama logout com sucesso sem lançar erros", async () => {
    mockLogout.mockResolvedValue(undefined);

    renderHook(() => useInviteInboxScreen());
    const handleSignOut = (
      jest.mocked(useSideMenu).mock.calls[0] as unknown[]
    )[1] as () => Promise<void>;

    await act(async () => {
      await handleSignOut();
    });

    expect(mockLogout).toHaveBeenCalled();
    expect(jest.mocked(toastErrors.logoutFailed)).not.toHaveBeenCalled();
  });

  it("loga erro e chama toastErrors.logoutFailed ao falhar", async () => {
    const error = new Error("logout fail");
    mockLogout.mockRejectedValue(error);

    renderHook(() => useInviteInboxScreen());
    const handleSignOut = (
      jest.mocked(useSideMenu).mock.calls[0] as unknown[]
    )[1] as () => Promise<void>;

    await act(async () => {
      await handleSignOut();
    });

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "[ERROR][Invites]",
      "Erro ao fazer logout",
      serializeError(error)
    );
    expect(jest.mocked(toastErrors.logoutFailed)).toHaveBeenCalledWith(error);
    consoleErrorSpy.mockClear();
  });
});

// ─── fetchInvitesByUser ───────────────────────────────────────────────────────

describe("useInviteInboxScreen — fetchInvitesByUser", () => {
  it("chama refetch ao ser invocado", async () => {
    mockRefetch.mockResolvedValue(undefined);
    const { result } = renderHook(() => useInviteInboxScreen());

    await act(async () => {
      await result.current.fetchInvitesByUser();
    });

    expect(mockRefetch).toHaveBeenCalledTimes(1);
  });
});

// ─── handleAcceptInvite ───────────────────────────────────────────────────────

describe("useInviteInboxScreen — handleAcceptInvite", () => {
  it("chama mutateAsync com ACEITO e navega para a república", async () => {
    mockMutateAsync.mockResolvedValue(undefined);
    const { result } = renderHook(() => useInviteInboxScreen());

    await act(async () => {
      await result.current.handleAcceptInvite("inv-1", "rep-1");
    });

    expect(mockMutateAsync).toHaveBeenCalledWith({
      inviteId: "inv-1",
      status: StatusInvite.ACEITO,
    });
    expect(mockRouterReplace).toHaveBeenCalledWith("/(republics)/rep-1");
  });

  it("loga o erro e não navega quando a mutation falha", async () => {
    const error = new Error("update fail");
    mockMutateAsync.mockRejectedValue(error);
    const { result } = renderHook(() => useInviteInboxScreen());

    await act(async () => {
      await result.current.handleAcceptInvite("inv-1", "rep-1");
    });

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "[ERROR][Invites]",
      "Erro ao aceitar convite",
      serializeError(error)
    );
    expect(mockRouterReplace).not.toHaveBeenCalled();
    consoleErrorSpy.mockClear();
  });
});

// ─── handleRejectInvite ───────────────────────────────────────────────────────

describe("useInviteInboxScreen — handleRejectInvite", () => {
  it("chama mutateAsync com RECUSADO", async () => {
    mockMutateAsync.mockResolvedValue(undefined);
    const { result } = renderHook(() => useInviteInboxScreen());

    await act(async () => {
      await result.current.handleRejectInvite("inv-1");
    });

    expect(mockMutateAsync).toHaveBeenCalledWith({
      inviteId: "inv-1",
      status: StatusInvite.RECUSADO,
    });
  });

  it("loga o erro quando a mutation falha", async () => {
    const error = new Error("reject fail");
    mockMutateAsync.mockRejectedValue(error);
    const { result } = renderHook(() => useInviteInboxScreen());

    await act(async () => {
      await result.current.handleRejectInvite("inv-1");
    });

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "[ERROR][Invites]",
      "Erro ao recusar convite",
      serializeError(error)
    );
    consoleErrorSpy.mockClear();
  });
});

// ─── sideMenuUser ─────────────────────────────────────────────────────────────

describe("useInviteInboxScreen — sideMenuUser", () => {
  it("retorna nome e foto do usuário", () => {
    const { result } = renderHook(() => useInviteInboxScreen());
    expect(result.current.sideMenuUser).toEqual({ name: "Ana", photo: null });
  });

  it("usa 'Usuário' como fallback quando user.nome é undefined", () => {
    setupMocks({ nome: undefined });
    const { result } = renderHook(() => useInviteInboxScreen());
    expect(result.current.sideMenuUser.name).toBe("Usuário");
  });
});
