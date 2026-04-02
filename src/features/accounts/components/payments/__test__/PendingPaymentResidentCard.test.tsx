import { fireEvent, render, screen } from "@testing-library/react-native";
import {
  type ContaMorador,
  StatusPagamento,
} from "@/src/features/accounts/types/accountResidents.types";
import { PendingPaymentResidentCard } from "../PendingPaymentResidentCard";

function createResident(overrides?: Partial<ContaMorador>): ContaMorador {
  return {
    id: "resident-1",
    contaId: "account-1",
    moradorId: "resident-1",
    moradorNome: "João Silva",
    status: StatusPagamento.AGUARDANDO_CONFIRMACAO,
    valor: 60,
    visivel: true,
    pagoEm: null,
    metodoPagamento: "PIX",
    criadoEm: "2026-03-20T00:00:00.000Z",
    atualizadoEm: "2026-03-20T00:00:00.000Z",
    ...overrides,
  };
}

const defaultProps = {
  accountId: "account-1",
  isConfirming: false,
  isRefusing: false,
  onConfirmResidentPayment: jest.fn(),
  onRefuseResidentPayment: jest.fn(),
};

describe("PendingPaymentResidentCard", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renderiza nome, iniciais, valor e método de pagamento do morador", () => {
    render(
      <PendingPaymentResidentCard
        {...defaultProps}
        resident={createResident()}
      />
    );

    expect(screen.getByText("João Silva")).toBeTruthy();
    expect(screen.getByText("JS")).toBeTruthy();
    expect(screen.getByText("R$ 60,00")).toBeTruthy();
    expect(screen.getByText("Via PIX")).toBeTruthy();
  });

  it("exibe badge 'Aguardando' quando status é AGUARDANDO_CONFIRMACAO", () => {
    render(
      <PendingPaymentResidentCard
        {...defaultProps}
        resident={createResident({
          status: StatusPagamento.AGUARDANDO_CONFIRMACAO,
        })}
      />
    );

    expect(screen.getByText("Aguardando")).toBeTruthy();
  });

  it("exibe badge 'Pago' quando status é PAGO", () => {
    render(
      <PendingPaymentResidentCard
        {...defaultProps}
        resident={createResident({
          status: StatusPagamento.PAGO,
        })}
      />
    );

    expect(screen.getByText("Pago")).toBeTruthy();
  });

  it("exibe badge 'Pendente' quando status é PENDENTE", () => {
    render(
      <PendingPaymentResidentCard
        {...defaultProps}
        resident={createResident({
          status: StatusPagamento.PENDENTE,
        })}
      />
    );

    expect(screen.getByText("Pendente")).toBeTruthy();
  });

  it("exibe botões 'Confirmar' e 'Recusar' quando morador não pagou", () => {
    render(
      <PendingPaymentResidentCard
        {...defaultProps}
        resident={createResident({
          status: StatusPagamento.AGUARDANDO_CONFIRMACAO,
        })}
      />
    );

    expect(screen.getByText("Confirmar")).toBeTruthy();
    expect(screen.getByText("Recusar")).toBeTruthy();
  });

  it("não exibe botões quando morador já pagou", () => {
    render(
      <PendingPaymentResidentCard
        {...defaultProps}
        resident={createResident({
          status: StatusPagamento.PAGO,
        })}
      />
    );

    expect(screen.queryByText("Confirmar")).toBeNull();
    expect(screen.queryByText("Recusar")).toBeNull();
  });

  it("chama onConfirmResidentPayment com accountId e residentId ao pressionar 'Confirmar'", () => {
    const onConfirmResidentPayment = jest.fn();

    render(
      <PendingPaymentResidentCard
        {...defaultProps}
        onConfirmResidentPayment={onConfirmResidentPayment}
        resident={createResident()}
      />
    );

    fireEvent.press(screen.getByText("Confirmar"));

    expect(onConfirmResidentPayment).toHaveBeenCalledWith(
      "account-1",
      "resident-1"
    );
  });

  it("chama onRefuseResidentPayment com accountId e residentId ao pressionar 'Recusar'", () => {
    const onRefuseResidentPayment = jest.fn();

    render(
      <PendingPaymentResidentCard
        {...defaultProps}
        onRefuseResidentPayment={onRefuseResidentPayment}
        resident={createResident()}
      />
    );

    fireEvent.press(screen.getByText("Recusar"));

    expect(onRefuseResidentPayment).toHaveBeenCalledWith(
      "account-1",
      "resident-1"
    );
  });

  it("exibe ActivityIndicator no botão Confirmar e desabilita ambos quando isConfirming é true", () => {
    render(
      <PendingPaymentResidentCard
        {...defaultProps}
        isConfirming={true}
        resident={createResident()}
      />
    );

    expect(screen.queryByText("Confirmar")).toBeNull();
    expect(screen.getByText("Recusar")).toBeTruthy();
  });

  it("exibe ActivityIndicator no botão Recusar e desabilita ambos quando isRefusing é true", () => {
    render(
      <PendingPaymentResidentCard
        {...defaultProps}
        isRefusing={true}
        resident={createResident()}
      />
    );

    expect(screen.queryByText("Recusar")).toBeNull();
    expect(screen.getByText("Confirmar")).toBeTruthy();
  });

  it("exibe mensagem padrão quando metodoPagamento é null", () => {
    render(
      <PendingPaymentResidentCard
        {...defaultProps}
        resident={createResident({ metodoPagamento: null })}
      />
    );

    expect(screen.getByText("Pagamento enviado para confirmação")).toBeTruthy();
  });
});
