import { fireEvent, render, screen } from "@testing-library/react-native";
import { Text } from "react-native";
import { useRouter } from "expo-router";
import { ScreenLayout } from "../ScreenLayout";

jest.mock("expo-router", () => ({
  useRouter: jest.fn(),
}));

jest.mock("@expo/vector-icons/Ionicons", () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock("react-native-safe-area-context", () => ({
  SafeAreaView: ({ children }: { children: React.ReactNode }) => {
    const { View } = require("react-native");
    return <View>{children}</View>;
  },
}));

const mockBack = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  jest.mocked(useRouter).mockReturnValue({ back: mockBack } as any);
});

const createProps = (overrides = {}) => ({
  title: "Título da Tela",
  subtitle: "Subtítulo da tela",
  children: <Text>Conteúdo filho</Text>,
  ...overrides,
});

describe("ScreenLayout", () => {
  it("monta sem erros", () => {
    render(<ScreenLayout {...createProps()} />);
  });

  it("exibe o título", () => {
    render(<ScreenLayout {...createProps()} />);
    expect(screen.getByText("Título da Tela")).toBeTruthy();
  });

  it("exibe o subtítulo", () => {
    render(<ScreenLayout {...createProps()} />);
    expect(screen.getByText("Subtítulo da tela")).toBeTruthy();
  });

  it("renderiza os children", () => {
    render(<ScreenLayout {...createProps()} />);
    expect(screen.getByText("Conteúdo filho")).toBeTruthy();
  });

  it("chama onBack ao pressionar o botão de voltar quando fornecido", () => {
    const onBack = jest.fn();
    render(<ScreenLayout {...createProps({ onBack })} />);

    fireEvent.press(
      screen.getByRole("button", { name: "Voltar para a tela anterior" })
    );

    expect(onBack).toHaveBeenCalledTimes(1);
    expect(mockBack).not.toHaveBeenCalled();
  });

  it("chama router.back() quando onBack não é fornecido", () => {
    render(<ScreenLayout {...createProps()} />);

    fireEvent.press(
      screen.getByRole("button", { name: "Voltar para a tela anterior" })
    );

    expect(mockBack).toHaveBeenCalledTimes(1);
  });
});
