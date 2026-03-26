import { act, renderHook } from "@testing-library/react-native";
import { useRefresh } from "@/src/shared/contexts/RefreshContext";
import { useAccountResidents } from "../../useAccountResidents";
import { useAccountData } from "../useAccountData";
import { useAccountDerivedData } from "../useAccountDerivedData";
import { useAccountFilters } from "../useAccountFilters";
import { useAccountList } from "..";

jest.mock("../useAccountData", () => ({
  useAccountData: jest.fn(),
}));
jest.mock("../useAccountFilters", () => ({
  useAccountFilters: jest.fn(),
}));
jest.mock("../useAccountDerivedData", () => ({
  useAccountDerivedData: jest.fn(),
}));
jest.mock("../../useAccountResidents", () => ({
  useAccountResidents: jest.fn(),
}));
jest.mock("@/src/shared/contexts/RefreshContext", () => ({
  useRefresh: jest.fn(),
}));

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const mockFetchAccounts = jest.fn();
const mockFetchAccountResidents = jest.fn();
const mockLoadResidents = jest.fn();
const mockConfirmResidentPayment = jest.fn();
const mockRegisterRefresh = jest.fn();
const mockSetMesSelecionado = jest.fn();
const mockSetMostrarContasAbertas = jest.fn();
const mockSetMostrarContasPagas = jest.fn();

