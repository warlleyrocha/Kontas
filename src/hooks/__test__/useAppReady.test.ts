import { renderHook, waitFor } from "@testing-library/react-native";
import { hideAsync } from "expo-splash-screen";
import * as SecureStore from "expo-secure-store";
import useAppFonts from "../useAppFonts";
import useAppReady from "../useAppReady";
import { queryClient } from "@/src/services/queryClient";
import { userKeys } from "@/src/features/user/hooks/user.keys";

jest.mock("expo-splash-screen", () => ({
  __esModule: true,
  hideAsync: jest.fn(),
}));

jest.mock("../useAppFonts", () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock("expo-secure-store", () => ({
  getItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

jest.mock("@/src/services/queryClient", () => ({
  queryClient: {
    setQueryData: jest.fn(),
  },
}));

jest.mock("@/src/features/user/hooks/user.keys", () => ({
  userKeys: {
    current: jest.fn(() => ["user", "current"]),
  },
}));

const mockHideAsync = jest.mocked(hideAsync);
const mockUseAppFonts = jest.mocked(useAppFonts);
const mockGetItemAsync = jest.mocked(SecureStore.getItemAsync);
const mockDeleteItemAsync = jest.mocked(SecureStore.deleteItemAsync);
const mockSetQueryData = jest.mocked(queryClient.setQueryData);
const mockUserKeysCurrent = jest.mocked(userKeys.current);

describe("useAppReady", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockHideAsync.mockResolvedValue(undefined);
    mockGetItemAsync.mockResolvedValue(null);
    mockDeleteItemAsync.mockResolvedValue();
  });

  it("retorna false e não chama hideAsync quando as fontes ainda não carregaram", () => {
    mockUseAppFonts.mockReturnValue(false);

    const { result } = renderHook(() => useAppReady());

    expect(mockUseAppFonts).toHaveBeenCalledTimes(1);
    expect(result.current).toBe(false);
    expect(mockHideAsync).not.toHaveBeenCalled();
  });

  it("retorna true e chama hideAsync quando o app está pronto", async () => {
    mockUseAppFonts.mockReturnValue(true);

    const { result } = renderHook(() => useAppReady());

    expect(mockUseAppFonts).toHaveBeenCalledTimes(1);
    expect(result.current).toBe(false);

    await waitFor(() => {
      expect(result.current).toBe(true);
    });

    expect(mockHideAsync).toHaveBeenCalledTimes(1);
  });

  it("popula o cache do React Query quando há dados do usuário no SecureStore", async () => {
    mockUseAppFonts.mockReturnValue(true);
    const cachedUser = JSON.stringify({ id: "u-1", nome: "Ana" });
    mockGetItemAsync.mockResolvedValue(cachedUser);

    renderHook(() => useAppReady());

    await waitFor(() => {
      expect(mockSetQueryData).toHaveBeenCalledWith(
        ["user", "current"],
        { id: "u-1", nome: "Ana" },
      );
    });
  });

  it("limpa o cache corrompido do SecureStore quando JSON.parse falha", async () => {
    mockUseAppFonts.mockReturnValue(true);
    mockGetItemAsync.mockResolvedValue("not-valid-json{");

    renderHook(() => useAppReady());

    await waitFor(() => {
      expect(mockDeleteItemAsync).toHaveBeenCalledTimes(1);
    });
  });
});
