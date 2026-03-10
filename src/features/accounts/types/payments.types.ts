import type { ContaMorador } from "./accountResidents.types";
import type { Conta } from "./account.types";

export interface PendingPaymentAccount extends Conta {
  readonly pendingResidents: ContaMorador[];
}
