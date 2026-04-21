import { renderHook } from "@testing-library/react-native";
import { useFonts } from "expo-font";
import { APP_FONTS } from "@/src/lib/fonts";
import useAppFonts from "../useAppFonts";

jest.mock("expo-font", () => ({
  __esModule: true,
  useFonts: jest.fn(),
}));

const mockUseFonts = jest.mocked(useFonts);

describe("useAppFonts", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("retorna loaded quando as fontes carregam", () => {
    mockUseFonts.mockReturnValue([true, null]);

    const { result } = renderHook(() => useAppFonts());

    expect(mockUseFonts).toHaveBeenCalledTimes(1);
    expect(mockUseFonts).toHaveBeenCalledWith(APP_FONTS);
    expect(result.current).toBe(true);
  });

  it("lança o erro retornado por useFonts", () => {
    const error = new Error("falha ao carregar fontes");
    mockUseFonts.mockReturnValue([false, error]);
    jest.spyOn(console, "error").mockImplementation(() => {});

    expect(() => renderHook(() => useAppFonts())).toThrow(error);
  });
});
