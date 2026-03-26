import { fireEvent, render, screen } from "@testing-library/react-native";
import type { SharedValue } from "react-native-reanimated";
import OnboardingButtons from "../onboarding/OnboardingButtons";
import type { OnboardingSlide } from "../../constants/slides";

const mockSlides: OnboardingSlide[] = [
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
];

const scrollX = { value: 0 } as SharedValue<number>;

const createProps = (overrides = {}) => ({
  isLastSlide: false,
  currentIndex: 0,
  slides: mockSlides,
  handleNext: jest.fn(),
  handleSkip: jest.fn(),
  scrollX,
  width: 390,
  ...overrides,
});

describe("OnboardingButtons", () => {
  it("monta sem erros", () => {
    render(<OnboardingButtons {...createProps()} />);
  });

  it("exibe 'Continuar' quando não é o último slide", () => {
    render(<OnboardingButtons {...createProps()} />);
    expect(screen.getByText("Continuar")).toBeTruthy();
  });

  it("exibe 'Começar Agora' quando é o último slide", () => {
    render(<OnboardingButtons {...createProps({ isLastSlide: true })} />);
    expect(screen.getByText("Começar Agora")).toBeTruthy();
  });

  it("exibe o botão 'Pular' quando currentIndex é 0", () => {
    render(<OnboardingButtons {...createProps({ currentIndex: 0 })} />);
    expect(screen.getByText("Pular")).toBeTruthy();
  });

  it("não exibe o botão 'Pular' quando currentIndex > 0", () => {
    render(<OnboardingButtons {...createProps({ currentIndex: 1 })} />);
    expect(screen.queryByText("Pular")).toBeNull();
  });

  it("chama handleNext ao pressionar o botão principal", () => {
    const props = createProps();
    render(<OnboardingButtons {...props} />);

    fireEvent.press(screen.getByText("Continuar"));

    expect(props.handleNext).toHaveBeenCalledTimes(1);
  });

  it("chama handleSkip ao pressionar 'Pular'", () => {
    const props = createProps({ currentIndex: 0 });
    render(<OnboardingButtons {...props} />);

    fireEvent.press(screen.getByText("Pular"));

    expect(props.handleSkip).toHaveBeenCalledTimes(1);
  });
});
