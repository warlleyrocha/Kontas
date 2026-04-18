import { act, fireEvent, render, screen } from "@testing-library/react-native";
import { router } from "expo-router";
import { FlatList } from "react-native";
import Onboarding from "../OnboardingScreen";

jest.mock("expo-router", () => ({
  router: { replace: jest.fn() },
}));

jest.mock("expo-blur", () => ({
  BlurView: ({ children }: any) => children,
}));

jest.mock("react-native-safe-area-context", () => ({
  ...jest.requireActual("react-native-safe-area-context"),
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
  SafeAreaView: ({ children }: any) => children,
}));

jest.mock("@/src/features/auth/constants/slides", () => ({
  slides: [
    {
      id: "1",
      title: "Slide 1",
      description: "Desc 1",
      image: "https://example.com/img1.jpg",
      color: "#337176",
    },
    {
      id: "2",
      title: "Slide 2",
      description: "Desc 2",
      image: "https://example.com/img2.jpg",
      color: "#C87223",
    },
  ],
}));

jest.mock(
  "@/src/features/auth/components/onboarding/OnboardingButtons",
  () => ({
    __esModule: true,
    default: ({ handleNext, isLastSlide }: any) => {
      const { TouchableOpacity, Text, View } =
        jest.requireActual("react-native");
      return (
        <View>
          <TouchableOpacity
            onPress={handleNext}
            accessibilityRole="button"
            accessibilityLabel="next"
          >
            <Text>{isLastSlide ? "Começar Agora" : "Continuar"}</Text>
          </TouchableOpacity>
        </View>
      );
    },
  })
);

jest.mock("@/src/features/auth/components/onboarding/RenderDots", () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock("@/src/features/auth/components/onboarding/RenderSlide", () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock("@/src/shared/hooks/useComponentLogger", () => ({
  useComponentLogger: jest.fn(),
}));

const mockReplace = jest.fn();
beforeEach(() => {
  jest.clearAllMocks();
  jest.mocked(router.replace).mockImplementation(mockReplace);
});

describe("OnboardingScreen", () => {
  it("monta sem erros", () => {
    render(<Onboarding />);
  });

  it("exibe 'Continuar' no primeiro slide", () => {
    render(<Onboarding />);
    expect(screen.getByText("Continuar")).toBeTruthy();
  });

  it("chama router.replace ao pressionar Pular", () => {
    render(<Onboarding />);

    fireEvent.press(screen.getByText("Pular"));

    expect(mockReplace).toHaveBeenCalledWith("/(userProfile)/profile");
  });

  it("avança para o próximo slide ao pressionar handleNext antes do último slide", async () => {
    const scrollToIndexMock = jest
      .spyOn(FlatList.prototype, "scrollToIndex")
      .mockImplementation(() => {});

    render(<Onboarding />);

    await act(async () => {
      fireEvent.press(screen.getByRole("button", { name: "next" }));
    });

    expect(scrollToIndexMock).toHaveBeenCalledWith({ index: 1 });
    expect(screen.getByText("Começar Agora")).toBeTruthy();
    expect(mockReplace).not.toHaveBeenCalled();

    scrollToIndexMock.mockRestore();
  });

  it("atualiza currentIndex via onMomentumScrollEnd", async () => {
    const { UNSAFE_getAllByType } = render(<Onboarding />);

    const flatLists = UNSAFE_getAllByType(FlatList);
    expect(flatLists.length).toBeGreaterThan(0);

    await act(async () => {
      flatLists[0].props.onMomentumScrollEnd({
        nativeEvent: { contentOffset: { x: 390 } },
      });
    });

    // currentIndex = Math.round(390/390) = 1 → último slide
    expect(screen.getByText("Começar Agora")).toBeTruthy();
  });

  it("chama router.replace ao pressionar handleNext no último slide", async () => {
    const { UNSAFE_getAllByType } = render(<Onboarding />);

    // avança para o último slide via scroll
    await act(async () => {
      UNSAFE_getAllByType(FlatList)[0].props.onMomentumScrollEnd({
        nativeEvent: { contentOffset: { x: 390 } },
      });
    });

    // pressiona next no último slide → router.replace
    await act(async () => {
      fireEvent.press(screen.getByRole("button", { name: "next" }));
    });

    expect(mockReplace).toHaveBeenCalledWith("/(userProfile)/profile");
  });
});
