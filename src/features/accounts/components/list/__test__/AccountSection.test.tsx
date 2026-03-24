import { fireEvent, render, screen } from "@testing-library/react-native";
import { TouchableOpacity } from "react-native";

import { AccountSection } from "../AccountSection";
import {
  MetodoPagamento,
  StatusConta,
  type Conta,
} from "../../../types/account.types";

jest.mock("@expo/vector-icons/MaterialCommunityIcons", () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock("../AccountCard", () => ({
  AccountCard: ({
    conta,
    onToggleExpand,
    onLongPress,
  }: {
    conta: Conta;
    onToggleExpand: () => void;
    onLongPress?: (position: {
      x: number;
      y: number;
      width: number;
      height: number;
    }) => void;
  }) => {
    const { TouchableOpacity, View, Text } = jest.requireActual("react-native");
    return (
      <View>
        <Text testID={`card-${conta.id}`}>{conta.descricao}</Text>
        <TouchableOpacity
          onPress={onToggleExpand}
          accessibilityRole="button"
          accessibilityLabel={`toggle ${conta.id}`}
        />
        <TouchableOpacity
          onPress={() =>
            onLongPress?.({ x: 10, y: 20, width: 100, height: 50 })
          }
          accessibilityRole="button"
          accessibilityLabel={`longpress ${conta.id}`}
        />
      </View>
    );
  },
}));

const mockConta: Conta = {
  id: "conta-1",
  descricao: "Água",
  valor: 150,
  vencimento: "2026-03-22",
  status: StatusConta.PENDENTE,
  republicaId: "rep-1",
  criadoPorId: "user-1",
  criadoPorNome: "Carlos",
  metodoPagamento: MetodoPagamento.PIX,
  pago: false,
  criadoEm: "2026-03-01",
  atualizadoEm: "2026-03-01",
};

const createProps = (overrides = {}) => ({
  label: "Pendentes",
  contas: [mockConta],
  visivel: true,
  onToggle: jest.fn(),
  headerBg: "bg-gray-100",
  headerTextColor: "text-gray-800",
  headerIconColor: "#374151",
  expandedAccountId: null,
  onToggleExpand: jest.fn(),
  accountResidentsById: {},
  loadingResidentsById: {},
  errorResidentsById: {},
  updatingResidentById: {},
  currentResidentId: null,
  onLongPress: jest.fn(),
  onConfirmResidentPayment: jest.fn(),
  onPatch: jest.fn(),
  onCopyPix: jest.fn(),
  ...overrides,
});

describe("AccountSection", () => {
  it("monta sem erros", () => {
    render(<AccountSection {...createProps()} />);
  });

  it("retorna null quando contas está vazio", () => {
    render(<AccountSection {...createProps({ contas: [] })} />);
    expect(screen.queryByText(/Pendentes/)).toBeNull();
  });

  it("exibe o label com a contagem de contas", () => {
    render(<AccountSection {...createProps()} />);
    expect(screen.getByText("Pendentes (1)")).toBeTruthy();
  });

  it("exibe a contagem correta para múltiplas contas", () => {
    const contas = [
      mockConta,
      { ...mockConta, id: "conta-2", descricao: "Luz" },
    ];
    render(<AccountSection {...createProps({ contas })} />);
    expect(screen.getByText("Pendentes (2)")).toBeTruthy();
  });

  it("chama onToggle ao pressionar o header", () => {
    const props = createProps();
    const { UNSAFE_getAllByType } = render(<AccountSection {...props} />);

    // primeiro TouchableOpacity é o header
    fireEvent.press(UNSAFE_getAllByType(TouchableOpacity)[0]);

    expect(props.onToggle).toHaveBeenCalledTimes(1);
  });

  it("exibe AccountCards quando visivel é true", () => {
    render(<AccountSection {...createProps()} />);
    expect(screen.getByTestId("card-conta-1")).toBeTruthy();
  });

  it("não exibe AccountCards quando visivel é false", () => {
    render(<AccountSection {...createProps({ visivel: false })} />);
    expect(screen.queryByTestId("card-conta-1")).toBeNull();
  });

  it("chama onToggleExpand com o id da conta", () => {
    const props = createProps();
    render(<AccountSection {...props} />);

    fireEvent.press(screen.getByRole("button", { name: "toggle conta-1" }));

    expect(props.onToggleExpand).toHaveBeenCalledWith("conta-1");
  });

  it("chama onLongPress com o id da conta e a posição", () => {
    const props = createProps();
    render(<AccountSection {...props} />);

    fireEvent.press(screen.getByRole("button", { name: "longpress conta-1" }));

    expect(props.onLongPress).toHaveBeenCalledWith("conta-1", {
      x: 10,
      y: 20,
      width: 100,
      height: 50,
    });
  });
});
