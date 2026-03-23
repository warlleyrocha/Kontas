import { act, renderHook } from "@testing-library/react-native";
import { useRouter } from "expo-router";
import { useRepublicList } from "@/src/features/republic/hooks/useRepublicList";
import { showToast } from "@/src/shared/utils/showToast";
import type { RepublicPost, RepublicResponse } from "../../types/republic.types";
import { republicService } from "../../services/republic.service";
import { useRepublicActions } from "../useRepublicActions";

jest.mock("expo-router", () => ({
  useRouter: jest.fn(),
}));

jest.mock("@/src/features/republic/hooks/useRepublicList", () => ({
  useRepublicList: jest.fn(),
}));

jest.mock("@/src/shared/utils/showToast", () => ({
  showToast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

jest.mock("../../services/republic.service", () => ({
  republicService: {
    createRepublic: jest.fn(),
    updateRepublic: jest.fn(),
    deleteRepublic: jest.fn(),
  },
}));

const mockReplace = jest.fn();
const mockSetRepublics = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  jest.mocked(useRouter).mockReturnValue({ replace: mockReplace } as any);
  jest.mocked(useRepublicList).mockReturnValue({
    setRepublics: mockSetRepublics,
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
      jest.mocked(republicService.createRepublic).mockResolvedValue(mockRepublic);

      const { result } = renderHook(() => useRepublicActions());
      let returned: RepublicResponse | undefined;

      await act(async () => {
        returned = await result.current.createRepublic(payload);
      });

      expect(republicService.createRepublic).toHaveBeenCalledWith(payload);
      expect(returned).toEqual(mockRepublic);
    });

    it("adiciona a nova república à lista via setRepublics", async () => {
      jest.mocked(republicService.createRepublic).mockResolvedValue(mockRepublic);

      const { result } = renderHook(() => useRepublicActions());

      await act(async () => {
        await result.current.createRepublic(payload);
      });

      const updater = mockSetRepublics.mock.calls[0][0] as (
        current: RepublicResponse[]
      ) => RepublicResponse[];
      expect(updater([])).toEqual([mockRepublic]);
    });

    it("não adiciona república duplicada à lista", async () => {
      jest.mocked(republicService.createRepublic).mockResolvedValue(mockRepublic);

      const { result } = renderHook(() => useRepublicActions());

      await act(async () => {
        await result.current.createRepublic(payload);
      });

      const updater = mockSetRepublics.mock.calls[0][0] as (
        current: RepublicResponse[]
      ) => RepublicResponse[];
      const existing = [mockRepublic];
      expect(updater(existing)).toBe(existing);
    });

    it("exibe toast de sucesso e navega para a república", async () => {
      jest.mocked(republicService.createRepublic).mockResolvedValue(mockRepublic);

      const { result } = renderHook(() => useRepublicActions());

      await act(async () => {
        await result.current.createRepublic(payload);
      });

      expect(showToast.success).toHaveBeenCalledWith("República criada com sucesso");
      expect(mockReplace).toHaveBeenCalledWith("/(republics)/rep-1");
    });
  });

  describe("updateRepublic", () => {
    it("chama republicService.updateRepublic com id e payload", async () => {
      const updated: RepublicResponse = { id: "rep-1", nome: "Nova" };
      jest.mocked(republicService.updateRepublic).mockResolvedValue(updated);

      const { result } = renderHook(() => useRepublicActions());

      await act(async () => {
        await result.current.updateRepublic("rep-1", { nome: "Nova" });
      });

      expect(republicService.updateRepublic).toHaveBeenCalledWith("rep-1", {
        nome: "Nova",
      });
    });

    it("substitui a república na lista via setRepublics", async () => {
      const updated: RepublicResponse = { id: "rep-1", nome: "Nova" };
      const other: RepublicResponse = { id: "rep-2", nome: "Outra" };
      jest.mocked(republicService.updateRepublic).mockResolvedValue(updated);

      const { result } = renderHook(() => useRepublicActions());

      await act(async () => {
        await result.current.updateRepublic("rep-1", { nome: "Nova" });
      });

      const updater = mockSetRepublics.mock.calls[0][0] as (
        current: RepublicResponse[]
      ) => RepublicResponse[];
      expect(updater([mockRepublic, other])).toEqual([updated, other]);
    });

    it("exibe toast de sucesso", async () => {
      jest.mocked(republicService.updateRepublic).mockResolvedValue({
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
      jest.mocked(republicService.deleteRepublic).mockResolvedValue(undefined as any);

      const { result } = renderHook(() => useRepublicActions());

      await act(async () => {
        await result.current.deleteRepublic("rep-1");
      });

      expect(republicService.deleteRepublic).toHaveBeenCalledWith("rep-1");
    });

    it("remove a república da lista via setRepublics", async () => {
      jest.mocked(republicService.deleteRepublic).mockResolvedValue(undefined as any);
      const other: RepublicResponse = { id: "rep-2", nome: "Outra" };

      const { result } = renderHook(() => useRepublicActions());

      await act(async () => {
        await result.current.deleteRepublic("rep-1");
      });

      const updater = mockSetRepublics.mock.calls[0][0] as (
        current: RepublicResponse[]
      ) => RepublicResponse[];
      expect(updater([mockRepublic, other])).toEqual([other]);
    });

    it("exibe toast de sucesso", async () => {
      jest.mocked(republicService.deleteRepublic).mockResolvedValue(undefined as any);

      const { result } = renderHook(() => useRepublicActions());

      await act(async () => {
        await result.current.deleteRepublic("rep-1");
      });

      expect(showToast.success).toHaveBeenCalledWith("República removida");
    });
  });
});
