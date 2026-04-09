import { render } from "@testing-library/react-native";
import { InviteList } from "@/src/features/invites/components/InviteList";
import { useInviteSentScreen } from "@/src/features/invites/screens/sent/hooks/useInviteSentScreen";
import { ScreenLayout } from "@/src/shared/components/ScreenLayout";
import { InviteSentScreen } from "../InviteSentScreen";

jest.mock("@/src/features/invites/components/InviteList", () => ({
  InviteList: jest.fn(() => null),
}));
jest.mock(
  "@/src/features/invites/screens/sent/hooks/useInviteSentScreen",
  () => ({
    useInviteSentScreen: jest.fn(),
  })
);
jest.mock("@/src/shared/components/ScreenLayout", () => ({
  ScreenLayout: jest.fn(({ children }: any) => children),
}));
jest.mock("@/src/shared/hooks/useComponentLogger", () => ({
  useComponentLogger: jest.fn(),
}));

const mockHandleRetry = jest.fn();
const mockHandleEmptyStatePress = jest.fn();

function makeHookReturn(overrides = {}) {
  return {
    invites: [],
    error: null,
    handleRetry: mockHandleRetry,
    handleEmptyStatePress: mockHandleEmptyStatePress,
    pendingCount: 0,
    ...overrides,
  };
}

let consoleErrorSpy: jest.SpyInstance;

beforeEach(() => {
  jest.clearAllMocks();
  jest.mocked(useInviteSentScreen).mockReturnValue(makeHookReturn() as any);
  consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  expect(consoleErrorSpy).not.toHaveBeenCalled();
  consoleErrorSpy.mockRestore();
});

describe("InviteSentScreen — hook", () => {
  it("chama useInviteSentScreen com republicId", () => {
    render(<InviteSentScreen republicId="rep-42" />);
    expect(jest.mocked(useInviteSentScreen)).toHaveBeenCalledWith("rep-42");
  });
});

describe("InviteSentScreen — ScreenLayout", () => {
  it("passa title='Convites Enviados' ao ScreenLayout", () => {
    render(<InviteSentScreen republicId="rep-1" />);
    const props = jest.mocked(ScreenLayout).mock.calls[0][0] as any;
    expect(props.title).toBe("Convites Enviados");
  });

  it("subtitle mostra '0 pendentes' quando não há convites pendentes", () => {
    jest
      .mocked(useInviteSentScreen)
      .mockReturnValue(makeHookReturn({ pendingCount: 0 }) as any);
    render(<InviteSentScreen republicId="rep-1" />);
    const props = jest.mocked(ScreenLayout).mock.calls[0][0] as any;
    expect(props.subtitle).toBe("0 pendentes");
  });

  it("subtitle mostra '1 convite' com um convite", () => {
    jest
      .mocked(useInviteSentScreen)
      .mockReturnValue(makeHookReturn({ pendingCount: 1 }) as any);
    render(<InviteSentScreen republicId="rep-1" />);
    const props = jest.mocked(ScreenLayout).mock.calls[0][0] as any;
    expect(props.subtitle).toBe("1 pendente");
  });

  it("subtitle mostra '2 pendentes' com múltiplos convites", () => {
    jest
      .mocked(useInviteSentScreen)
      .mockReturnValue(makeHookReturn({ pendingCount: 2 }) as any);
    render(<InviteSentScreen republicId="rep-1" />);
    const props = jest.mocked(ScreenLayout).mock.calls[0][0] as any;
    expect(props.subtitle).toBe("2 pendentes");
  });

  it("passa handleEmptyStatePress como onBack ao ScreenLayout", () => {
    render(<InviteSentScreen republicId="rep-1" />);
    const props = jest.mocked(ScreenLayout).mock.calls[0][0] as any;
    expect(props.onBack).toBe(mockHandleEmptyStatePress);
  });
});

describe("InviteSentScreen — InviteList", () => {
  it("passa error do hook ao InviteList", () => {
    jest
      .mocked(useInviteSentScreen)
      .mockReturnValue(makeHookReturn({ error: "Falha de rede" }) as any);
    render(<InviteSentScreen republicId="rep-1" />);
    const props = jest.mocked(InviteList).mock.calls[0][0] as any;
    expect(props.error).toBe("Falha de rede");
  });

  it("passa invites do hook ao InviteList", () => {
    const invites = [{}, {}] as any;
    jest
      .mocked(useInviteSentScreen)
      .mockReturnValue(makeHookReturn({ invites }) as any);
    render(<InviteSentScreen republicId="rep-1" />);
    const props = jest.mocked(InviteList).mock.calls[0][0] as any;
    expect(props.invites).toBe(invites);
  });

  it("passa handleRetry como onRetry ao InviteList", () => {
    render(<InviteSentScreen republicId="rep-1" />);
    const props = jest.mocked(InviteList).mock.calls[0][0] as any;
    expect(props.onRetry).toBe(mockHandleRetry);
  });

  it("passa emptyState.onPress como handleEmptyStatePress ao InviteList", () => {
    render(<InviteSentScreen republicId="rep-1" />);
    const props = jest.mocked(InviteList).mock.calls[0][0] as any;
    props.emptyState.onPress();
    expect(mockHandleEmptyStatePress).toHaveBeenCalledTimes(1);
  });

  it("passa variant='sent' ao InviteList", () => {
    render(<InviteSentScreen republicId="rep-1" />);
    const props = jest.mocked(InviteList).mock.calls[0][0] as any;
    expect(props.variant).toBe("sent");
  });
});
