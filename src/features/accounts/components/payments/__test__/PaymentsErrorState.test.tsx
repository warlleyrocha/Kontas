import { fireEvent, render, screen } from "@testing-library/react-native";
import { PaymentsErrorState } from "../PaymentsErrorState";

describe("PaymentsErrorState", () => {
  it("monta sem erros e exibe as mensagens", () => {
    render(
      <PaymentsErrorState
        message="Falha ao consultar a API"
        onRetry={() => {}}
      />
    );

    expect(
      screen.getByText("Não foi possível carregar os pagamentos.")
    ).toBeTruthy();
    expect(screen.getByText("Falha ao consultar a API")).toBeTruthy();
    expect(
      screen.getByLabelText("Tentar carregar pagamentos novamente")
    ).toBeTruthy();
  });

  it("chama onRetry ao pressionar o botão", () => {
    const onRetry = jest.fn();

    render(
      <PaymentsErrorState
        message="Falha ao consultar a API"
        onRetry={onRetry}
      />
    );

    fireEvent.press(
      screen.getByLabelText("Tentar carregar pagamentos novamente")
    );

    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});
