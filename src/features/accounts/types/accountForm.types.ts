export type TipoDivisao = "equal" | "custom";

export interface MoradorDivisao {
  moradorId: string;
  nome: string;
  checked: boolean;
  valor: string;
}
