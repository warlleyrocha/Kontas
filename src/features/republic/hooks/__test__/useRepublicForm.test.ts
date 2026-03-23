import { act, renderHook } from "@testing-library/react-native";
import {
  launchImageLibraryAsync,
  requestMediaLibraryPermissionsAsync,
} from "expo-image-picker";
import { Alert } from "react-native";
import { useRepublicForm } from "../useRepublicForm";

jest.mock("expo-image-picker", () => ({
  requestMediaLibraryPermissionsAsync: jest.fn(),
  launchImageLibraryAsync: jest.fn(),
}));

const mockRequestPermission = jest.mocked(requestMediaLibraryPermissionsAsync);
const mockLaunchLibrary = jest.mocked(launchImageLibraryAsync);

beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(Alert, "alert").mockImplementation(() => {});
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe("useRepublicForm", () => {
  it("retorna o estado inicial correto", () => {
    const { result } = renderHook(() => useRepublicForm());

    expect(result.current.republicName).toBe("");
    expect(result.current.republicImage).toBeUndefined();
    expect(typeof result.current.setRepublicName).toBe("function");
    expect(typeof result.current.setRepublicImage).toBe("function");
    expect(typeof result.current.handleSelectImageRepublic).toBe("function");
  });

  it("setRepublicName atualiza republicName", () => {
    const { result } = renderHook(() => useRepublicForm());

    act(() => {
      result.current.setRepublicName("República Teste");
    });

    expect(result.current.republicName).toBe("República Teste");
  });

  it("setRepublicImage atualiza republicImage", () => {
    const { result } = renderHook(() => useRepublicForm());

    act(() => {
      result.current.setRepublicImage("file:///imagem.jpg");
    });

    expect(result.current.republicImage).toBe("file:///imagem.jpg");
  });

  describe("handleSelectImageRepublic", () => {
    it("exibe Alert quando a permissão é negada", async () => {
      mockRequestPermission.mockResolvedValue({ status: "denied" } as any);

      const { result } = renderHook(() => useRepublicForm());

      await act(async () => {
        await result.current.handleSelectImageRepublic();
      });

      expect(Alert.alert).toHaveBeenCalledWith("Permissão necessária");
      expect(mockLaunchLibrary).not.toHaveBeenCalled();
    });

    it("não atualiza a imagem quando a permissão é negada", async () => {
      mockRequestPermission.mockResolvedValue({ status: "denied" } as any);

      const { result } = renderHook(() => useRepublicForm());

      await act(async () => {
        await result.current.handleSelectImageRepublic();
      });

      expect(result.current.republicImage).toBeUndefined();
    });

    it("abre o seletor de imagem com as opções corretas quando a permissão é concedida", async () => {
      mockRequestPermission.mockResolvedValue({ status: "granted" } as any);
      mockLaunchLibrary.mockResolvedValue({ canceled: true, assets: [] } as any);

      const { result } = renderHook(() => useRepublicForm());

      await act(async () => {
        await result.current.handleSelectImageRepublic();
      });

      expect(mockLaunchLibrary).toHaveBeenCalledWith({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });
    });

    it("não atualiza a imagem quando o usuário cancela a seleção", async () => {
      mockRequestPermission.mockResolvedValue({ status: "granted" } as any);
      mockLaunchLibrary.mockResolvedValue({ canceled: true, assets: [] } as any);

      const { result } = renderHook(() => useRepublicForm());

      await act(async () => {
        await result.current.handleSelectImageRepublic();
      });

      expect(result.current.republicImage).toBeUndefined();
    });

    it("atualiza republicImage com a URI do ativo selecionado", async () => {
      mockRequestPermission.mockResolvedValue({ status: "granted" } as any);
      mockLaunchLibrary.mockResolvedValue({
        canceled: false,
        assets: [{ uri: "file:///foto.jpg" }],
      } as any);

      const { result } = renderHook(() => useRepublicForm());

      await act(async () => {
        await result.current.handleSelectImageRepublic();
      });

      expect(result.current.republicImage).toBe("file:///foto.jpg");
    });
  });
});
