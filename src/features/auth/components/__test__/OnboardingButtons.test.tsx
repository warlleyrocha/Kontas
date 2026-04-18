import { fireEvent, render, screen } from "@testing-library/react-native";
import type { OnboardingSlide } from "../../constants/slides";
import OnboardingButtons from "../onboarding/OnboardingButtons";

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

const createProps = (overrides = {}) => ({
  isLastSlide: false,
  currentIndex: 0,
  slides: mockSlides,
  handleNext: jest.fn(),
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

  it("chama handleNext ao pressionar o botão principal", () => {
    const props = createProps();
    render(<OnboardingButtons {...props} />);

    fireEvent.press(screen.getByText("Continuar"));

    expect(props.handleNext).toHaveBeenCalledTimes(1);
  });
});
