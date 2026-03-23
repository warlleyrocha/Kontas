import { act, renderHook } from "@testing-library/react-native";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useAuth } from "@/src/features/auth/contexts";
import { inviteService } from "@/src/features/invites/services/invite.service";
import type { GetInvitesByUser, Invite } from "@/src/features/invites/types/invite.types";
import { StatusInvite } from "@/src/features/invites/types/invite.types";
import { getErrorMessage } from "@/src/services/httpError";
import {
  useInvitesByRepublicQuery,
  useInvitesByUserQuery,
  useInvitesContext,
  usePendingInvitesCount,
  useSendInviteMutation,
  useUpdateInviteStatusMutation,
} from "../InvitesContext";

jest.mock("@tanstack/react-query", () => ({
  useQuery: jest.fn(),
  useMutation: jest.fn(),
  useQueryClient: jest.fn(),
}));
jest.mock("expo-router", () => ({ useRouter: jest.fn() }));
jest.mock("@/src/features/auth/contexts", () => ({ useAuth: jest.fn() }));
jest.mock("@/src/features/invites/services/invite.service", () => ({
  inviteService: {
    getInvitesByUser: jest.fn(),
    getInvitesByRepublicId: jest.fn(),
    sendInvite: jest.fn(),
    patchInviteStatus: jest.fn(),
  },
}));
jest.mock("@/src/services/httpError", () => ({
  getErrorMessage: jest.fn(),
}));

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const mockRefetch = jest.fn();
const mockSetQueryData = jest.fn();
const mockRouterReplace = jest.fn();

const mockInvite: Invite = {
  id: "inv-1",
  email: "user@email.com",
  republicaId: "rep-1",
  status: StatusInvite.PENDENTE,
  criadoEm: "2026-01-01",
  atualizadoEm: "2026-01-01",
};

// ─── Setup ────────────────────────────────────────────────────────────────────

let consoleErrorSpy: jest.SpyInstance;

beforeEach(() => {
  jest.clearAllMocks();
  jest.mocked(useAuth).mockReturnValue({ isAuthenticated: true } as any);
  jest.mocked(useRouter).mockReturnValue({ replace: mockRouterReplace } as any);
  jest.mocked(useQueryClient).mockReturnValue({ setQueryData: mockSetQueryData } as any);
  jest.mocked(useQuery).mockReturnValue({
    data: undefined,
    error: null,
    refetch: mockRefetch,
  } as any);
  jest.mocked(useMutation).mockReturnValue({
    mutateAsync: jest.fn(),
    isPending: false,
    error: null,
  } as any);
  jest.mocked(getErrorMessage).mockImplementation((_err, fallback) => fallback ?? "erro");

  consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  // Falha o teste se houver console.error inesperado. Testes que esperam
  // erros devem chamar consoleErrorSpy.mockClear() ao final.
  expect(consoleErrorSpy).not.toHaveBeenCalled();
  consoleErrorSpy.mockRestore();
});

// ─── useInvitesByUserQuery ────────────────────────────────────────────────────

describe("useInvitesByUserQuery", () => {
  let capturedOptions: any;

  beforeEach(() => {
    jest.mocked(useQuery).mockImplementation((options: any) => {
      capturedOptions = options;
      return { data: undefined, error: null, refetch: mockRefetch } as any;
    });
  });

  it("usa a queryKey correta", () => {
    renderHook(() => useInvitesByUserQuery());
    expect(capturedOptions.queryKey).toEqual(["invites", "me"]);
  });

  it("enabled=true quando autenticado", () => {
    jest.mocked(useAuth).mockReturnValue({ isAuthenticated: true } as any);
    renderHook(() => useInvitesByUserQuery());
    expect(capturedOptions.enabled).toBe(true);
  });

  it("enabled=false quando não autenticado", () => {
    jest.mocked(useAuth).mockReturnValue({ isAuthenticated: false } as any);
    renderHook(() => useInvitesByUserQuery());
    expect(capturedOptions.enabled).toBe(false);
  });

  it("queryFn chama inviteService.getInvitesByUser com o signal", async () => {
    renderHook(() => useInvitesByUserQuery());
    const signal = {} as AbortSignal;
    await capturedOptions.queryFn({ signal });
    expect(jest.mocked(inviteService.getInvitesByUser)).toHaveBeenCalledWith(signal);
  });
});

