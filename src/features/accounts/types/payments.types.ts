import type { Conta } from "./account.types";
import type { ContaMorador, StatusPagamento } from "./accountResidents.types";

export interface PaymentAccount extends Conta {
  readonly residents: ContaMorador[];
}

export type PaymentStatusFilter =
  | "todos"
  | StatusPagamento.AGUARDANDO_CONFIRMACAO
  | StatusPagamento.PAGO;
