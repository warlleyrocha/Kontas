import { MetodoPagamento } from "../../types/account.types";
import {
  formatPaymentMethodLabel,
  normalizeMetodoPagamento,
} from "../paymentMethod.utils";

// ─── normalizeMetodoPagamento ────────────────────────────────────────────────

describe("normalizeMetodoPagamento", () => {
  it("retorna PIX quando valor é null", () => {
    expect(normalizeMetodoPagamento(null)).toBe(MetodoPagamento.PIX);
  });

  it("retorna PIX para string 'pix' (case insensitive)", () => {
    expect(normalizeMetodoPagamento("pix")).toBe(MetodoPagamento.PIX);
  });

  it("retorna CARTAO para string 'CARTAO'", () => {
    expect(normalizeMetodoPagamento("CARTAO")).toBe(MetodoPagamento.CARTAO);
  });

  it("retorna CARTAO para string com acento 'Cartão'", () => {
    expect(normalizeMetodoPagamento("Cartão")).toBe(MetodoPagamento.CARTAO);
  });

  it("retorna DINHEIRO para string 'dinheiro'", () => {
    expect(normalizeMetodoPagamento("dinheiro")).toBe(MetodoPagamento.DINHEIRO);
  });

  it("retorna PIX para valor desconhecido", () => {
    expect(normalizeMetodoPagamento("boleto")).toBe(MetodoPagamento.PIX);
  });

  it("remove espaços ao redor", () => {
    expect(normalizeMetodoPagamento("  DINHEIRO  ")).toBe(
      MetodoPagamento.DINHEIRO
    );
  });
});

// ─── formatPaymentMethodLabel ────────────────────────────────────────────────

describe("formatPaymentMethodLabel", () => {
  it("retorna mensagem padrão quando method é null", () => {
    expect(formatPaymentMethodLabel(null)).toBe(
      "Pagamento enviado para confirmação"
    );
  });

  it("retorna 'Via Cartão' para CARTAO", () => {
    expect(formatPaymentMethodLabel("CARTAO")).toBe("Via Cartão");
  });

  it("retorna 'Via Cartão' para string com acento 'Cartão'", () => {
    expect(formatPaymentMethodLabel("Cartão")).toBe("Via Cartão");
  });

  it("retorna 'Via Dinheiro' para DINHEIRO", () => {
    expect(formatPaymentMethodLabel("DINHEIRO")).toBe("Via Dinheiro");
  });

  it("retorna 'Via PIX' para PIX", () => {
    expect(formatPaymentMethodLabel("PIX")).toBe("Via PIX");
  });

  it("retorna 'Via PIX' para valor desconhecido (normaliza para PIX)", () => {
    expect(formatPaymentMethodLabel("boleto")).toBe("Via PIX");
  });
});
