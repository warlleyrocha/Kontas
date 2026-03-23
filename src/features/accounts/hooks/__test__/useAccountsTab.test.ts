import { act, renderHook } from "@testing-library/react-native";
import { MetodoPagamento } from "../../types/account.types";
import { useAccountActions } from "../useAccountActions";
import { useAccountExpansion } from "../useAccountExpansion";
import { useAccountList } from "../useAccountList";
import { useAccountsTab } from "../useAccountsTab";

jest.mock("../useAccountList", () => ({ useAccountList: jest.fn() }));
jest.mock("../useAccountExpansion", () => ({ useAccountExpansion: jest.fn() }));
jest.mock("../useAccountActions", () => ({ useAccountActions: jest.fn() }));

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const mockRefresh = jest.fn();
const mockSetShowAccountModal = jest.fn();
const mockSetMesSelecionado = jest.fn();
const mockSetMostrarContasAbertas = jest.fn();
const mockSetMostrarContasPagas = jest.fn();
const mockHandleToggleExpand = jest.fn();
const mockHandleSubmit = jest.fn();
const mockHandleDelete = jest.fn();
const mockHandlePatch = jest.fn();
const mockConfirmResidentPayment = jest.fn();

function setupMocks({
  mostrarContasAbertas = true,
  mostrarContasPagas = true,
  abertas = [] as any[],
  pagas = [] as any[],
  showAccountModal = false,
} = {}) {
  jest.mocked(useAccountList).mockReturnValue({
    refresh: mockRefresh,
    contasOrdenadas: { abertas, pagas },
    mesesDisponiveis: [],
    mesSelecionado: null,
    mostrarContasAbertas,
    mostrarContasPagas,
    loading: false,
    error: null,
    setMesSelecionado: mockSetMesSelecionado,
    setMostrarContasPagas: mockSetMostrarContasPagas,
    setMostrarContasAbertas: mockSetMostrarContasAbertas,
    accountResidentsById: {},
    loadingResidentsById: {},
    errorResidentsById: {},
    updatingResidentById: {},
    confirmResidentPayment: mockConfirmResidentPayment,
  } as any);

  jest.mocked(useAccountExpansion).mockReturnValue({
    expandedAccountId: null,
    handleToggleExpand: mockHandleToggleExpand,
  });

  jest.mocked(useAccountActions).mockReturnValue({
    showAccountModal,
    setShowAccountModal: mockSetShowAccountModal,
    isSubmitting: false,
    isDeleting: false,
    isUpdating: false,
    handleSubmit: mockHandleSubmit,
    handleDelete: mockHandleDelete,
    handlePatch: mockHandlePatch,
    handleRecovery: jest.fn(),
    fetchContasPorMorador: jest.fn(),
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
  expect(consoleErrorSpy).not.toHaveBeenCalled();
  consoleErrorSpy.mockRestore();
});

// ─── useAccountsTab ───────────────────────────────────────────────────────────

describe("useAccountsTab — estado inicial", () => {
  it("expõe todas as propriedades esperadas", () => {
    const { result } = renderHook(() =>
      useAccountsTab({ republicId: "rep-1" })
    );
    expect(result.current).toMatchObject({
      contasOrdenadas: { abertas: [], pagas: [] },
      expandedAccountId: null,
      showAccountModal: false,
      loading: false,
      error: null,
    });
  });

  it("repassa useAccountList com o republicId correto", () => {
    renderHook(() => useAccountsTab({ republicId: "rep-42" }));
    expect(jest.mocked(useAccountList)).toHaveBeenCalledWith({
      republicId: "rep-42",
    });
  });

  it("repassa useAccountExpansion com o republicId correto", () => {
    renderHook(() => useAccountsTab({ republicId: "rep-42" }));
    expect(jest.mocked(useAccountExpansion)).toHaveBeenCalledWith({
      republicId: "rep-42",
    });
  });

  it("repassa useAccountActions com onRefresh=refresh", () => {
    renderHook(() => useAccountsTab({ republicId: "rep-1" }));
    expect(jest.mocked(useAccountActions)).toHaveBeenCalledWith({
      onRefresh: mockRefresh,
    });
  });
});

describe("useAccountsTab — hasNoAccounts", () => {
  it("é true quando abertas e pagas estão vazias", () => {
    setupMocks({ abertas: [], pagas: [] });
    const { result } = renderHook(() =>
      useAccountsTab({ republicId: "rep-1" })
    );
    expect(result.current.hasNoAccounts).toBe(true);
  });

  it("é false quando há contas abertas", () => {
    setupMocks({ abertas: [{ id: "acc-1" }], pagas: [] });
    const { result } = renderHook(() =>
      useAccountsTab({ republicId: "rep-1" })
    );
    expect(result.current.hasNoAccounts).toBe(false);
  });

  it("é false quando há contas pagas", () => {
    setupMocks({ abertas: [], pagas: [{ id: "acc-2" }] });
    const { result } = renderHook(() =>
      useAccountsTab({ republicId: "rep-1" })
    );
    expect(result.current.hasNoAccounts).toBe(false);
  });
});

describe("useAccountsTab — openAccountModal / closeAccountModal", () => {
  it("openAccountModal chama setShowAccountModal(true)", () => {
    const { result } = renderHook(() =>
      useAccountsTab({ republicId: "rep-1" })
    );
    act(() => {
      result.current.openAccountModal();
    });
    expect(mockSetShowAccountModal).toHaveBeenCalledWith(true);
  });

  it("closeAccountModal chama setShowAccountModal(false)", () => {
    const { result } = renderHook(() =>
      useAccountsTab({ republicId: "rep-1" })
    );
    act(() => {
      result.current.closeAccountModal();
    });
    expect(mockSetShowAccountModal).toHaveBeenCalledWith(false);
  });
});

describe("useAccountsTab — toggleOpenAccounts / togglePaidAccounts", () => {
  it("toggleOpenAccounts inverte mostrarContasAbertas (true → false)", () => {
    setupMocks({ mostrarContasAbertas: true });
    const { result } = renderHook(() =>
      useAccountsTab({ republicId: "rep-1" })
    );
    act(() => {
      result.current.toggleOpenAccounts();
    });
    expect(mockSetMostrarContasAbertas).toHaveBeenCalledWith(false);
  });

  it("toggleOpenAccounts inverte mostrarContasAbertas (false → true)", () => {
    setupMocks({ mostrarContasAbertas: false });
    const { result } = renderHook(() =>
      useAccountsTab({ republicId: "rep-1" })
    );
    act(() => {
      result.current.toggleOpenAccounts();
    });
    expect(mockSetMostrarContasAbertas).toHaveBeenCalledWith(true);
  });

  it("togglePaidAccounts inverte mostrarContasPagas (true → false)", () => {
    setupMocks({ mostrarContasPagas: true });
    const { result } = renderHook(() =>
      useAccountsTab({ republicId: "rep-1" })
    );
    act(() => {
      result.current.togglePaidAccounts();
    });
    expect(mockSetMostrarContasPagas).toHaveBeenCalledWith(false);
  });

  it("togglePaidAccounts inverte mostrarContasPagas (false → true)", () => {
    setupMocks({ mostrarContasPagas: false });
    const { result } = renderHook(() =>
      useAccountsTab({ republicId: "rep-1" })
    );
    act(() => {
      result.current.togglePaidAccounts();
    });
    expect(mockSetMostrarContasPagas).toHaveBeenCalledWith(true);
  });
});

describe("useAccountsTab — handlePatchAndRefresh", () => {
  it("chama handlePatch e depois refresh", async () => {
    mockHandlePatch.mockResolvedValue(undefined);
    mockRefresh.mockResolvedValue(undefined);

    const { result } = renderHook(() =>
      useAccountsTab({ republicId: "rep-1" })
    );

    await act(async () => {
      await result.current.handlePatchAndRefresh("acc-1", MetodoPagamento.PIX);
    });

    expect(mockHandlePatch).toHaveBeenCalledWith("acc-1", MetodoPagamento.PIX);
    expect(mockRefresh).toHaveBeenCalledTimes(1);
  });

  it("chama handlePatch antes de refresh (ordem garantida)", async () => {
    const callOrder: string[] = [];
    mockHandlePatch.mockImplementation(async () => {
      callOrder.push("patch");
    });
    mockRefresh.mockImplementation(async () => {
      callOrder.push("refresh");
    });

    const { result } = renderHook(() =>
      useAccountsTab({ republicId: "rep-1" })
    );

    await act(async () => {
      await result.current.handlePatchAndRefresh(
        "acc-1",
        MetodoPagamento.DINHEIRO
      );
    });

    expect(callOrder).toEqual(["patch", "refresh"]);
  });
});
