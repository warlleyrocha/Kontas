import { APP_FONTS } from "@/src/lib/fonts";

jest.mock("@expo-google-fonts/inter", () => ({
  __esModule: true,
  Inter_300Light: "Inter_300Light",
  Inter_400Regular: "Inter_400Regular",
  Inter_500Medium: "Inter_500Medium",
  Inter_600SemiBold: "Inter_600SemiBold",
  Inter_700Bold: "Inter_700Bold",
  Inter_900Black: "Inter_900Black",
}));

jest.mock("@expo-google-fonts/mulish", () => ({
  __esModule: true,
  Mulish_300Light: "Mulish_300Light",
  Mulish_400Regular: "Mulish_400Regular",
  Mulish_500Medium: "Mulish_500Medium",
  Mulish_600SemiBold: "Mulish_600SemiBold",
  Mulish_700Bold: "Mulish_700Bold",
  Mulish_900Black: "Mulish_900Black",
}));

describe("APP_FONTS", () => {
  it("exporta o mapa completo de fontes do app", () => {
    expect(APP_FONTS).toEqual({
      Inter_300Light: "Inter_300Light",
      Inter_400Regular: "Inter_400Regular",
      Inter_500Medium: "Inter_500Medium",
      Inter_600SemiBold: "Inter_600SemiBold",
      Inter_700Bold: "Inter_700Bold",
      Inter_900Black: "Inter_900Black",
      Mulish_300Light: "Mulish_300Light",
      Mulish_400Regular: "Mulish_400Regular",
      Mulish_500Medium: "Mulish_500Medium",
      Mulish_600SemiBold: "Mulish_600SemiBold",
      Mulish_700Bold: "Mulish_700Bold",
      Mulish_900Black: "Mulish_900Black",
    });
  });
});
