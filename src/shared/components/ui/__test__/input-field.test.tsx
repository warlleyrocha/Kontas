import { fireEvent, render, screen } from "@testing-library/react-native";
import InputField from "../input-field";

describe("InputField", () => {
  it("monta sem erros", () => {
    render(<InputField label="Nome" value="" onChangeText={jest.fn()} />);
  });

  it("exibe o label", () => {
    render(<InputField label="Nome" value="" onChangeText={jest.fn()} />);
    expect(screen.getByText("Nome")).toBeTruthy();
  });

  it("usa o label como placeholder padrão", () => {
    render(<InputField label="Email" value="" onChangeText={jest.fn()} />);
    expect(screen.getByPlaceholderText("Email")).toBeTruthy();
  });

  it("usa o placeholder customizado quando fornecido", () => {
    render(
      <InputField
        label="Email"
        placeholder="Digite seu email"
        value=""
        onChangeText={jest.fn()}
      />
    );
    expect(screen.getByPlaceholderText("Digite seu email")).toBeTruthy();
  });

  it("exibe o valor atual no input", () => {
    render(
      <InputField label="Nome" value="Warlley" onChangeText={jest.fn()} />
    );
    expect(screen.getByDisplayValue("Warlley")).toBeTruthy();
  });

  it("chama onChangeText ao digitar", () => {
    const onChangeText = jest.fn();
    render(<InputField label="Nome" value="" onChangeText={onChangeText} />);

    fireEvent.changeText(screen.getByPlaceholderText("Nome"), "novo texto");

    expect(onChangeText).toHaveBeenCalledWith("novo texto");
  });
});
