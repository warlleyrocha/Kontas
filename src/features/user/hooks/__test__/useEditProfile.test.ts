import { act, renderHook } from "@testing-library/react-native";
import {
  launchImageLibraryAsync,
  requestMediaLibraryPermissionsAsync,
} from "expo-image-picker";
import { Alert } from "react-native";
import { getErrorMessage } from "@/src/services/httpError";
import { showToast } from "@/src/shared/utils/showToast";
import { useEditProfile } from "../useEditProfile";

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
  currentName: "Ana",
  currentPixKey: "ana@pix",
  currentPhoto: undefined as string | undefined,
  currentPhone: "(11) 99999-9999",
  onClose: jest.fn(),
  onSave: jest.fn(),
};

// ─── Setup ────────────────────────────────────────────────────────────────────

let consoleErrorSpy: jest.SpyInstance;
let alertSpy: jest.SpyInstance;

beforeEach(() => {
  jest.clearAllMocks();
  jest.mocked(getErrorMessage).mockImplementation((_err, fallback) => fallback ?? "erro");
  consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
  alertSpy = jest.spyOn(Alert, "alert").mockImplementation(() => {});
});

afterEach(() => {
  consoleErrorSpy.mockRestore();
  alertSpy.mockRestore();
});

// ─── estado inicial ───────────────────────────────────────────────────────────

describe("useEditProfile — estado inicial", () => {
  it("inicializa com os valores fornecidos", () => {
    const { result } = renderHook(() => useEditProfile(defaultProps));

    expect(result.current.name).toBe("Ana");
    expect(result.current.pixKey).toBe("ana@pix");
    expect(result.current.phone).toBe("(11) 99999-9999");
    expect(result.current.photoUri).toBeUndefined();
    expect(result.current.isUploading).toBe(false);
  });

  it("usa string vazia quando currentPixKey e currentPhone são undefined", () => {
    const { result } = renderHook(() =>
      useEditProfile({ ...defaultProps, currentPixKey: undefined, currentPhone: undefined })
    );

    expect(result.current.pixKey).toBe("");
    expect(result.current.phone).toBe("");
  });
});

// ─── handleClose ─────────────────────────────────────────────────────────────

describe("useEditProfile — handleClose", () => {
  it("restaura os valores iniciais e chama onClose", () => {
    const onClose = jest.fn();
    const { result } = renderHook(() =>
      useEditProfile({ ...defaultProps, onClose })
    );

    act(() => { result.current.setName("Novo Nome"); });
    act(() => { result.current.handleClose(); });

    expect(result.current.name).toBe("Ana");
    expect(result.current.pixKey).toBe("ana@pix");
    expect(result.current.phone).toBe("(11) 99999-9999");
    expect(result.current.isUploading).toBe(false);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("restaura pixKey e phone para vazio e photoUri para a foto atual quando valores opcionais não existem", () => {
    const onClose = jest.fn();
    const { result } = renderHook(() =>
      useEditProfile({
        ...defaultProps,
        currentPixKey: undefined,
        currentPhoto: "file://current-photo.jpg",
        currentPhone: undefined,
        onClose,
      })
    );

    act(() => {
      result.current.setPixKey("nova-chave");
      result.current.setPhotoUri("file://new-photo.jpg");
      result.current.setPhone("(11) 98888-7777");
    });

    act(() => {
      result.current.handleClose();
    });

    expect(result.current.pixKey).toBe("");
    expect(result.current.photoUri).toBe("file://current-photo.jpg");
    expect(result.current.phone).toBe("");
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});

// ─── handleSave ──────────────────────────────────────────────────────────────

describe("useEditProfile — handleSave", () => {
  it("chama onSave com name, pixKey, photoUri e phone", async () => {
    const onSave = jest.fn();
    const { result } = renderHook(() => useEditProfile({ ...defaultProps, onSave }));

    await act(async () => { await result.current.handleSave(); });

    expect(onSave).toHaveBeenCalledWith("Ana", "ana@pix", undefined, "(11) 99999-9999");
  });

  it("define isUploading=false no finally após sucesso", async () => {
    const { result } = renderHook(() => useEditProfile(defaultProps));

    await act(async () => { await result.current.handleSave(); });

    expect(result.current.isUploading).toBe(false);
  });

  it("loga erro, exibe toast e redefine isUploading=false ao falhar", async () => {
    const error = new Error("save error");
    const onSave = jest.fn().mockImplementation(() => { throw error; });
    jest.mocked(getErrorMessage).mockReturnValue("Não foi possível salvar as alterações.");

    const { result } = renderHook(() => useEditProfile({ ...defaultProps, onSave }));

    await act(async () => { await result.current.handleSave(); });

    expect(consoleErrorSpy).toHaveBeenCalledWith("Erro ao salvar:", error);
    expect(jest.mocked(showToast.error)).toHaveBeenCalledWith(
      "Não foi possível salvar as alterações."
    );
    expect(result.current.isUploading).toBe(false);
    consoleErrorSpy.mockClear();
  });
});

// ─── selectPhoto ─────────────────────────────────────────────────────────────

describe("useEditProfile — selectPhoto", () => {
  it("exibe Alert e não seleciona foto quando permissão negada", async () => {
    jest.mocked(requestMediaLibraryPermissionsAsync).mockResolvedValue({
      status: "denied",
    } as any);

    const { result } = renderHook(() => useEditProfile(defaultProps));

    await act(async () => { await result.current.selectPhoto(); });

    expect(alertSpy).toHaveBeenCalledWith(
      "Permissão necessária",
      "Precisamos de permissão para acessar suas fotos."
    );
    expect(result.current.photoUri).toBeUndefined();
  });

  it("não atualiza photoUri quando o usuário cancela a seleção", async () => {
    jest.mocked(requestMediaLibraryPermissionsAsync).mockResolvedValue({
      status: "granted",
    } as any);
    jest.mocked(launchImageLibraryAsync).mockResolvedValue({
      canceled: true,
      assets: [],
    } as any);

    const { result } = renderHook(() => useEditProfile(defaultProps));

    await act(async () => { await result.current.selectPhoto(); });

    expect(result.current.photoUri).toBeUndefined();
  });

  it("atualiza photoUri com o URI selecionado", async () => {
    jest.mocked(requestMediaLibraryPermissionsAsync).mockResolvedValue({
      status: "granted",
    } as any);
    jest.mocked(launchImageLibraryAsync).mockResolvedValue({
      canceled: false,
      assets: [{ uri: "file://photo.jpg" }],
    } as any);

    const { result } = renderHook(() => useEditProfile(defaultProps));

    await act(async () => { await result.current.selectPhoto(); });

    expect(result.current.photoUri).toBe("file://photo.jpg");
  });

  it("loga erro e exibe toast quando selectPhoto lança exceção", async () => {
    const error = new Error("picker error");
    jest.mocked(requestMediaLibraryPermissionsAsync).mockRejectedValue(error);
    jest.mocked(getErrorMessage).mockReturnValue("Não foi possível selecionar a imagem.");

    const { result } = renderHook(() => useEditProfile(defaultProps));

    await act(async () => { await result.current.selectPhoto(); });

    expect(consoleErrorSpy).toHaveBeenCalledWith("Erro ao selecionar imagem:", error);
    expect(jest.mocked(showToast.error)).toHaveBeenCalledWith(
      "Não foi possível selecionar a imagem."
    );
    consoleErrorSpy.mockClear();
  });
});