function setupMocks() {
  jest.mocked(useAccountData).mockReturnValue({
    contas: [],
    loading: false,
    error: null,
    fetchAccounts: mockFetchAccounts,
    fetchAccountResidents: mockFetchAccountResidents,
  });

  jest.mocked(useAccountFilters).mockReturnValue({
    mesSelecionado: "todos",
    mostrarContasAbertas: true,
    mostrarContasPagas: false,
    setMesSelecionado: mockSetMesSelecionado,
    setMostrarContasAbertas: mockSetMostrarContasAbertas,
    setMostrarContasPagas: mockSetMostrarContasPagas,
  });

  jest.mocked(useAccountDerivedData).mockReturnValue({
    mesesDisponiveis: [],
    contasOrdenadas: { abertas: [], pagas: [] },
  });

  jest.mocked(useAccountResidents).mockReturnValue({
    accountResidentsById: {},
    loadingResidentsById: {},
    errorResidentsById: {},
    updatingResidentById: {},
    loadResidents: mockLoadResidents,
    confirmResidentPayment: mockConfirmResidentPayment,
  } as any);

  jest.mocked(useRefresh).mockReturnValue({
    refreshAll: jest.fn(),
    refreshing: false,
    onRefresh: jest.fn(),
    registerRefresh: mockRegisterRefresh.mockReturnValue(() => {}),
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

// ─── useAccountList ───────────────────────────────────────────────────────────

describe("useAccountList — composição dos sub-hooks", () => {
  it("passa republicId para useAccountData", () => {
    renderHook(() => useAccountList({ republicId: "rep-42" }));
    expect(jest.mocked(useAccountData)).toHaveBeenCalledWith({
      republicId: "rep-42",
    });
  });

  it("passa fetchAccountResidents para useAccountResidents", () => {
    renderHook(() => useAccountList({ republicId: "rep-1" }));
    expect(jest.mocked(useAccountResidents)).toHaveBeenCalledWith({
      fetchAccountResidents: mockFetchAccountResidents,
    });
  });

  it("passa contas e mesSelecionado para useAccountDerivedData", () => {
    renderHook(() => useAccountList({ republicId: "rep-1" }));
    expect(jest.mocked(useAccountDerivedData)).toHaveBeenCalledWith({
      contas: [],
      mesSelecionado: "todos",
    });
  });
});

describe("useAccountList — estado retornado", () => {
  it("expõe loading e error de useAccountData", () => {
    jest.mocked(useAccountData).mockReturnValue({
      contas: [],
      loading: true,
      error: new Error("fail"),
      fetchAccounts: mockFetchAccounts,
      fetchAccountResidents: mockFetchAccountResidents,
    });

    const { result } = renderHook(() =>
      useAccountList({ republicId: "rep-1" })
    );

    expect(result.current.loading).toBe(true);
    expect(result.current.error).toBeInstanceOf(Error);
  });

  it("expõe os filtros de useAccountFilters", () => {
    jest.mocked(useAccountFilters).mockReturnValue({
      mesSelecionado: "2026-03",
      mostrarContasAbertas: false,
      mostrarContasPagas: true,
      setMesSelecionado: mockSetMesSelecionado,
      setMostrarContasAbertas: mockSetMostrarContasAbertas,
      setMostrarContasPagas: mockSetMostrarContasPagas,
    });

    const { result } = renderHook(() =>
      useAccountList({ republicId: "rep-1" })
    );

    expect(result.current.mesSelecionado).toBe("2026-03");
    expect(result.current.mostrarContasAbertas).toBe(false);
    expect(result.current.mostrarContasPagas).toBe(true);
    expect(result.current.setMesSelecionado).toBe(mockSetMesSelecionado);
  });

  it("expõe contasOrdenadas e mesesDisponiveis de useAccountDerivedData", () => {
    const contasOrdenadas = { abertas: [], pagas: [] };
    const mesesDisponiveis = ["2026-01", "2026-03"];
    jest.mocked(useAccountDerivedData).mockReturnValue({
      mesesDisponiveis,
      contasOrdenadas,
    });

    const { result } = renderHook(() =>
      useAccountList({ republicId: "rep-1" })
    );

    expect(result.current.mesesDisponiveis).toBe(mesesDisponiveis);
    expect(result.current.contasOrdenadas).toBe(contasOrdenadas);
  });

  it("expõe accountResidentsById e confirmResidentPayment de useAccountResidents", () => {
    const accountResidentsById = { "acc-1": [] };
    jest.mocked(useAccountResidents).mockReturnValue({
      accountResidentsById,
      loadingResidentsById: {},
      errorResidentsById: {},
      updatingResidentById: {},
      loadResidents: mockLoadResidents,
      confirmResidentPayment: mockConfirmResidentPayment,
    } as any);

    const { result } = renderHook(() =>
      useAccountList({ republicId: "rep-1" })
    );

    expect(result.current.accountResidentsById).toBe(accountResidentsById);
    expect(result.current.confirmResidentPayment).toBe(
      mockConfirmResidentPayment
    );
  });
});

describe("useAccountList — refresh automático ao montar", () => {
  it("chama fetchAccounts ao montar", async () => {
    mockFetchAccounts.mockResolvedValue([]);
    mockLoadResidents.mockResolvedValue(undefined);

    renderHook(() => useAccountList({ republicId: "rep-1" }));
    await act(async () => {});

    expect(mockFetchAccounts).toHaveBeenCalledTimes(1);
  });

  it("passa o resultado de fetchAccounts para loadResidents", async () => {
    const contas = [{ id: "acc-1" }] as any;
    mockFetchAccounts.mockResolvedValue(contas);
    mockLoadResidents.mockResolvedValue(undefined);

    renderHook(() => useAccountList({ republicId: "rep-1" }));
    await act(async () => {});

    expect(mockLoadResidents).toHaveBeenCalledWith(contas);
  });
});

describe("useAccountList — registro no RefreshContext", () => {
  it("registra refresh com chave contendo republicId", async () => {
    mockFetchAccounts.mockResolvedValue([]);
    mockLoadResidents.mockResolvedValue(undefined);

    renderHook(() => useAccountList({ republicId: "rep-99" }));
    await act(async () => {});

    expect(mockRegisterRefresh).toHaveBeenCalledWith(
      expect.stringContaining("accounts-rep-99-"),
      expect.any(Function)
    );
  });

  it("a função registrada chama fetchAccounts e loadResidents quando invocada", async () => {
    mockFetchAccounts.mockResolvedValue([]);
    mockLoadResidents.mockResolvedValue(undefined);

    renderHook(() => useAccountList({ republicId: "rep-1" }));
    await act(async () => {});

    // Captura e invoca a função registrada
    const registeredRefresh = mockRegisterRefresh.mock
      .calls[0][1] as () => Promise<void>;
    mockFetchAccounts.mockClear();
    mockLoadResidents.mockClear();

    await act(async () => {
      await registeredRefresh();
    });

    expect(mockFetchAccounts).toHaveBeenCalledTimes(1);
    expect(mockLoadResidents).toHaveBeenCalledTimes(1);
  });
});

describe("useAccountList — refresh público", () => {
  it("refresh chama fetchAccounts e depois loadResidents", async () => {
    const contas = [{ id: "acc-1" }] as any;
    mockFetchAccounts.mockResolvedValue(contas);
    mockLoadResidents.mockResolvedValue(undefined);

    const { result } = renderHook(() =>
      useAccountList({ republicId: "rep-1" })
    );
    await act(async () => {}); // flush mount effect

    mockFetchAccounts.mockClear();
    mockLoadResidents.mockClear();

    await act(async () => {
      await result.current.refresh();
    });

    expect(mockFetchAccounts).toHaveBeenCalledTimes(1);
    expect(mockLoadResidents).toHaveBeenCalledWith(contas);
  });
});
