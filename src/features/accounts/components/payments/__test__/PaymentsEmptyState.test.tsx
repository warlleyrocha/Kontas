import { render, screen } from "@testing-library/react-native";
import { RefreshControl } from "react-native";
import { StatusPagamento } from "../../../types/accountResidents.types";
import { PaymentsEmptyState } from "../PaymentsEmptyState";

jest.mock("@/src/shared/components/EmptyState", () => ({
  EmptyState: ({
    title,
    description,
  }: {
    title: string;
    description: string;
  }) => {
    const { Text, View } = jest.requireActual("react-native");
    return (
      <View>
        <Text>{title}</Text>
        <Text>{description}</Text>
      </View>
    );
  },
}));

const createProps = (overrides = {}) => ({
  isRefreshing: false,
  onRefresh: jest.fn(),
  selectedStatus: "todos" as const,
  ...overrides,
});

describe("PaymentsEmptyState", () => {
  it("monta sem erros", () => {
    render(<PaymentsEmptyState {...createProps()} />);
  });

  it("exibe título e descrição para status PAGO", () => {
    render(
      <PaymentsEmptyState
        {...createProps({ selectedStatus: StatusPagamento.PAGO })}
      />
    );
    expect(screen.getByText("Nenhum pagamento pago")).toBeTruthy();
    expect(
      screen.getByText("Nenhum pagamento foi confirmado como PAGO no momento.")
    ).toBeTruthy();
  });

  it("exibe título e descrição para status AGUARDANDO_CONFIRMACAO", () => {
    render(
      <PaymentsEmptyState
        {...createProps({
          selectedStatus: StatusPagamento.AGUARDANDO_CONFIRMACAO,
        })}
      />
    );
    expect(screen.getByText("Nada para confirmar")).toBeTruthy();
    expect(
      screen.getByText(
        "Nenhum pagamento enviado por moradores está aguardando confirmação no momento."
      )
    ).toBeTruthy();
  });

  it("exibe título e descrição padrão para status 'todos'", () => {
    render(<PaymentsEmptyState {...createProps()} />);
    expect(screen.getByText("Nenhum pagamento encontrado")).toBeTruthy();
    expect(
      screen.getByText(
        "Não há pagamentos com status PAGO ou aguardando confirmação no momento."
      )
    ).toBeTruthy();
  });

  it("chama onRefresh ao acionar o RefreshControl", () => {
    const props = createProps();
    const { UNSAFE_getByType } = render(<PaymentsEmptyState {...props} />);

    UNSAFE_getByType(RefreshControl).props.onRefresh();

    expect(props.onRefresh).toHaveBeenCalledTimes(1);
  });

  it("passa isRefreshing para o RefreshControl", () => {
    const { UNSAFE_getByType } = render(
      <PaymentsEmptyState {...createProps({ isRefreshing: true })} />
    );
    expect(UNSAFE_getByType(RefreshControl).props.refreshing).toBe(true);
  });
});
