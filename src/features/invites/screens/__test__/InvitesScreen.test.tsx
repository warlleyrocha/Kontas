import { render } from "@testing-library/react-native";
import { useRouter } from "expo-router";
import { InvitesInboxContent } from "@/src/features/invites/components/InvitesInboxContent";
import { useInvitesScreen } from "@/src/features/invites/hooks/useInvitesScreen";
import { ScreenLayout } from "@/src/shared/components/ScreenLayout";
import { InvitesScreen } from "../InvitesScreen";

jest.mock("expo-router", () => ({ useRouter: jest.fn() }));
jest.mock("@/src/features/invites/components/InvitesInboxContent", () => ({
  InvitesInboxContent: jest.fn(() => null),
}));
jest.mock("@/src/features/invites/hooks/useInvitesScreen", () => ({
  useInvitesScreen: jest.fn(),
}));
jest.mock("@/src/shared/components/ScreenLayout", () => ({
  ScreenLayout: jest.fn(({ children }: any) => children),
}));
jest.mock("@/src/shared/hooks/useComponentLogger", () => ({
  useComponentLogger: jest.fn(),
}));

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const mockFetchInvitesByUser = jest.fn();
const mockHandleAcceptInvite = jest.fn();
const mockHandleRejectInvite = jest.fn();
const mockRouterPush = jest.fn();

function makeHookReturn(overrides = {}) {
  return {
    invitesByUser: [],
    fetchInvitesByUser: mockFetchInvitesByUser,
    handleAcceptInvite: mockHandleAcceptInvite,
    handleRejectInvite: mockHandleRejectInvite,
    error: null,
    ...overrides,
  };
}

// ─── Setup ────────────────────────────────────────────────────────────────────

let consoleErrorSpy: jest.SpyInstance;

beforeEach(() => {
  jest.clearAllMocks();
  jest.mocked(useInvitesScreen).mockReturnValue(makeHookReturn() as any);
  jest.mocked(useRouter).mockReturnValue({ push: mockRouterPush } as any);
  consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  expect(consoleErrorSpy).not.toHaveBeenCalled();
  consoleErrorSpy.mockRestore();
});

// ─── InvitesScreen ────────────────────────────────────────────────────────────

describe("InvitesScreen — ScreenLayout", () => {
  it("passa title='Meus Convites' ao ScreenLayout", () => {
    render(<InvitesScreen />);
    const props = jest.mocked(ScreenLayout).mock.calls[0][0] as any;
    expect(props.title).toBe("Meus Convites");
  });

  it("subtitle mostra '0 pendentes' quando não há convites", () => {
    jest
      .mocked(useInvitesScreen)
      .mockReturnValue(makeHookReturn({ invitesByUser: [] }) as any);
    render(<InvitesScreen />);
    const props = jest.mocked(ScreenLayout).mock.calls[0][0] as any;
    expect(props.subtitle).toBe("0 pendentes");
  });

  it("subtitle mostra '1 pendente' com um convite", () => {
    jest
      .mocked(useInvitesScreen)
      .mockReturnValue(makeHookReturn({ invitesByUser: [{}] }) as any);
    render(<InvitesScreen />);
    const props = jest.mocked(ScreenLayout).mock.calls[0][0] as any;
    expect(props.subtitle).toBe("1 pendente");
  });

  it("subtitle mostra '2 pendentes' com múltiplos convites", () => {
    jest
      .mocked(useInvitesScreen)
      .mockReturnValue(makeHookReturn({ invitesByUser: [{}, {}] }) as any);
    render(<InvitesScreen />);
    const props = jest.mocked(ScreenLayout).mock.calls[0][0] as any;
    expect(props.subtitle).toBe("2 pendentes");
  });
});

describe("InvitesScreen — InvitesInboxContent", () => {
  it("passa error do hook ao InvitesInboxContent", () => {
    jest
      .mocked(useInvitesScreen)
      .mockReturnValue(makeHookReturn({ error: "Falha de rede" }) as any);
    render(<InvitesScreen />);
    const props = jest.mocked(InvitesInboxContent).mock.calls[0][0] as any;
    expect(props.error).toBe("Falha de rede");
  });

  it("passa invitesByUser como invites ao InvitesInboxContent", () => {
    const invites = [{}, {}] as any;
    jest
      .mocked(useInvitesScreen)
      .mockReturnValue(makeHookReturn({ invitesByUser: invites }) as any);
    render(<InvitesScreen />);
    const props = jest.mocked(InvitesInboxContent).mock.calls[0][0] as any;
    expect(props.invites).toBe(invites);
  });

  it("passa fetchInvitesByUser como onRetry ao InvitesInboxContent", () => {
    render(<InvitesScreen />);
    const props = jest.mocked(InvitesInboxContent).mock.calls[0][0] as any;
    expect(props.onRetry).toBe(mockFetchInvitesByUser);
  });

  it("passa handleAcceptInvite e handleRejectInvite ao InvitesInboxContent", () => {
    render(<InvitesScreen />);
    const props = jest.mocked(InvitesInboxContent).mock.calls[0][0] as any;
    expect(props.onAcceptInvite).toBe(mockHandleAcceptInvite);
    expect(props.onRejectInvite).toBe(mockHandleRejectInvite);
  });

  it("onEmptyStatePress chama router.push para a rota de perfil", () => {
    render(<InvitesScreen />);
    const props = jest.mocked(InvitesInboxContent).mock.calls[0][0] as any;
    props.onEmptyStatePress();
    expect(mockRouterPush).toHaveBeenCalledWith("/(userProfile)/profile");
  });
});