// ─── useInvitesByRepublicQuery ────────────────────────────────────────────────

describe("useInvitesByRepublicQuery", () => {
  let capturedOptions: any;

  beforeEach(() => {
    jest.mocked(useQuery).mockImplementation((options: any) => {
      capturedOptions = options;
      return { data: undefined, error: null, refetch: mockRefetch } as any;
    });
  });

  it("usa a queryKey correta com republicId", () => {
    renderHook(() => useInvitesByRepublicQuery("rep-1"));
    expect(capturedOptions.queryKey).toEqual(["invites", "republic", "rep-1"]);
  });

  it("enabled=true quando autenticado e republicId fornecido", () => {
    jest.mocked(useAuth).mockReturnValue({ isAuthenticated: true } as any);
    renderHook(() => useInvitesByRepublicQuery("rep-1"));
    expect(capturedOptions.enabled).toBe(true);
  });

  it("enabled=false quando não autenticado", () => {
    jest.mocked(useAuth).mockReturnValue({ isAuthenticated: false } as any);
    renderHook(() => useInvitesByRepublicQuery("rep-1"));
    expect(capturedOptions.enabled).toBe(false);
  });

  it("enabled=false quando republicId é string vazia", () => {
    jest.mocked(useAuth).mockReturnValue({ isAuthenticated: true } as any);
    renderHook(() => useInvitesByRepublicQuery(""));
    expect(capturedOptions.enabled).toBe(false);
  });

  it("queryFn chama inviteService.getInvitesByRepublicId com republicId e signal", async () => {
    renderHook(() => useInvitesByRepublicQuery("rep-1"));
    const signal = {} as AbortSignal;
    await capturedOptions.queryFn({ signal });
    expect(jest.mocked(inviteService.getInvitesByRepublicId)).toHaveBeenCalledWith("rep-1", signal);
  });
});

// ─── useSendInviteMutation ────────────────────────────────────────────────────

describe("useSendInviteMutation", () => {
  let capturedOptions: any;

  beforeEach(() => {
    jest.mocked(useMutation).mockImplementation((options: any) => {
      capturedOptions = options;
      return { mutateAsync: jest.fn(), isPending: false, error: null } as any;
    });
  });

  it("mutationFn é inviteService.sendInvite", () => {
    renderHook(() => useSendInviteMutation());
    expect(capturedOptions.mutationFn).toBe(inviteService.sendInvite);
  });

  it("onSuccess usa invite.republicaId quando disponível", () => {
    renderHook(() => useSendInviteMutation());
    const payload = { email: "a@b.com", republicaId: "rep-payload" };
    capturedOptions.onSuccess(mockInvite, payload);
    expect(mockSetQueryData).toHaveBeenCalledWith(
      ["invites", "republic", "rep-1"],
      expect.any(Function)
    );
  });

  it("onSuccess usa payload.republicaId como fallback quando invite.republicaId é nulo", () => {
    renderHook(() => useSendInviteMutation());
    const inviteSemRepublica = { ...mockInvite, republicaId: null } as any;
    const payload = { email: "a@b.com", republicaId: "rep-payload" };
    capturedOptions.onSuccess(inviteSemRepublica, payload);
    expect(mockSetQueryData).toHaveBeenCalledWith(
      ["invites", "republic", "rep-payload"],
      expect.any(Function)
    );
  });

  it("updater: adiciona novo convite ao início quando lista está vazia (undefined)", () => {
    renderHook(() => useSendInviteMutation());
    capturedOptions.onSuccess(mockInvite, { email: "a@b.com", republicaId: "rep-1" });
    const updater = mockSetQueryData.mock.calls[0][1] as (prev: Invite[] | undefined) => Invite[];
    expect(updater(undefined)).toEqual([mockInvite]);
  });

  it("updater: adiciona novo convite ao início de uma lista existente", () => {
    renderHook(() => useSendInviteMutation());
    const existing: Invite = { ...mockInvite, id: "inv-other" };
    capturedOptions.onSuccess(mockInvite, { email: "a@b.com", republicaId: "rep-1" });
    const updater = mockSetQueryData.mock.calls[0][1] as (prev: Invite[] | undefined) => Invite[];
    expect(updater([existing])).toEqual([mockInvite, existing]);
  });

  it("updater: substitui convite existente com mesmo id", () => {
    renderHook(() => useSendInviteMutation());
    const updated: Invite = { ...mockInvite, status: StatusInvite.ACEITO };
    capturedOptions.onSuccess(updated, { email: "a@b.com", republicaId: "rep-1" });
    const updater = mockSetQueryData.mock.calls[0][1] as (prev: Invite[] | undefined) => Invite[];
    expect(updater([mockInvite])).toEqual([updated]);
  });

  it("updater: mantém convites com id diferente ao substituir um convite existente", () => {
    renderHook(() => useSendInviteMutation());
    const otherInvite: Invite = { ...mockInvite, id: "inv-other" };
    const updated: Invite = { ...mockInvite, status: StatusInvite.ACEITO };
    capturedOptions.onSuccess(updated, { email: "a@b.com", republicaId: "rep-1" });
    const updater = mockSetQueryData.mock.calls[0][1] as (prev: Invite[] | undefined) => Invite[];
    expect(updater([otherInvite, mockInvite])).toEqual([otherInvite, updated]);
  });
});

