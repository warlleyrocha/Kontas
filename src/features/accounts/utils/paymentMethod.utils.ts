import { MetodoPagamento } from "../types/account.types";

export function normalizeMetodoPagamento(
  metodoPagamento: string | null
): MetodoPagamento {
  if (!metodoPagamento) return MetodoPagamento.PIX;

  const normalized = metodoPagamento
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toUpperCase();

  if (normalized === MetodoPagamento.CARTAO) {
    return MetodoPagamento.CARTAO;
  }

  if (normalized === MetodoPagamento.DINHEIRO) {
    return MetodoPagamento.DINHEIRO;
  }

  return MetodoPagamento.PIX;
}

export function formatPaymentMethodLabel(method: string | null): string {
  if (!method) return "Pagamento enviado para confirmação";

  const normalized = normalizeMetodoPagamento(method);

  if (normalized === MetodoPagamento.CARTAO) return "Via Cartão";
  if (normalized === MetodoPagamento.DINHEIRO) return "Via Dinheiro";

  return `Via ${normalized}`;
}
