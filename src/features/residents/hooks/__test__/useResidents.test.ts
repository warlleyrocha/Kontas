import { act, renderHook } from "@testing-library/react-native";
import {
  ResidentRole,
  type ResidentResponse,
} from "@/src/shared/types/resident.types";
import { useResidentsByRepublicQuery } from "../useResidentQueries";
import { useResidents } from "../useResidents";

jest.mock("../useResidentQueries");
jest.mock("@/src/features/user/hooks/useUserQueries", () => ({
  useCurrentUserQuery: jest.fn(),
}));
jest.mock("@/src/features/residents/services/resident.service", () => ({
  residentService: { getResidents: jest.fn() },
}));

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const mockResident: ResidentResponse = {
  id: "r-1",
  nome: "Ana",
  email: "ana@email.com",
  fotoPerfil: null,
  chavePix: null,
  telefone: null,
  role: ResidentRole.USER,
};

const mockRefetch = jest.fn();

function mockQuery(overrides: object = {}) {
  jest.mocked(useResidentsByRepublicQuery).mockReturnValue({
    data: [],
    isFetching: false,
    refetch: mockRefetch,
    ...overrides,
  } as any);
}

// ─── Setup ────────────────────────────────────────────────────────────────────

beforeEach(() => {
  jest.clearAllMocks();
  mockQuery();
});

// ─── useResidents ─────────────────────────────────────────────────────────────

describe("useResidents — estado inicial", () => {
  it("inicia com residents=[] e isLoading=false", () => {
    const { result } = renderHook(() => useResidents("rep-1"));

    expect(result.current.residents).toEqual([]);
    expect(result.current.isLoading).toBe(false);
  });

  it("passa republicId para useResidentsByRepublicQuery", () => {
    renderHook(() => useResidents("rep-42"));

    expect(jest.mocked(useResidentsByRepublicQuery)).toHaveBeenCalledWith(
      "rep-42"
    );
  });
});

describe("useResidents — dados da query", () => {
  it("repassa residents quando a query retorna dados", () => {
    mockQuery({ data: [mockResident] });

    const { result } = renderHook(() => useResidents("rep-1"));

    expect(result.current.residents).toEqual([mockResident]);
  });

  it("usa [] como fallback quando data for undefined", () => {
    mockQuery({ data: undefined });

    const { result } = renderHook(() => useResidents("rep-1"));

    expect(result.current.residents).toEqual([]);
  });

  it("repassa isFetching como isLoading", () => {
    mockQuery({ isFetching: true });

    const { result } = renderHook(() => useResidents("rep-1"));

    expect(result.current.isLoading).toBe(true);
  });
});

describe("useResidents — fetchResidents", () => {
  it("chama refetch e retorna os dados ao resolver com sucesso", async () => {
    mockRefetch.mockResolvedValue({ data: [mockResident] });

    const { result } = renderHook(() => useResidents("rep-1"));

    let returned: ResidentResponse[] | null | undefined;
    await act(async () => {
      returned = await result.current.fetchResidents();
    });

    expect(mockRefetch).toHaveBeenCalled();
    expect(returned).toEqual([mockResident]);
  });

  it("retorna null quando refetch resolve com data undefined", async () => {
    mockRefetch.mockResolvedValue({ data: undefined });

    const { result } = renderHook(() => useResidents("rep-1"));

    let returned: ResidentResponse[] | null | undefined;
    await act(async () => {
      returned = await result.current.fetchResidents();
    });

    expect(returned).toBeNull();
  });
});
