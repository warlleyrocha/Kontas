import AsyncStorage from "@react-native-async-storage/async-storage";
import { act, renderHook } from "@testing-library/react-native";
import {
  launchImageLibraryAsync,
  requestMediaLibraryPermissionsAsync,
} from "expo-image-picker";
import { Alert } from "react-native";
import { getErrorMessage } from "@/src/services/httpError";
import { showToast } from "@/src/shared/utils/showToast";
import useEditRepublicModal from "../useEditRepublicModal";

jest.mock("@react-native-async-storage/async-storage", () => ({
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

jest.mock("expo-image-picker", () => ({
  launchImageLibraryAsync: jest.fn(),
  requestMediaLibraryPermissionsAsync: jest.fn(),
}));

jest.mock("@/src/services/httpError", () => ({
  getErrorMessage: jest.fn(),
}));

jest.mock("@/src/shared/utils/showToast", () => ({
  showToast: { error: jest.fn() },
}));

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const defaultProps = {
  visible: true,
  currentName: "Alpha",
  currentImage: undefined as string | undefined,
  onClose: jest.fn(),
  onSave: jest.fn(),
};

const serializeError = (error: Error) =>
  JSON.stringify(error, Object.getOwnPropertyNames(error), 2);

// ─── Setup ────────────────────────────────────────────────────────────────────

let consoleErrorSpy: jest.SpyInstance;
let alertSpy: jest.SpyInstance;

beforeEach(() => {
  jest.clearAllMocks();
  jest
    .mocked(getErrorMessage)
    .mockImplementation((_err, fallback) => fallback ?? "erro");
  jest.mocked(AsyncStorage.setItem).mockResolvedValue(undefined);
  jest.mocked(AsyncStorage.removeItem).mockResolvedValue(undefined);
  consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
  alertSpy = jest.spyOn(Alert, "alert").mockImplementation(() => {});
});

afterEach(() => {
  consoleErrorSpy.mockRestore();
  alertSpy.mockRestore();
});

// ─── estado inicial ───────────────────────────────────────────────────────────

describe("useEditRepublicModal — estado inicial", () => {
  it("inicializa com nome, imagemUri e isUploading corretos", () => {
    const { result } = renderHook(() => useEditRepublicModal(defaultProps));

    expect(result.current.nome).toBe("Alpha");
    expect(result.current.imagemUri).toBeUndefined();
    expect(result.current.isUploading).toBe(false);
  });
});

// ─── efeito visible ──────────────────────────────────────────────────────────

describe("useEditRepublicModal — efeito visible", () => {
  it("reseta nome e imagemUri quando visible muda para true", () => {
    const { result, rerender } = renderHook(
      (props) => useEditRepublicModal(props),
      { initialProps: { ...defaultProps, visible: false } }
    );

    act(() => {
      result.current.setNome("Outro Nome");
    });

    rerender({ ...defaultProps, visible: true, currentName: "Alpha" });

    expect(result.current.nome).toBe("Alpha");
  });

  it("não reseta quando visible permanece false", () => {
    const { result, rerender } = renderHook(
      (props) => useEditRepublicModal(props),
      { initialProps: { ...defaultProps, visible: false } }
    );

    act(() => {
      result.current.setNome("Editado");
    });

    rerender({ ...defaultProps, visible: false });

    expect(result.current.nome).toBe("Editado");
  });
});

// ─── limpar ───────────────────────────────────────────────────────────────────

describe("useEditRepublicModal — limpar", () => {
  it("restaura nome e imagemUri para os valores iniciais", () => {
    const { result } = renderHook(() =>
      useEditRepublicModal({ ...defaultProps, currentImage: "img.jpg" })
    );

    act(() => {
      result.current.setNome("Alterado");
    });
    act(() => {
      result.current.setImagemUri(undefined);
    });
    act(() => {
      result.current.limpar();
    });

    expect(result.current.nome).toBe("Alpha");
    expect(result.current.imagemUri).toBe("img.jpg");
  });
});

// ─── removerImagem ────────────────────────────────────────────────────────────

describe("useEditRepublicModal — removerImagem", () => {
  it("define imagemUri como undefined", () => {
    const { result } = renderHook(() =>
      useEditRepublicModal({ ...defaultProps, currentImage: "img.jpg" })
    );

    act(() => {
      result.current.removerImagem();
    });

    expect(result.current.imagemUri).toBeUndefined();
  });
});

// ─── selecionarImagem ─────────────────────────────────────────────────────────

describe("useEditRepublicModal — selecionarImagem", () => {
  it("exibe Alert e não altera imagemUri quando permissão negada", async () => {
    jest
      .mocked(requestMediaLibraryPermissionsAsync)
      .mockResolvedValue({ status: "denied" } as any);
    const { result } = renderHook(() => useEditRepublicModal(defaultProps));

    await act(async () => {
      await result.current.selecionarImagem();
    });

    expect(alertSpy).toHaveBeenCalledWith(
      "Permissão necessária",
      expect.any(String)
    );
    expect(result.current.imagemUri).toBeUndefined();
  });

  it("não altera imagemUri quando usuário cancela a seleção", async () => {
    jest
      .mocked(requestMediaLibraryPermissionsAsync)
      .mockResolvedValue({ status: "granted" } as any);
    jest
      .mocked(launchImageLibraryAsync)
      .mockResolvedValue({ canceled: true, assets: [] } as any);
    const { result } = renderHook(() => useEditRepublicModal(defaultProps));

    await act(async () => {
      await result.current.selecionarImagem();
    });

    expect(result.current.imagemUri).toBeUndefined();
  });

  it("atualiza imagemUri com o URI selecionado", async () => {
    jest
      .mocked(requestMediaLibraryPermissionsAsync)
      .mockResolvedValue({ status: "granted" } as any);
    jest.mocked(launchImageLibraryAsync).mockResolvedValue({
      canceled: false,
      assets: [{ uri: "file://rep.jpg" }],
    } as any);
    const { result } = renderHook(() => useEditRepublicModal(defaultProps));

    await act(async () => {
      await result.current.selecionarImagem();
    });

    expect(result.current.imagemUri).toBe("file://rep.jpg");
  });

  it("loga erro e exibe toast ao falhar", async () => {
    const error = new Error("picker error");
    jest.mocked(requestMediaLibraryPermissionsAsync).mockRejectedValue(error);
    jest
      .mocked(getErrorMessage)
      .mockReturnValue("Não foi possível selecionar a imagem.");
    const { result } = renderHook(() => useEditRepublicModal(defaultProps));

    await act(async () => {
      await result.current.selecionarImagem();
    });

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "[ERROR][Republic]",
      "Erro ao selecionar imagem",
      serializeError(error)
    );
    expect(jest.mocked(showToast.error)).toHaveBeenCalledWith(
      "Não foi possível selecionar a imagem."
    );
    consoleErrorSpy.mockClear();
  });
});

// ─── salvar ───────────────────────────────────────────────────────────────────

describe("useEditRepublicModal — salvar", () => {
  it("exibe Alert e não chama onSave quando nome está vazio", async () => {
    const { result } = renderHook(() =>
      useEditRepublicModal({ ...defaultProps, currentName: "" })
    );

    await act(async () => {
      await result.current.salvar();
    });

    expect(alertSpy).toHaveBeenCalledWith("Atenção", expect.any(String));
    expect(defaultProps.onSave).not.toHaveBeenCalled();
  });

  it("chama AsyncStorage.setItem quando imagemUri está definida", async () => {
    const { result } = renderHook(() =>
      useEditRepublicModal({ ...defaultProps, currentImage: "img.jpg" })
    );

    await act(async () => {
      await result.current.salvar();
    });

    expect(jest.mocked(AsyncStorage.setItem)).toHaveBeenCalledWith(
      "@republica_imagem",
      "img.jpg"
    );
  });

  it("chama AsyncStorage.removeItem quando imagemUri é undefined", async () => {
    const { result } = renderHook(() => useEditRepublicModal(defaultProps));

    await act(async () => {
      await result.current.salvar();
    });

    expect(jest.mocked(AsyncStorage.removeItem)).toHaveBeenCalledWith(
      "@republica_imagem"
    );
  });

  it("chama onSave com o nome e imagemUri corretos", async () => {
    const onSave = jest.fn();
    const { result } = renderHook(() =>
      useEditRepublicModal({ ...defaultProps, onSave, currentImage: "img.jpg" })
    );

    await act(async () => {
      await result.current.salvar();
    });

    expect(onSave).toHaveBeenCalledWith("Alpha", "img.jpg");
  });

  it("chama onClose após salvar com sucesso", async () => {
    const onClose = jest.fn();
    const { result } = renderHook(() =>
      useEditRepublicModal({ ...defaultProps, onClose })
    );

    await act(async () => {
      await result.current.salvar();
    });

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("não chama onClose quando onClose não é fornecido", async () => {
    const { result } = renderHook(() =>
      useEditRepublicModal({ ...defaultProps, onClose: undefined })
    );

    await expect(
      act(async () => {
        await result.current.salvar();
      })
    ).resolves.not.toThrow();
  });

  it("define isUploading=false no finally mesmo ao falhar", async () => {
    jest
      .mocked(AsyncStorage.setItem)
      .mockRejectedValue(new Error("disk error"));
    const { result } = renderHook(() =>
      useEditRepublicModal({ ...defaultProps, currentImage: "img.jpg" })
    );

    await act(async () => {
      await result.current.salvar();
    });

    expect(result.current.isUploading).toBe(false);
    consoleErrorSpy.mockClear();
  });

  it("loga erro e exibe toast ao falhar", async () => {
    const error = new Error("save error");
    jest.mocked(AsyncStorage.removeItem).mockRejectedValue(error);
    jest
      .mocked(getErrorMessage)
      .mockReturnValue("Não foi possível salvar as alterações.");
    const { result } = renderHook(() => useEditRepublicModal(defaultProps));

    await act(async () => {
      await result.current.salvar();
    });

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "[ERROR][Republic]",
      "Erro ao salvar dados da república:",
      serializeError(error)
    );
    expect(jest.mocked(showToast.error)).toHaveBeenCalledWith(
      "Não foi possível salvar as alterações."
    );
    consoleErrorSpy.mockClear();
  });
});
