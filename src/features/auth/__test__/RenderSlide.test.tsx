import { render, screen } from "@testing-library/react-native";
import type { SharedValue } from "react-native-reanimated";
import RenderSlide from "../components/onboarding/RenderSlide";
import type { OnboardingSlide } from "../constants/slides";

jest.mock("expo-linear-gradient", () => ({
  LinearGradient: () => null,
}));

const mockSlide: OnboardingSlide = {
  id: "1",
  title: "Gerencie suas Contas",
  description: "Controle todas as despesas da república em um só lugar",
  image: "https://example.com/img1.jpg",
  color: "#337176",
};

const scrollX = { value: 0 } as SharedValue<number>;

const createProps = (overrides = {}) => ({
  item: mockSlide,
  index: 0,
  width: 390,
  height: 844,
  scrollX,
  ...overrides,
});

describe("RenderSlide", () => {
  it("monta sem erros", () => {
    render(<RenderSlide {...createProps()} />);
  });

  it("exibe o título do slide", () => {
    render(<RenderSlide {...createProps()} />);
    expect(screen.getByText("Gerencie suas Contas")).toBeTruthy();
  });

  it("exibe a descrição do slide", () => {
    render(<RenderSlide {...createProps()} />);
    expect(
      screen.getByText(
        "Controle todas as despesas da república em um só lugar",
      ),
    ).toBeTruthy();
  });

  it("renderiza com index diferente de zero", () => {
    render(<RenderSlide {...createProps({ index: 1 })} />);
    expect(screen.getByText("Gerencie suas Contas")).toBeTruthy();
  });

  it("renderiza slide com dados diferentes", () => {
    const outroSlide: OnboardingSlide = {
      id: "2",
      title: "Divida as Despesas",
      description: "Calcule automaticamente quanto cada morador deve pagar",
      image: "https://example.com/img2.jpg",
      color: "#C87223",
    };
    render(<RenderSlide {...createProps({ item: outroSlide, index: 1 })} />);
    expect(screen.getByText("Divida as Despesas")).toBeTruthy();
    expect(
      screen.getByText(
        "Calcule automaticamente quanto cada morador deve pagar",
      ),
    ).toBeTruthy();
  });
});
