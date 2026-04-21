import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { renderHook } from "@testing-library/react-native";
import { republicService } from "@/src/features/republic/services/republic.service";
import type { RepublicResponse } from "@/src/features/republic/types/republic.types";
import {
  useCreateRepublicMutation,
  useUploadRepublicImageMutation,
} from "../useRepublicQueries";

jest.mock("@tanstack/react-query", () => ({
  useQuery: jest.fn(),
  useMutation: jest.fn(),
  useQueryClient: jest.fn(),
}));

jest.mock("@/src/features/auth/hooks/useAuth", () => ({
  useAuth: jest.fn().mockReturnValue({ isAuthenticated: true }),
}));

jest.mock("@/src/features/republic/services/republic.service", () => ({
  republicService: {
    createRepublic: jest.fn(),
    uploadRepublicImage: jest.fn(),
  },
}));

const mockRefetch = jest.fn();
const mockSetQueryData = jest.fn();
const mockInvalidateQueries = jest.fn();

const mockRepublic: RepublicResponse = {
  id: "rep-1",
  nome: "República Alpha",
  imagemRepublica: "https://example.com/republica.jpg",
};

beforeEach(() => {
  jest.clearAllMocks();
  jest.mocked(useQueryClient).mockReturnValue({
    setQueryData: mockSetQueryData,
    invalidateQueries: mockInvalidateQueries,
  } as any);
  jest.mocked(useQuery).mockReturnValue({
    data: undefined,
    error: null,
    refetch: mockRefetch,
  } as any);
  jest.mocked(useMutation).mockReturnValue({
    mutateAsync: jest.fn(),
    isPending: false,
    error: null,
  } as any);
});

// ─── useUploadRepublicImageMutation ────────────────────────────────────────────

describe("useUploadRepublicImageMutation", () => {
  let capturedOptions: any;

  beforeEach(() => {
    jest.mocked(useMutation).mockImplementation((options: any) => {
      capturedOptions = options;
      return { mutateAsync: jest.fn(), isPending: false, error: null } as any;
    });
  });

  it("mutationFn chama republicService.uploadRepublicImage com id e uri", async () => {
    jest
      .mocked(republicService.uploadRepublicImage)
      .mockResolvedValue(mockRepublic);
    renderHook(() => useUploadRepublicImageMutation());

    await capturedOptions.mutationFn({ id: "rep-1", uri: "file:///photo.jpg" });

    expect(
      jest.mocked(republicService.uploadRepublicImage)
    ).toHaveBeenCalledWith("rep-1", "file:///photo.jpg");
  });

  it("onSuccess atualiza cache da república com novos dados", () => {
    renderHook(() => useUploadRepublicImageMutation());
    capturedOptions.onSuccess(mockRepublic);

    expect(mockSetQueryData).toHaveBeenCalledWith(
      ["republics", "detail", "rep-1"],
      mockRepublic
    );
  });

  it("onSuccess atualiza lista de repúblicas com república atualizada", () => {
    renderHook(() => useUploadRepublicImageMutation());
    capturedOptions.onSuccess(mockRepublic);

    expect(mockSetQueryData).toHaveBeenCalledWith(
      ["republics", "list"],
      expect.any(Function)
    );
  });

  it("updater adiciona república ao início quando lista está vazia", () => {
    renderHook(() => useUploadRepublicImageMutation());
    capturedOptions.onSuccess(mockRepublic);

    const updater = mockSetQueryData.mock.calls[1][1] as (
      prev: RepublicResponse[] | undefined
    ) => RepublicResponse[];
    expect(updater(undefined)).toEqual([mockRepublic]);
  });

  it("updater substitui república existente com mesmo id", () => {
    const existingRepublic: RepublicResponse = {
      id: "rep-1",
      nome: "República Velha",
    };
    renderHook(() => useUploadRepublicImageMutation());
    capturedOptions.onSuccess(mockRepublic);

    const updater = mockSetQueryData.mock.calls[1][1] as (
      prev: RepublicResponse[] | undefined
    ) => RepublicResponse[];
    expect(updater([existingRepublic])).toEqual([mockRepublic]);
  });

  it("updater mantém outras repúblicas ao atualizar uma", () => {
    const otherRepublic: RepublicResponse = {
      id: "rep-2",
      nome: "República Beta",
    };
    renderHook(() => useUploadRepublicImageMutation());
    capturedOptions.onSuccess(mockRepublic);

    const updater = mockSetQueryData.mock.calls[1][1] as (
      prev: RepublicResponse[] | undefined
    ) => RepublicResponse[];
    expect(updater([otherRepublic, mockRepublic])).toEqual([
      otherRepublic,
      mockRepublic,
    ]);
  });
});

// ─── useCreateRepublicMutation ────────────────────────────────────────────────

describe("useCreateRepublicMutation", () => {
  let capturedOptions: any;

  beforeEach(() => {
    jest.mocked(useMutation).mockImplementation((options: any) => {
      capturedOptions = options;
      return { mutateAsync: jest.fn(), isPending: false, error: null } as any;
    });
  });

  it("onSuccess adiciona república criada ao cache de lista", () => {
    renderHook(() => useCreateRepublicMutation());
    capturedOptions.onSuccess(mockRepublic);

    expect(mockSetQueryData).toHaveBeenCalledWith(
      ["republics", "list"],
      expect.any(Function)
    );
  });

  it("updater não duplica república se já existir na lista", () => {
    const existingRepublic: RepublicResponse = {
      id: "rep-1",
      nome: "República Alpha",
    };
    renderHook(() => useCreateRepublicMutation());
    capturedOptions.onSuccess(mockRepublic);

    const updater = mockSetQueryData.mock.calls[1][1] as (
      prev: RepublicResponse[] | undefined
    ) => RepublicResponse[];
    expect(updater([existingRepublic])).toEqual([existingRepublic]);
  });

  it("updater adiciona república ao início quando não existe", () => {
    renderHook(() => useCreateRepublicMutation());
    capturedOptions.onSuccess(mockRepublic);

    const updater = mockSetQueryData.mock.calls[1][1] as (
      prev: RepublicResponse[] | undefined
    ) => RepublicResponse[];
    expect(updater(undefined)).toEqual([mockRepublic]);
  });

  it("updater adiciona república ao início de lista existente", () => {
    const existingRepublic: RepublicResponse = {
      id: "rep-2",
      nome: "República Beta",
    };
    renderHook(() => useCreateRepublicMutation());
    capturedOptions.onSuccess(mockRepublic);

    const updater = mockSetQueryData.mock.calls[1][1] as (
      prev: RepublicResponse[] | undefined
    ) => RepublicResponse[];
    expect(updater([existingRepublic])).toEqual([
      existingRepublic,
      mockRepublic,
    ]);
  });
});
