import { renderHook, waitFor } from "@testing-library/react-native";
import { hideAsync } from "expo-splash-screen";
import useAppFonts from "../useAppFonts";
import useAppReady from "../useAppReady";
import * as authHeader from "@/src/services/authHeader";

jest.mock("expo-splash-screen", () => ({
  __esModule: true,
  hideAsync: jest.fn(),
}));

jest.mock("../useAppFonts", () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock("@/src/services/authHeader", () => ({
  hydrateAuthorizationHeader: jest.fn(),
}));

const mockHideAsync = jest.mocked(hideAsync);
const mockUseAppFonts = jest.mocked(useAppFonts);
const mockHydrateAuthorizationHeader = jest.mocked(
  authHeader.hydrateAuthorizationHeader
);

describe("useAppReady", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockHideAsync.mockResolvedValue(undefined);
    mockHydrateAuthorizationHeader.mockResolvedValue(undefined);
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

  it("hidrata o AuthorizationHeader quando as fontes carregam", async () => {
    mockUseAppFonts.mockReturnValue(true);

    renderHook(() => useAppReady());

    await waitFor(() => {
      expect(mockHydrateAuthorizationHeader).toHaveBeenCalledTimes(1);
    });
  });

  it("continua inicializando o app mesmo quando a hidratação do token falha", async () => {
    mockUseAppFonts.mockReturnValue(true);
    mockHydrateAuthorizationHeader.mockRejectedValue(new Error("sem token"));

    const { result } = renderHook(() => useAppReady());

    await waitFor(() => {
      expect(result.current).toBe(true);
    });
  });
});
