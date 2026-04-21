import { fireEvent, render, screen } from "@testing-library/react-native";
import { TouchableOpacity } from "react-native";
import { AddAccountModalActions } from "../AddAccountModalActions";

describe("AddAccountModalActions", () => {
  it("monta sem erros", () => {
    render(<AddAccountModalActions onSubmit={() => {}} onCancel={() => {}} />);
  });

  it("exibe o botão Adicionar Conta", () => {
    render(<AddAccountModalActions onSubmit={() => {}} onCancel={() => {}} />);
    expect(screen.getByText("Adicionar Conta")).toBeTruthy();
  });

  it("exibe o botão Voltar", () => {
    render(<AddAccountModalActions onSubmit={() => {}} onCancel={() => {}} />);
    expect(screen.getByText("Voltar")).toBeTruthy();
  });

  it("chama onCancel ao pressionar Voltar", () => {
    const onCancel = jest.fn();
    render(<AddAccountModalActions onSubmit={() => {}} onCancel={onCancel} />);

    const [cancelButton] = screen.UNSAFE_getAllByType(TouchableOpacity);
    fireEvent.press(cancelButton);

    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it("chama onSubmit ao pressionar Adicionar Conta", () => {
    const onSubmit = jest.fn();
    render(<AddAccountModalActions onSubmit={onSubmit} onCancel={() => {}} />);

    const [, submitButton] = screen.UNSAFE_getAllByType(TouchableOpacity);
    fireEvent.press(submitButton);

    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it("oculta o texto do botão e exibe spinner quando isSubmitting é true", () => {
    render(
      <AddAccountModalActions
        onSubmit={() => {}}
        onCancel={() => {}}
        isSubmitting
      />
    );
    expect(screen.queryByText("Adicionar Conta")).toBeNull();
  });

  it("desabilita o botão Adicionar Conta quando isSubmitting é true", () => {
    render(
      <AddAccountModalActions
        onSubmit={() => {}}
        onCancel={() => {}}
        isSubmitting
      />
    );
    expect(screen.getByLabelText("Adicionar conta")).toBeDisabled();
  });
});