// ─── useUpdateInviteStatusMutation ───────────────────────────────────────────

describe("useUpdateInviteStatusMutation", () => {
  let capturedOptions: any;

  beforeEach(() => {
    jest.mocked(useMutation).mockImplementation((options: any) => {
      capturedOptions = options;
      return { mutateAsync: jest.fn(), isPending: false, error: null } as any;
    });
  });

  it("mutationFn chama inviteService.patchInviteStatus com inviteId e status", async () => {
    jest.mocked(inviteService.patchInviteStatus).mockResolvedValue({
      id: "inv-1",
      status: StatusInvite.ACEITO,
    });
    renderHook(() => useUpdateInviteStatusMutation());
    await capturedOptions.mutationFn({ inviteId: "inv-1", status: StatusInvite.ACEITO });
    expect(jest.mocked(inviteService.patchInviteStatus)).toHaveBeenCalledWith(
      "inv-1",
      StatusInvite.ACEITO
    );
  });

  it("onSuccess remove o convite correspondente da lista em cache", () => {
    const otherInvite: GetInvitesByUser = { ...mockInvite, id: "inv-other" };
    renderHook(() => useUpdateInviteStatusMutation());
    capturedOptions.onSuccess(undefined, { inviteId: "inv-1", status: StatusInvite.ACEITO });
    expect(mockSetQueryData).toHaveBeenCalledWith(
      ["invites", "me"],
      expect.any(Function)
    );
    const updater = mockSetQueryData.mock.calls[0][1] as (
      prev: GetInvitesByUser[] | undefined
    ) => GetInvitesByUser[];
    expect(
      updater([mockInvite as unknown as GetInvitesByUser, otherInvite])
    ).toEqual([otherInvite]);
  });

  it("onSuccess retorna lista vazia quando currentInvites é undefined", () => {
    renderHook(() => useUpdateInviteStatusMutation());
    capturedOptions.onSuccess(undefined, { inviteId: "inv-1", status: StatusInvite.ACEITO });
    const updater = mockSetQueryData.mock.calls[0][1] as (
      prev: GetInvitesByUser[] | undefined
    ) => GetInvitesByUser[];
    expect(updater(undefined)).toEqual([]);
  });
});

// ─── usePendingInvitesCount ───────────────────────────────────────────────────

describe("usePendingInvitesCount", () => {
  it("retorna 0 quando não há convites", () => {
    jest.mocked(useQuery).mockReturnValue({ data: [], error: null, refetch: mockRefetch } as any);
    const { result } = renderHook(() => usePendingInvitesCount());
    expect(result.current).toBe(0);
  });

  it("retorna 0 quando data é undefined", () => {
    jest.mocked(useQuery).mockReturnValue({ data: undefined, error: null, refetch: mockRefetch } as any);
    const { result } = renderHook(() => usePendingInvitesCount());
    expect(result.current).toBe(0);
  });

  it("conta apenas convites com status PENDENTE", () => {
    const invites: GetInvitesByUser[] = [
      { ...mockInvite, id: "1", status: StatusInvite.PENDENTE },
      { ...mockInvite, id: "2", status: StatusInvite.PENDENTE },
      { ...mockInvite, id: "3", status: StatusInvite.ACEITO },
      { ...mockInvite, id: "4", status: StatusInvite.RECUSADO },
    ];
    jest.mocked(useQuery).mockReturnValue({ data: invites, error: null, refetch: mockRefetch } as any);
    const { result } = renderHook(() => usePendingInvitesCount());
    expect(result.current).toBe(2);
  });
});

