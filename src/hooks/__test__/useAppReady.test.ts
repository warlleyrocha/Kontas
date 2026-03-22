import { renderHook } from "@testing-library/react-native";
import { hideAsync } from "expo-splash-screen";
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

const mockHideAsync = jest.mocked(hideAsync);
const mockUseAppFonts = jest.mocked(useAppFonts);

describe("useAppReady", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockHideAsync.mockResolvedValue(undefined);
  });

  it("retorna false e não chama hideAsync quando as fontes ainda não carregaram", () => {
    mockUseAppFonts.mockReturnValue(false);

    const { result } = renderHook(() => useAppReady());

    expect(mockUseAppFonts).toHaveBeenCalledTimes(1);
    expect(result.current).toBe(false);
    expect(mockHideAsync).not.toHaveBeenCalled();
  });

  it("retorna true e chama hideAsync quando o app está pronto", () => {
    mockUseAppFonts.mockReturnValue(true);

    const { result } = renderHook(() => useAppReady());

    expect(mockUseAppFonts).toHaveBeenCalledTimes(1);
    expect(result.current).toBe(true);
    expect(mockHideAsync).toHaveBeenCalledTimes(1);
  });
});
