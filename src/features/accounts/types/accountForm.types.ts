export type TipoDivisao = "equal" | "custom";

export interface MoradorDivisao {
  fotoPerfil: string | null;
  role: string;
  moradorId: string;
  nome: string;
  checked: boolean;
  valor: string;
}