// ─── useInvitesContext ────────────────────────────────────────────────────────

const mockMutateAsyncSend = jest.fn();
const mockMutateAsyncUpdate = jest.fn();

function setupContextMocks({
  data,
  queryError = null as unknown,
  updateError = null as unknown,
  sendError = null as unknown,
  sendPending = false,
} = {}) {
  const resolvedData =
    Object.prototype.hasOwnProperty.call(arguments[0] ?? {}, "data")
      ? data
      : ([] as GetInvitesByUser[]);

  jest.mocked(useQuery).mockReturnValue({
    data: resolvedData,
    error: queryError,
    refetch: mockRefetch,
  } as any);

  // Diferencia as duas chamadas a useMutation pela referência do mutationFn:
  // - useSendInviteMutation passa inviteService.sendInvite diretamente
  // - useUpdateInviteStatusMutation passa uma arrow function inline
  jest.mocked(useMutation).mockImplementation((options: any) => {
    if (options.mutationFn === inviteService.sendInvite) {
      return {
        mutateAsync: mockMutateAsyncSend,
        isPending: sendPending,
        error: sendError,
      } as any;
    }
    return {
      mutateAsync: mockMutateAsyncUpdate,
      isPending: false,
      error: updateError,
    } as any;
  });
}

describe("useInvitesContext — estado inicial", () => {
  beforeEach(() => setupContextMocks());

  it("retorna invitesByUser vazio por padrão", () => {
    const { result } = renderHook(() => useInvitesContext());
    expect(result.current.invitesByUser).toEqual([]);
  });

  it("retorna invitesByUser vazio quando a query retorna data undefined", () => {
    setupContextMocks({ data: undefined });
    const { result } = renderHook(() => useInvitesContext());
    expect(result.current.invitesByUser).toEqual([]);
  });

  it("retorna invitesByUser com os dados da query", () => {
    const invites = [mockInvite] as unknown as GetInvitesByUser[];
    setupContextMocks({ data: invites });
    const { result } = renderHook(() => useInvitesContext());
    expect(result.current.invitesByUser).toEqual(invites);
  });

  it("calcula pendingCount corretamente", () => {
    const invites: GetInvitesByUser[] = [
      { ...mockInvite, id: "1", status: StatusInvite.PENDENTE },
      { ...mockInvite, id: "2", status: StatusInvite.PENDENTE },
      { ...mockInvite, id: "3", status: StatusInvite.ACEITO },
    ] as unknown as GetInvitesByUser[];
    setupContextMocks({ data: invites });
    const { result } = renderHook(() => useInvitesContext());
    expect(result.current.pendingCount).toBe(2);
  });

  it("error é null quando não há erros", () => {
    const { result } = renderHook(() => useInvitesContext());
    expect(result.current.error).toBeNull();
  });

  it("error é formatado quando a query falhou", () => {
    const error = new Error("fetch fail");
    jest.mocked(getErrorMessage).mockReturnValue("Não foi possível carregar os convites.");
    setupContextMocks({ queryError: error });
    const { result } = renderHook(() => useInvitesContext());
    expect(jest.mocked(getErrorMessage)).toHaveBeenCalledWith(
      error,
      "Não foi possível carregar os convites."
    );
    expect(result.current.error).toBe("Não foi possível carregar os convites.");
  });

  it("error é formatado quando updateInviteStatus falhou", () => {
    const error = new Error("update fail");
    jest.mocked(getErrorMessage).mockReturnValue("Não foi possível carregar os convites.");
    setupContextMocks({ updateError: error });
    const { result } = renderHook(() => useInvitesContext());
    expect(result.current.error).toBe("Não foi possível carregar os convites.");
  });

  it("sendLoading reflete isPending do sendInviteMutation", () => {
    setupContextMocks({ sendPending: true });
    const { result } = renderHook(() => useInvitesContext());
    expect(result.current.sendLoading).toBe(true);
  });

  it("sendError é null quando não há erro de envio", () => {
    const { result } = renderHook(() => useInvitesContext());
    expect(result.current.sendError).toBeNull();
  });

  it("sendError é formatado quando sendInviteMutation falhou", () => {
    const error = new Error("send fail");
    jest.mocked(getErrorMessage).mockReturnValue("Erro ao enviar convite.");
    setupContextMocks({ sendError: error });
    const { result } = renderHook(() => useInvitesContext());
    expect(result.current.sendError).toBe("Erro ao enviar convite.");
  });

  it("expõe todas as funções esperadas", () => {
    const { result } = renderHook(() => useInvitesContext());
    expect(typeof result.current.fetchInvitesByUser).toBe("function");
    expect(typeof result.current.handleAcceptInvite).toBe("function");
    expect(typeof result.current.handleRejectInvite).toBe("function");
    expect(typeof result.current.sendInvite).toBe("function");
  });
});

