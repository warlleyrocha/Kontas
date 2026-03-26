import { act, renderHook } from "@testing-library/react-native";
import {
  ResidentRole,
  type ResidentResponse,
} from "@/src/shared/types/resident.types";
import { useResidentCard } from "../useResidentCard";

jest.mock("react-native-reanimated", () =>
  jest.requireActual("react-native-reanimated/mock")
);

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const mockMorador: ResidentResponse = {
  id: "r-1",
  nome: "Ana Silva",
  email: "ana@email.com",
  fotoPerfil: null,
  chavePix: "ana@pix",
  telefone: null,
  role: ResidentRole.USER,
};

const onCopyPix = jest.fn(() => true);

beforeEach(() => {
  jest.clearAllMocks();
  jest.useFakeTimers();
});

afterEach(() => {
  jest.useRealTimers();
});

// ─── useResidentCard ──────────────────────────────────────────────────────────

describe("useResidentCard — estado inicial", () => {
  it("inicia com expanded=false, feedback idle e imageError=false", () => {
    const { result } = renderHook(() =>
      useResidentCard(mockMorador, onCopyPix)
    );

    expect(result.current.expanded).toBe(false);
    expect(result.current.copyFeedback.accessibilityLabel).toBe(
      "Copiar chave PIX"
    );
    expect(result.current.imageError).toBe(false);
  });

  it("expõe animatedStyle, toggleExpanded, handleCopyPix e setImageError", () => {
    const { result } = renderHook(() =>
      useResidentCard(mockMorador, onCopyPix)
    );

    expect(result.current.animatedStyle).toBeDefined();
    expect(typeof result.current.toggleExpanded).toBe("function");
    expect(typeof result.current.handleCopyPix).toBe("function");
    expect(typeof result.current.setImageError).toBe("function");
  });
});

describe("useResidentCard — toggleExpanded", () => {
  it("alterna expanded de false para true", () => {
    const { result } = renderHook(() =>
      useResidentCard(mockMorador, onCopyPix)
    );

    act(() => {
      result.current.toggleExpanded();
    });

    expect(result.current.expanded).toBe(true);
  });

  it("alterna expanded de true para false na segunda chamada", () => {
    const { result } = renderHook(() =>
      useResidentCard(mockMorador, onCopyPix)
    );

    act(() => {
      result.current.toggleExpanded();
    });
    act(() => {
      result.current.toggleExpanded();
    });

    expect(result.current.expanded).toBe(false);
  });
});

describe("useResidentCard — handleCopyPix", () => {
  it("chama onCopyPix com o morador e define feedback de sucesso", async () => {
    const { result } = renderHook(() =>
      useResidentCard(mockMorador, onCopyPix)
    );

    await act(async () => {
      await result.current.handleCopyPix();
    });

    expect(onCopyPix).toHaveBeenCalledWith(mockMorador);
    expect(result.current.copyFeedback.accessibilityLabel).toBe(
      "Chave PIX copiada"
    );
  });

  it("redefine o status para idle após 2000ms", async () => {
    const { result } = renderHook(() =>
      useResidentCard(mockMorador, onCopyPix)
    );

    await act(async () => {
      await result.current.handleCopyPix();
    });

    expect(result.current.copyFeedback.accessibilityLabel).toBe(
      "Chave PIX copiada"
    );

    act(() => {
      jest.advanceTimersByTime(2000);
    });

    expect(result.current.copyFeedback.accessibilityLabel).toBe(
      "Copiar chave PIX"
    );
  });

  it("define feedback de erro quando a cópia falha", async () => {
    const onCopyPixWithFailure = jest.fn(async () => false);
    const { result } = renderHook(() =>
      useResidentCard(mockMorador, onCopyPixWithFailure)
    );

    await act(async () => {
      await result.current.handleCopyPix();
    });

    expect(onCopyPixWithFailure).toHaveBeenCalledWith(mockMorador);
    expect(result.current.copyFeedback.accessibilityLabel).toBe(
      "Falha ao copiar chave PIX"
    );
  });
});

describe("useResidentCard — setImageError", () => {
  it("atualiza imageError para true", () => {
    const { result } = renderHook(() =>
      useResidentCard(mockMorador, onCopyPix)
    );

    act(() => {
      result.current.setImageError(true);
    });

    expect(result.current.imageError).toBe(true);
  });
});

describe("useResidentCard — cleanup", () => {
  it("limpa o timeout ao desmontar sem lançar erros", async () => {
    const { result, unmount } = renderHook(() =>
      useResidentCard(mockMorador, onCopyPix)
    );

    await act(async () => {
      await result.current.handleCopyPix();
    });

    expect(() => unmount()).not.toThrow();
  });
});
