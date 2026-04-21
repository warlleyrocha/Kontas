import { fireEvent, render, screen } from "@testing-library/react-native";
import { PlusButton as AddAccountButton } from "../../../../../shared/components/PlusButton";

jest.mock("@expo/vector-icons/Feather", () => ({
  __esModule: true,
  default: () => null,
}));

describe("AddAccountButton", () => {
  it("monta sem erros", () => {
    render(<AddAccountButton onPress={() => {}} />);
  });

  it("renderiza com accessibilityLabel correto", () => {
    render(<AddAccountButton onPress={() => {}} />);
    expect(screen.getByLabelText("Adicionar nova conta")).toBeTruthy();
  });

  it("chama onPress ao pressionar o botão", () => {
    const onPress = jest.fn();
    render(<AddAccountButton onPress={onPress} />);

    fireEvent.press(screen.getByRole("button"));

    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
