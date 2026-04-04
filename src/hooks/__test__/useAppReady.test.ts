import { renderHook, waitFor } from "@testing-library/react-native";
import { hideAsync } from "expo-splash-screen";
import * as SecureStore from "expo-secure-store";
import useAppFonts from "../useAppFonts";
import useAppReady from "../useAppReady";

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

const mockHideAsync = jest.mocked(hideAsync);
const mockUseAppFonts = jest.mocked(useAppFonts);
const mockGetItemAsync = jest.mocked(SecureStore.getItemAsync);

describe("useAppReady", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockHideAsync.mockResolvedValue(undefined);
    mockGetItemAsync.mockResolvedValue(null);
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
});
