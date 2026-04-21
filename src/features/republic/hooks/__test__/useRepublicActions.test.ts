import { act, renderHook } from "@testing-library/react-native";
import { useRouter } from "expo-router";
import { showToast } from "@/src/shared/utils/showToast";
import type {
  RepublicPost,
  RepublicResponse,
} from "../../types/republic.types";
import { useRepublicActions } from "../useRepublicActions";
import {
  useCreateRepublicMutation,
  useDeleteRepublicMutation,
  useUpdateRepublicMutation,
  useUploadRepublicImageMutation,
} from "../useRepublicQueries";

jest.mock("expo-router", () => ({
  useRouter: jest.fn(),
}));

jest.mock("@/src/shared/utils/showToast", () => ({
  showToast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

jest.mock("../useRepublicQueries", () => ({
  useCreateRepublicMutation: jest.fn(),
  useUpdateRepublicMutation: jest.fn(),
  useDeleteRepublicMutation: jest.fn(),
  useUploadRepublicImageMutation: jest.fn(),
}));

const mockReplace = jest.fn();
const mockCreateRepublic = jest.fn();
const mockUpdateRepublic = jest.fn();
const mockDeleteRepublic = jest.fn();
const mockUploadRepublicImage = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  jest.mocked(useRouter).mockReturnValue({ replace: mockReplace } as any);
  jest.mocked(useCreateRepublicMutation).mockReturnValue({
    mutateAsync: mockCreateRepublic,
  } as any);
  jest.mocked(useUpdateRepublicMutation).mockReturnValue({
    mutateAsync: mockUpdateRepublic,
  } as any);
  jest.mocked(useDeleteRepublicMutation).mockReturnValue({
    mutateAsync: mockDeleteRepublic,
  } as any);
  jest.mocked(useUploadRepublicImageMutation).mockReturnValue({
    mutateAsync: mockUploadRepublicImage,
  } as any);
});

const payload: RepublicPost = { nome: "República Alpha" };

const mockRepublic: RepublicResponse = {
  id: "rep-1",
  nome: "República Alpha",
  imagemRepublica: "https://example.com/foto.jpg",
};

describe("useRepublicActions", () => {
  it("retorna showEditModal=false e as funções no estado inicial", () => {
    const { result } = renderHook(() => useRepublicActions());

    expect(result.current.showEditModal).toBe(false);
    expect(typeof result.current.createRepublic).toBe("function");
    expect(typeof result.current.updateRepublic).toBe("function");
    expect(typeof result.current.deleteRepublic).toBe("function");
    expect(typeof result.current.setShowEditModal).toBe("function");
  });

  it("setShowEditModal atualiza o estado", () => {
    const { result } = renderHook(() => useRepublicActions());

    act(() => {
      result.current.setShowEditModal(true);
    });

    expect(result.current.showEditModal).toBe(true);
  });

  describe("createRepublic", () => {
    it("chama createRepublicMutation e retorna a república criada", async () => {
      mockCreateRepublic.mockResolvedValue(mockRepublic);

      const { result } = renderHook(() => useRepublicActions());
      let returned: RepublicResponse | undefined;

      await act(async () => {
        returned = await result.current.createRepublic(payload);
      });

      expect(mockCreateRepublic).toHaveBeenCalledWith(payload);
      expect(returned).toEqual(mockRepublic);
    });

    it("faz upload da imagem quando URI é local (file://)", async () => {
      const republicWithImage: RepublicResponse = {
        id: "rep-1",
        nome: "República Alpha",
      };
      const uploadedRepublic: RepublicResponse = {
        ...republicWithImage,
        imagemRepublica: "https://example.com/nova-foto.jpg",
      };
      mockCreateRepublic.mockResolvedValue(republicWithImage);
      mockUploadRepublicImage.mockResolvedValue(uploadedRepublic);

      const { result } = renderHook(() => useRepublicActions());
      let returned: RepublicResponse | undefined;

      await act(async () => {
        returned = await result.current.createRepublic({
          nome: "República Alpha",
          imagemRepublica: "file:///data/photo.jpg",
        });
      });

      expect(mockUploadRepublicImage).toHaveBeenCalledWith({
        id: "rep-1",
        uri: "file:///data/photo.jpg",
      });
      expect(returned).toEqual(uploadedRepublic);
    });

    it("exibe toast de sucesso e navega para a república", async () => {
      mockCreateRepublic.mockResolvedValue(mockRepublic);

      const { result } = renderHook(() => useRepublicActions());

      await act(async () => {
        await result.current.createRepublic(payload);
      });

      expect(showToast.success).toHaveBeenCalledWith(
        "República criada com sucesso"
      );
      expect(mockReplace).toHaveBeenCalledWith("/(republics)/rep-1");
    });
  });

  describe("updateRepublic", () => {
    it("retorna currentRepublic imediatamente quando nada mudou", async () => {
      const currentRepublic: RepublicResponse = {
        id: "rep-1",
        nome: "República Alpha",
        imagemRepublica: "https://example.com/foto.jpg",
      };
      const data: RepublicPost = {
        nome: "República Alpha",
        imagemRepublica: "https://example.com/foto.jpg",
      };

      const { result } = renderHook(() => useRepublicActions());
      let returned: RepublicResponse | undefined;

      await act(async () => {
        returned = await result.current.updateRepublic(
          "rep-1",
          currentRepublic,
          data
        );
      });

      expect(returned).toEqual(currentRepublic);
      expect(mockUpdateRepublic).not.toHaveBeenCalled();
      expect(mockUploadRepublicImage).not.toHaveBeenCalled();
    });

    it("chama updateRepublicMutation quando nome mudou", async () => {
      const currentRepublic: RepublicResponse = {
        id: "rep-1",
        nome: "República Alpha",
      };
      const updatedRepublic: RepublicResponse = {
        id: "rep-1",
        nome: "Nova República",
      };
      mockUpdateRepublic.mockResolvedValue(updatedRepublic);

      const { result } = renderHook(() => useRepublicActions());

      await act(async () => {
        await result.current.updateRepublic("rep-1", currentRepublic, {
          nome: "Nova República",
        });
      });

      expect(mockUpdateRepublic).toHaveBeenCalledWith({
        id: "rep-1",
        data: { nome: "Nova República" },
      });
    });

    it("chama uploadRepublicImageMutation quando imagem é URI local", async () => {
      const currentRepublic: RepublicResponse = {
        id: "rep-1",
        nome: "República Alpha",
      };
      const uploadedRepublic: RepublicResponse = {
        id: "rep-1",
        nome: "República Alpha",
        imagemRepublica: "https://example.com/nova-foto.jpg",
      };
      mockUploadRepublicImage.mockResolvedValue(uploadedRepublic);

      const { result } = renderHook(() => useRepublicActions());

      await act(async () => {
        await result.current.updateRepublic("rep-1", currentRepublic, {
          nome: "República Alpha",
          imagemRepublica: "file:///data/photo.jpg",
        });
      });

      expect(mockUploadRepublicImage).toHaveBeenCalledWith({
        id: "rep-1",
        uri: "file:///data/photo.jpg",
      });
    });

    it("chama ambos update e upload quando nome e imagem mudaram", async () => {
      const currentRepublic: RepublicResponse = {
        id: "rep-1",
        nome: "República Alpha",
      };
      const updatedRepublic: RepublicResponse = {
        id: "rep-1",
        nome: "Nova República",
      };
      const uploadedRepublic: RepublicResponse = {
        id: "rep-1",
        nome: "Nova República",
        imagemRepublica: "https://example.com/nova-foto.jpg",
      };
      mockUpdateRepublic.mockResolvedValue(updatedRepublic);
      mockUploadRepublicImage.mockResolvedValue(uploadedRepublic);

      const { result } = renderHook(() => useRepublicActions());

      await act(async () => {
        await result.current.updateRepublic("rep-1", currentRepublic, {
          nome: "Nova República",
          imagemRepublica: "file:///data/photo.jpg",
        });
      });

      expect(mockUpdateRepublic).toHaveBeenCalledWith({
        id: "rep-1",
        data: {
          nome: "Nova República",
          imagemRepublica: "file:///data/photo.jpg",
        },
      });
      expect(mockUploadRepublicImage).toHaveBeenCalledWith({
        id: "rep-1",
        uri: "file:///data/photo.jpg",
      });
    });

    it("exibe toast de sucesso após atualizar", async () => {
      const currentRepublic: RepublicResponse = {
        id: "rep-1",
        nome: "República Alpha",
      };
      const updatedRepublic: RepublicResponse = {
        id: "rep-1",
        nome: "Nova República",
      };
      mockUpdateRepublic.mockResolvedValue(updatedRepublic);

      const { result } = renderHook(() => useRepublicActions());

      await act(async () => {
        await result.current.updateRepublic("rep-1", currentRepublic, {
          nome: "Nova República",
        });
      });

      expect(showToast.success).toHaveBeenCalledWith("República atualizada");
    });

    it("retorna república atualizada após upload de imagem", async () => {
      const currentRepublic: RepublicResponse = {
        id: "rep-1",
        nome: "República Alpha",
      };
      const uploadedRepublic: RepublicResponse = {
        id: "rep-1",
        nome: "República Alpha",
        imagemRepublica: "https://example.com/nova-foto.jpg",
      };
      mockUploadRepublicImage.mockResolvedValue(uploadedRepublic);

      const { result } = renderHook(() => useRepublicActions());
      let returned: RepublicResponse | undefined;

      await act(async () => {
        returned = await result.current.updateRepublic(
          "rep-1",
          currentRepublic,
          {
            nome: "República Alpha",
            imagemRepublica: "file:///data/photo.jpg",
          }
        );
      });

      expect(returned).toEqual(uploadedRepublic);
    });
  });

  describe("deleteRepublic", () => {
    it("chama republicService.deleteRepublic com o id correto", async () => {
      mockDeleteRepublic.mockResolvedValue(undefined);

      const { result } = renderHook(() => useRepublicActions());

      await act(async () => {
        await result.current.deleteRepublic("rep-1");
      });

      expect(mockDeleteRepublic).toHaveBeenCalledWith("rep-1");
    });

    it("exibe toast de sucesso", async () => {
      mockDeleteRepublic.mockResolvedValue(undefined);

      const { result } = renderHook(() => useRepublicActions());

      await act(async () => {
        await result.current.deleteRepublic("rep-1");
      });

      expect(showToast.success).toHaveBeenCalledWith("República removida");
    });
  });
});
