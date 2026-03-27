import { fireEvent, render, screen } from "@testing-library/react-native";
import { NextButton } from "../NextButton";

jest.mock("@expo/vector-icons/Feather", () => ({
  __esModule: true,
  default: () => null,
}));

describe("NextButton", () => {
  const onNext = jest.fn();
  const onCancel = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renderiza os botões Próximo e Cancelar", () => {
    render(<NextButton onNext={onNext} onCancel={onCancel} />);

    expect(screen.getByText("Próximo")).toBeTruthy();
    expect(screen.getByText("Cancelar")).toBeTruthy();
  });

  it("chama onNext ao pressionar Próximo", () => {
    render(<NextButton onNext={onNext} onCancel={onCancel} />);

    fireEvent.press(screen.getByRole("button", { name: "Próximo" }));

    expect(onNext).toHaveBeenCalledTimes(1);
  });

  it("chama onCancel ao pressionar Cancelar", () => {
    render(<NextButton onNext={onNext} onCancel={onCancel} />);

    fireEvent.press(
      screen.getByRole("button", { name: "Cancelar adição de conta" })
    );

    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it("desabilita o botão Próximo quando disabled=true", () => {
    render(<NextButton onNext={onNext} onCancel={onCancel} disabled />);

    const button = screen.getByRole("button", { name: "Próximo" });
    expect(button.props.accessibilityState).toEqual({ disabled: true });
  });
});