describe("useInvitesContext — fetchInvitesByUser", () => {
  beforeEach(() => setupContextMocks());

  it("chama refetch ao ser invocado", async () => {
    mockRefetch.mockResolvedValue(undefined);
    const { result } = renderHook(() => useInvitesContext());
    await act(async () => {
      await result.current.fetchInvitesByUser();
    });
    expect(mockRefetch).toHaveBeenCalledTimes(1);
  });
});

describe("useInvitesContext — handleAcceptInvite", () => {
  beforeEach(() => setupContextMocks());

  it("chama updateInviteStatus com ACEITO e navega para a república", async () => {
    mockMutateAsyncUpdate.mockResolvedValue(undefined);
    const { result } = renderHook(() => useInvitesContext());
    await act(async () => {
      await result.current.handleAcceptInvite("inv-1", "rep-1");
    });
    expect(mockMutateAsyncUpdate).toHaveBeenCalledWith({
      inviteId: "inv-1",
      status: StatusInvite.ACEITO,
    });
    expect(mockRouterReplace).toHaveBeenCalledWith("/(republics)/rep-1");
  });

  it("loga o erro e não navega quando updateInviteStatus falha", async () => {
    const error = new Error("update fail");
    mockMutateAsyncUpdate.mockRejectedValue(error);
    const { result } = renderHook(() => useInvitesContext());
    await act(async () => {
      await result.current.handleAcceptInvite("inv-1", "rep-1");
    });
    expect(consoleErrorSpy).toHaveBeenCalledWith("Erro ao aceitar convite:", error);
    expect(mockRouterReplace).not.toHaveBeenCalled();
    consoleErrorSpy.mockClear();
  });
});

describe("useInvitesContext — handleRejectInvite", () => {
  beforeEach(() => setupContextMocks());

  it("chama updateInviteStatus com RECUSADO", async () => {
    mockMutateAsyncUpdate.mockResolvedValue(undefined);
    const { result } = renderHook(() => useInvitesContext());
    await act(async () => {
      await result.current.handleRejectInvite("inv-1");
    });
    expect(mockMutateAsyncUpdate).toHaveBeenCalledWith({
      inviteId: "inv-1",
      status: StatusInvite.RECUSADO,
    });
  });

  it("loga o erro quando updateInviteStatus falha", async () => {
    const error = new Error("reject fail");
    mockMutateAsyncUpdate.mockRejectedValue(error);
    const { result } = renderHook(() => useInvitesContext());
    await act(async () => {
      await result.current.handleRejectInvite("inv-1");
    });
    expect(consoleErrorSpy).toHaveBeenCalledWith("Erro ao recusar convite:", error);
    consoleErrorSpy.mockClear();
  });
});

describe("useInvitesContext — sendInvite", () => {
  beforeEach(() => setupContextMocks());

  it("chama sendInviteAsync com o payload correto", async () => {
    mockMutateAsyncSend.mockResolvedValue(mockInvite);
    const { result } = renderHook(() => useInvitesContext());
    const payload = { email: "a@b.com", republicaId: "rep-1" };
    await act(async () => {
      await result.current.sendInvite(payload);
    });
    expect(mockMutateAsyncSend).toHaveBeenCalledWith(payload);
  });
});
