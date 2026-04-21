import { fireEvent, render, screen } from "@testing-library/react-native";
import IncompleteProfile from "../index";

const onContinue = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
});

describe("IncompleteProfile", () => {
  it("renderiza os textos principais", () => {
    render(<IncompleteProfile onContinue={onContinue} />);

    expect(screen.getByText("QUASE LÁ!")).toBeTruthy();
    expect(screen.getByText("Complete seu perfil")).toBeTruthy();
    expect(screen.getByText("Continuar")).toBeTruthy();
  });

  it("chama onContinue ao pressionar o botão", () => {
    render(<IncompleteProfile onContinue={onContinue} />);

    fireEvent.press(screen.getByText("Continuar"));

    expect(onContinue).toHaveBeenCalledTimes(1);
  });
});
