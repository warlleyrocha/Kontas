import { act, renderHook } from "@testing-library/react-native";
import { residentService } from "@/src/features/residents/services/resident.service";
import { getErrorMessage } from "@/src/services/httpError";
import {
  ResidentRole,
  type ResidentResponse,
} from "@/src/shared/types/resident.types";
import { showToast } from "@/src/shared/utils/showToast";
import { useResidents } from "../useResidents";

jest.mock("@/src/features/residents/services/resident.service", () => ({
  residentService: { getResidents: jest.fn() },
}));

jest.mock("@/src/services/httpError", () => ({
  getErrorMessage: jest.fn(),
}));

jest.mock("@/src/shared/utils/showToast", () => ({
  showToast: { error: jest.fn() },
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

// ─── Setup ────────────────────────────────────────────────────────────────────

let consoleErrorSpy: jest.SpyInstance;

beforeEach(() => {
  jest.clearAllMocks();
  jest.mocked(getErrorMessage).mockImplementation((_err, fallback) => fallback ?? "erro");
  consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  consoleErrorSpy.mockRestore();
});

// ─── useResidents ─────────────────────────────────────────────────────────────

describe("useResidents — estado inicial", () => {
  it("inicia com residents=[] e isLoading=false", () => {
    const { result } = renderHook(() => useResidents());

    expect(result.current.residents).toEqual([]);
    expect(result.current.isLoading).toBe(false);
  });
});

describe("useResidents — fetchResidents (sucesso)", () => {
  it("define isLoading=true durante a busca e false ao finalizar", async () => {
    let resolve!: (v: ResidentResponse[]) => void;
    jest.mocked(residentService.getResidents).mockReturnValue(
      new Promise((r) => (resolve = r))
    );

    const { result } = renderHook(() => useResidents());

    act(() => {
      result.current.fetchResidents("rep-1");
    });

    expect(result.current.isLoading).toBe(true);

    await act(async () => {
      resolve([mockResident]);
    });

    expect(result.current.isLoading).toBe(false);
  });

  it("atualiza residents com os dados retornados", async () => {
    jest.mocked(residentService.getResidents).mockResolvedValue([mockResident]);

    const { result } = renderHook(() => useResidents());

    await act(async () => {
      await result.current.fetchResidents("rep-1");
    });

    expect(result.current.residents).toEqual([mockResident]);
  });

  it("retorna os dados ao resolver com sucesso", async () => {
    jest.mocked(residentService.getResidents).mockResolvedValue([mockResident]);

    const { result } = renderHook(() => useResidents());

    let returned: ResidentResponse[] | null | undefined;
    await act(async () => {
      returned = await result.current.fetchResidents("rep-1");
    });

    expect(returned).toEqual([mockResident]);
  });
});

describe("useResidents — fetchResidents (erro)", () => {
  it("loga o erro, exibe toast e retorna null ao falhar", async () => {
    const error = new Error("fail");
    jest.mocked(residentService.getResidents).mockRejectedValue(error);
    jest.mocked(getErrorMessage).mockReturnValue("Não foi possível carregar os moradores.");

    const { result } = renderHook(() => useResidents());

    let returned: ResidentResponse[] | null | undefined;
    await act(async () => {
      returned = await result.current.fetchResidents("rep-1");
    });

    expect(consoleErrorSpy).toHaveBeenCalledWith("Erro ao buscar moradores:", error);
    expect(jest.mocked(showToast.error)).toHaveBeenCalledWith(
      "Não foi possível carregar os moradores."
    );
    expect(returned).toBeNull();
    consoleErrorSpy.mockClear();
  });

  it("define isLoading=false no finally mesmo ao falhar", async () => {
    jest.mocked(residentService.getResidents).mockRejectedValue(new Error("fail"));

    const { result } = renderHook(() => useResidents());

    await act(async () => {
      await result.current.fetchResidents("rep-1");
    });

    expect(result.current.isLoading).toBe(false);
    consoleErrorSpy.mockClear();
  });
});

describe("useResidents — setResidents", () => {
  it("atualiza residents diretamente", () => {
    const { result } = renderHook(() => useResidents());

    act(() => {
      result.current.setResidents([mockResident]);
    });

    expect(result.current.residents).toEqual([mockResident]);
  });
});
