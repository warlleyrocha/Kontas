import { act, renderHook } from "@testing-library/react-native";
import { setStringAsync } from "expo-clipboard";
import {
  ResidentRole,
  type ResidentResponse,
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

    await act(async () => {
      await result.current.copiarChavePix(moradorSemPix);
    });

    expect(jest.mocked(showToast.error)).toHaveBeenCalledWith(
      "Morador não possui chave PIX cadastrada."
    );
    expect(setStringAsync).not.toHaveBeenCalled();
  });

  it("copia a chave e exibe toast de info quando chavePix está definida", async () => {
    const { result } = renderHook(() => useTabResidents());

    await act(async () => {
      await result.current.copiarChavePix(moradorComPix);
    });

    expect(setStringAsync).toHaveBeenCalledWith("ana@pix");
    expect(jest.mocked(showToast.info)).toHaveBeenCalledWith(
      "Chave copiada para a área de transferência."
    );
    expect(jest.mocked(showToast.error)).not.toHaveBeenCalled();
  });
});
