import { fireEvent, render, screen } from "@testing-library/react-native";
import { TouchableOpacity } from "react-native";
import { AddAccountModalActions } from "../components/create/AddAccountModalActions";

describe("AddAccountModalActions", () => {
  it("monta sem erros", () => {
    render(<AddAccountModalActions onSubmit={() => {}} onCancel={() => {}} />);
  });

  it("exibe o botão Adicionar Conta", () => {
    render(<AddAccountModalActions onSubmit={() => {}} onCancel={() => {}} />);
    expect(screen.getByText("Adicionar Conta")).toBeTruthy();
  });

  it("exibe o botão Cancelar", () => {
    render(<AddAccountModalActions onSubmit={() => {}} onCancel={() => {}} />);
    expect(screen.getByText("Cancelar")).toBeTruthy();
  });

  it("chama onSubmit ao pressionar Adicionar Conta", () => {
    const onSubmit = jest.fn();
    render(<AddAccountModalActions onSubmit={onSubmit} onCancel={() => {}} />);

    const [submitButton] = screen.UNSAFE_getAllByType(TouchableOpacity);
    fireEvent.press(submitButton);

    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it("chama onCancel ao pressionar Cancelar", () => {
    const onCancel = jest.fn();
    render(<AddAccountModalActions onSubmit={() => {}} onCancel={onCancel} />);

    const [, cancelButton] = screen.UNSAFE_getAllByType(TouchableOpacity);
    fireEvent.press(cancelButton);

    expect(onCancel).toHaveBeenCalledTimes(1);
  });
});
