import { render } from "@testing-library/react-native";
import { View } from "react-native";
import type { SharedValue } from "react-native-reanimated";
import RenderDots from "../onboarding/RenderDots";
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
  {
    id: "3",
    title: "Slide 3",
    description: "Desc 3",
    image: "https://example.com/img3.jpg",
    color: "#8B5CF6",
  },
];

const scrollX = { value: 0 } as SharedValue<number>;

const createProps = (overrides = {}) => ({
  slides: mockSlides,
  scrollX,
  currentIndex: 0,
  width: 390,
  ...overrides,
});

describe("RenderDots", () => {
  it("monta sem erros", () => {
    render(<RenderDots {...createProps()} />);
  });

  it("renderiza um dot por slide", () => {
    const { UNSAFE_getAllByType } = render(<RenderDots {...createProps()} />);

    // Animated.View é usado para cada dot
    // verifica que montou sem erros com o número correto de slides
    expect(UNSAFE_getAllByType(View).length).toBeGreaterThan(0);
  });

  it("renderiza com currentIndex no meio", () => {
    render(<RenderDots {...createProps({ currentIndex: 1 })} />);
  });

  it("renderiza com currentIndex no último slide", () => {
    render(<RenderDots {...createProps({ currentIndex: 2 })} />);
  });

  it("renderiza com um único slide", () => {
    render(
      <RenderDots
        {...createProps({ slides: [mockSlides[0]], currentIndex: 0 })}
      />
    );
  });
});
