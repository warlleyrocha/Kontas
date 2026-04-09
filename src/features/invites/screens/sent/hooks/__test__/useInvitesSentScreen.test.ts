import { act, renderHook } from "@testing-library/react-native";
import { useRouter } from "expo-router";
import { useInvitesByRepublicQuery } from "@/src/features/invites/hooks/useInvitesQueries";
import { getErrorMessage } from "@/src/services/httpError";
import { useInvitesSentScreen } from "../../screens/sent/hooks/useInviteSentScreen";

jest.mock("expo-router", () => ({ useRouter: jest.fn() }));
jest.mock("@/src/features/invites/hooks/useInvitesQueries", () => ({
  useInvitesByRepublicQuery: jest.fn(),
}));
jest.mock("@/src/services/httpError", () => ({
  getErrorMessage: jest.fn(),
}));

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const mockRouter = { back: jest.fn() };
const mockRefetch = jest.fn();

function setupQuery(overrides = {}) {
  jest.mocked(useInvitesByRepublicQuery).mockReturnValue({
    data: undefined,
    error: null,
    isLoading: false,
    isFetching: false,
    refetch: mockRefetch,
    ...overrides,
  } as any);
}

// ─── Setup ────────────────────────────────────────────────────────────────────

beforeEach(() => {
  jest.clearAllMocks();
  jest.mocked(useRouter).mockReturnValue(mockRouter as any);
  jest
    .mocked(getErrorMessage)
    .mockImplementation((_err, fallback) => fallback ?? "erro");
  setupQuery();
});

// ─── useInvitesSentScreen ─────────────────────────────────────────────────────

describe("useInvitesSentScreen — estado inicial", () => {
  it("retorna invites=[] quando data é undefined", () => {
    const { result } = renderHook(() => useInvitesSentScreen("rep-1"));

    expect(result.current.invites).toEqual([]);
  });

  it("retorna os convites quando data está definida", () => {
    const mockInvite = { id: "inv-1", email: "a@b.com" };
    setupQuery({ data: [mockInvite] });

    const { result } = renderHook(() => useInvitesSentScreen("rep-1"));

    expect(result.current.invites).toEqual([mockInvite]);
  });

  it("retorna error=null quando não há erro", () => {
    const { result } = renderHook(() => useInvitesSentScreen("rep-1"));

    expect(result.current.error).toBeNull();
  });

  it("retorna a mensagem de erro quando invitesQuery.error está definido", () => {
    const error = new Error("fail");
    setupQuery({ error });
    jest
      .mocked(getErrorMessage)
      .mockReturnValue("Não foi possível carregar os convites enviados.");

    const { result } = renderHook(() => useInvitesSentScreen("rep-1"));

    expect(getErrorMessage).toHaveBeenCalledWith(
      error,
      "Não foi possível carregar os convites enviados."
    );
    expect(result.current.error).toBe(
      "Não foi possível carregar os convites enviados."
    );
  });

  it("loading=true quando isLoading é true", () => {
    setupQuery({ isLoading: true, isFetching: false });
    const { result } = renderHook(() => useInvitesSentScreen("rep-1"));
    expect(result.current.loading).toBe(true);
  });

  it("loading=true quando isFetching é true", () => {
    setupQuery({ isLoading: false, isFetching: true });
    const { result } = renderHook(() => useInvitesSentScreen("rep-1"));
    expect(result.current.loading).toBe(true);
  });

  it("loading=false quando ambos são false", () => {
    const { result } = renderHook(() => useInvitesSentScreen("rep-1"));
    expect(result.current.loading).toBe(false);
  });
});

describe("useInvitesSentScreen — handleRetry", () => {
  it("chama invitesQuery.refetch", () => {
    const { result } = renderHook(() => useInvitesSentScreen("rep-1"));

    act(() => {
      result.current.handleRetry();
    });

    expect(mockRefetch).toHaveBeenCalledTimes(1);
  });
});

describe("useInvitesSentScreen — handleEmptyStatePress", () => {
  it("chama router.back", () => {
    const { result } = renderHook(() => useInvitesSentScreen("rep-1"));

    act(() => {
      result.current.handleEmptyStatePress();
    });

    expect(mockRouter.back).toHaveBeenCalledTimes(1);
  });
});
