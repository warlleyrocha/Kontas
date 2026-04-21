import { act, renderHook } from "@testing-library/react-native";
import { setStringAsync } from "expo-clipboard";
import {
  type ResidentResponse,
  ResidentRole,
} from "@/src/shared/types/resident.types";
import { showToast } from "@/src/shared/utils/showToast";
import { useTabResidents } from "../useTabResidents";

jest.mock("expo-clipboard", () => ({
  setStringAsync: jest.fn(),
}));

jest.mock("@/src/shared/utils/showToast", () => ({
  showToast: { error: jest.fn(), info: jest.fn() },
}));

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const moradorComPix: ResidentResponse = {
  id: "r-1",
  nome: "Ana",
  email: "ana@email.com",
  fotoPerfil: null,
  chavePix: "ana@pix",
  telefone: null,
  role: ResidentRole.USER,
};

const moradorSemPix: ResidentResponse = {
  ...moradorComPix,
  chavePix: null,
};

// ─── Setup ────────────────────────────────────────────────────────────────────

beforeEach(() => {
  jest.clearAllMocks();
  jest.mocked(setStringAsync).mockResolvedValue();
});

// ─── useTabResidents ──────────────────────────────────────────────────────────

describe("useTabResidents — copiarChavePix", () => {
  it("exibe toast de erro quando chavePix é null", async () => {
    const { result } = renderHook(() => useTabResidents());
    let copied = true;

    await act(async () => {
      copied = await result.current.copiarChavePix(moradorSemPix);
    });

    expect(copied).toBe(false);
    expect(jest.mocked(showToast.error)).toHaveBeenCalledWith(
      "Morador não possui chave PIX cadastrada."
    );
    expect(setStringAsync).not.toHaveBeenCalled();
  });

  it("copia a chave sem exibir toast de sucesso quando chavePix está definida", async () => {
    const { result } = renderHook(() => useTabResidents());
    let copied = false;

    await act(async () => {
      copied = await result.current.copiarChavePix(moradorComPix);
    });

    expect(copied).toBe(true);
    expect(setStringAsync).toHaveBeenCalledWith("ana@pix");
    expect(jest.mocked(showToast.info)).not.toHaveBeenCalled();
    expect(jest.mocked(showToast.error)).not.toHaveBeenCalled();
  });

  it("retorna false e exibe erro quando a cópia falha", async () => {
    jest.mocked(setStringAsync).mockRejectedValueOnce(new Error("clipboard"));
    const { result } = renderHook(() => useTabResidents());
    let copied = true;

    await act(async () => {
      copied = await result.current.copiarChavePix(moradorComPix);
    });

    expect(copied).toBe(false);
    expect(jest.mocked(showToast.error)).toHaveBeenCalledWith(
      "Não foi possível copiar a chave PIX."
    );
    expect(jest.mocked(showToast.info)).not.toHaveBeenCalled();
  });
});
