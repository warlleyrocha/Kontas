// resume.logic.ts

import { mockRepublica, mockDividas } from "@/src/constants/resume.mock";

export const totalContas = mockRepublica.contas.reduce(
  (acc, c) => acc + c.valor,
  0
);

export const contasPagas = mockRepublica.contas
  .filter((c) => c.pago)
  .reduce((acc, c) => acc + c.valor, 0);

export const contasPendentes = mockRepublica.contas
  .filter((c) => !c.pago)
  .reduce((acc, c) => acc + c.valor, 0);

export const quantidadeContasPagas = mockRepublica.contas.filter(
  (c) => c.pago
).length;
export const quantidadeContasPendentes = mockRepublica.contas.filter(
  (c) => !c.pago
).length;
export const quantidadeTotalContas = mockRepublica.contas.length;

export const dividas = mockDividas;
export const republicaMock = mockRepublica;
