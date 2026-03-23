import { render } from "@testing-library/react-native";
import { InvitesSentContent } from "@/src/features/invites/components/InvitesSentContent";
import { useInvitesSentScreen } from "@/src/features/invites/hooks/useInvitesSentScreen";
import { ScreenLayout } from "@/src/shared/components/ScreenLayout";
import { useComponentLogger } from "@/src/shared/hooks/useComponentLogger";
import { InvitesSentScreen } from "../InvitesSentScreen";

jest.mock("@/src/features/invites/components/InvitesSentContent", () => ({
  InvitesSentContent: jest.fn(() => null),
}));
jest.mock("@/src/features/invites/hooks/useInvitesSentScreen", () => ({
  useInvitesSentScreen: jest.fn(),
}));
jest.mock("@/src/shared/components/ScreenLayout", () => ({
  ScreenLayout: jest.fn(({ children }: any) => children),
}));
jest.mock("@/src/shared/hooks/useComponentLogger", () => ({
  useComponentLogger: jest.fn(),
}));

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const mockHandleRetry = jest.fn();
const mockHandleEmptyStatePress = jest.fn();

function makeHookReturn(overrides = {}) {
  return {
    invites: [],
    error: null,
    handleRetry: mockHandleRetry,
    handleEmptyStatePress: mockHandleEmptyStatePress,
    ...overrides,
  };
}

// ─── Setup ────────────────────────────────────────────────────────────────────

let consoleErrorSpy: jest.SpyInstance;

beforeEach(() => {
  jest.clearAllMocks();
  jest.mocked(useInvitesSentScreen).mockReturnValue(makeHookReturn() as any);
  consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  expect(consoleErrorSpy).not.toHaveBeenCalled();
  consoleErrorSpy.mockRestore();
});

// ─── InvitesSentScreen ────────────────────────────────────────────────────────

describe("InvitesSentScreen — hook", () => {
  it("chama useInvitesSentScreen com republicId", () => {
    render(<InvitesSentScreen republicId="rep-42" />);
    expect(jest.mocked(useInvitesSentScreen)).toHaveBeenCalledWith("rep-42");
  });
});

describe("InvitesSentScreen — ScreenLayout", () => {
  it("passa title='Convites Enviados' ao ScreenLayout", () => {
    render(<InvitesSentScreen republicId="rep-1" />);
    const props = jest.mocked(ScreenLayout).mock.calls[0][0] as any;
    expect(props.title).toBe("Convites Enviados");
  });

  it("subtitle mostra '0 convites' quando não há convites", () => {
    render(<InvitesSentScreen republicId="rep-1" />);
    const props = jest.mocked(ScreenLayout).mock.calls[0][0] as any;
    expect(props.subtitle).toBe("0 convites");
  });

  it("subtitle mostra '1 convite' com um convite", () => {
    jest.mocked(useInvitesSentScreen).mockReturnValue(
      makeHookReturn({ invites: [{}] }) as any
    );
    render(<InvitesSentScreen republicId="rep-1" />);
    const props = jest.mocked(ScreenLayout).mock.calls[0][0] as any;
    expect(props.subtitle).toBe("1 convite");
  });

  it("subtitle mostra '2 convites' com múltiplos convites", () => {
    jest.mocked(useInvitesSentScreen).mockReturnValue(
      makeHookReturn({ invites: [{}, {}] }) as any
    );
    render(<InvitesSentScreen republicId="rep-1" />);
    const props = jest.mocked(ScreenLayout).mock.calls[0][0] as any;
    expect(props.subtitle).toBe("2 convites");
  });

  it("passa handleEmptyStatePress como onBack ao ScreenLayout", () => {
    render(<InvitesSentScreen republicId="rep-1" />);
    const props = jest.mocked(ScreenLayout).mock.calls[0][0] as any;
    expect(props.onBack).toBe(mockHandleEmptyStatePress);
  });
});

describe("InvitesSentScreen — InvitesSentContent", () => {
  it("passa error do hook ao InvitesSentContent", () => {
    jest.mocked(useInvitesSentScreen).mockReturnValue(
      makeHookReturn({ error: "Falha de rede" }) as any
    );
    render(<InvitesSentScreen republicId="rep-1" />);
    const props = jest.mocked(InvitesSentContent).mock.calls[0][0] as any;
    expect(props.error).toBe("Falha de rede");
  });

  it("passa invites do hook ao InvitesSentContent", () => {
    const invites = [{}, {}] as any;
    jest.mocked(useInvitesSentScreen).mockReturnValue(
      makeHookReturn({ invites }) as any
    );
    render(<InvitesSentScreen republicId="rep-1" />);
    const props = jest.mocked(InvitesSentContent).mock.calls[0][0] as any;
    expect(props.invites).toBe(invites);
  });

  it("passa handleRetry como onRetry ao InvitesSentContent", () => {
    render(<InvitesSentScreen republicId="rep-1" />);
    const props = jest.mocked(InvitesSentContent).mock.calls[0][0] as any;
    expect(props.onRetry).toBe(mockHandleRetry);
  });

  it("passa handleEmptyStatePress como onEmptyStatePress ao InvitesSentContent", () => {
    render(<InvitesSentScreen republicId="rep-1" />);
    const props = jest.mocked(InvitesSentContent).mock.calls[0][0] as any;
    expect(props.onEmptyStatePress).toBe(mockHandleEmptyStatePress);
  });
});
