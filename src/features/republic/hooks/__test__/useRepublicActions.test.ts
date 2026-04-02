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
}));

const mockReplace = jest.fn();
const mockCreateRepublic = jest.fn();
const mockUpdateRepublic = jest.fn();
const mockDeleteRepublic = jest.fn();

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
});

const payload: RepublicPost = { nome: "República Alpha" };

const mockRepublic: RepublicResponse = { id: "rep-1", nome: "República Alpha" };

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
    it("chama republicService.createRepublic e retorna a república criada", async () => {
      mockCreateRepublic.mockResolvedValue(mockRepublic);

      const { result } = renderHook(() => useRepublicActions());
      let returned: RepublicResponse | undefined;

      await act(async () => {
        returned = await result.current.createRepublic(payload);
      });

      expect(mockCreateRepublic).toHaveBeenCalledWith(payload);
      expect(returned).toEqual(mockRepublic);
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
    it("chama republicService.updateRepublic com id e payload", async () => {
      const updated: RepublicResponse = { id: "rep-1", nome: "Nova" };
      mockUpdateRepublic.mockResolvedValue(updated);

      const { result } = renderHook(() => useRepublicActions());

      await act(async () => {
        await result.current.updateRepublic("rep-1", { nome: "Nova" });
      });

      expect(mockUpdateRepublic).toHaveBeenCalledWith({
        id: "rep-1",
        data: { nome: "Nova" },
      });
    });

    it("exibe toast de sucesso", async () => {
      mockUpdateRepublic.mockResolvedValue({
        id: "rep-1",
        nome: "Nova",
      });

      const { result } = renderHook(() => useRepublicActions());

      await act(async () => {
        await result.current.updateRepublic("rep-1", { nome: "Nova" });
      });

      expect(showToast.success).toHaveBeenCalledWith("República atualizada");
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
