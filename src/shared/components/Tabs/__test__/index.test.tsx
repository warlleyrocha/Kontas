import { fireEvent, render, screen } from "@testing-library/react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import Tabs from "../index";

jest.mock("@expo/vector-icons/MaterialCommunityIcons", () => ({
  __esModule: true,
  default: jest.fn(() => null),
}));

const mockMaterialCommunityIcons = jest.mocked(MaterialCommunityIcons);

describe("Tabs", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("monta sem erros e renderiza as três abas", () => {
    render(<Tabs value="contas" onChange={() => {}} />);

    expect(screen.getAllByRole("button")).toHaveLength(3);
    expect(screen.getByText("Contas")).toBeTruthy();
    expect(screen.getByText("Moradores")).toBeTruthy();
    expect(screen.getByText("Resumo")).toBeTruthy();
  });

  it("marca a aba ativa e renderiza os ícones com as cores corretas", () => {
    render(<Tabs value="contas" onChange={() => {}} />);

    const contasButton = screen.getByLabelText("Selecionar aba Contas");
    const moradoresButton = screen.getByLabelText("Selecionar aba Moradores");
    const resumoButton = screen.getByLabelText("Selecionar aba Resumo");

    expect(contasButton.props.accessibilityState).toEqual({ selected: true });
    expect(moradoresButton.props.accessibilityState).toEqual({
      selected: false,
    });
    expect(resumoButton.props.accessibilityState).toEqual({ selected: false });

    expect(screen.getByText("Contas").props.className).toBe(
      "font-semibold text-teal",
    );
    expect(screen.getByText("Moradores").props.className).toBe(
      "text-gray-500",
    );
    expect(screen.getByText("Resumo").props.className).toBe("text-gray-500");

    expect(
      mockMaterialCommunityIcons.mock.calls.map(([props]) => props),
    ).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: "bank",
          size: 20,
          color: "#337176",
        }),
        expect.objectContaining({
          name: "account-group-outline",
          size: 20,
          color: "#6b6b6b",
        }),
        expect.objectContaining({
          name: "chart-bar",
          size: 20,
          color: "#6b6b6b",
        }),
      ]),
    );
  });

  it("chama onChange com a chave da aba pressionada", () => {
    const onChange = jest.fn();
    render(<Tabs value="contas" onChange={onChange} />);

    fireEvent.press(screen.getByLabelText("Selecionar aba Moradores"));
    fireEvent.press(screen.getByLabelText("Selecionar aba Resumo"));

    expect(onChange).toHaveBeenNthCalledWith(1, "moradores");
    expect(onChange).toHaveBeenNthCalledWith(2, "resumo");
  });
});
