// utils/inputMasks.ts
// Utilitário para máscaras de input

import { formatIntWithDots } from "./formats";

export function maskPhone(value: string): string {
  // Remove tudo que não for número
  let cleaned = value.replaceAll(/\D/g, "");

  // Máscara para telefone brasileiro (com DDD): (99) 99999-9999 ou (99) 9999-9999
  if (cleaned.length <= 10) {
    // Formato fixo: (99) 9999-9999
    cleaned = cleaned.replace(/(\d{2})(\d{4})(\d{0,4})/, "($1) $2-$3");
  } else {
    // Formato celular: (99) 99999-9999
    cleaned = cleaned.replace(/(\d{2})(\d{5})(\d{0,4})/, "($1) $2-$3");
  }

  while (cleaned.endsWith("-") ?? cleaned.endsWith(" ")) {
    cleaned = cleaned.slice(0, -1);
  }

  return cleaned;
}

export function maskPhoneWrite(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11);

  if (digits.length === 0) return "";

  // (9
  if (digits.length <= 2) return `(${digits}`;

  const ddd = digits.slice(0, 2);
  const rest = digits.slice(2);

  // (99) 9...
  if (rest.length <= 4) return `(${ddd}) ${rest}`;

  // (99) 9999-9999 (fixo)
  if (digits.length <= 10) {
    return `(${ddd}) ${rest.slice(0, 4)}-${rest.slice(4)}`;
  }

  // (99) 99999-9999 (celular)
  return `(${ddd}) ${rest.slice(0, 5)}-${rest.slice(5)}`;
}

/**
 * Formata um valor numérico (em centavos) para o padrão BRL.
 * Ex: 150099 → "R$ 1.500,99"
 */
export function formatCurrencyBRL(valueInCents: number): string {
  const value = valueInCents / 100;
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

/**
 * Aplica máscara BRL a uma string de input (aceita apenas dígitos).
 * Ideal para usar em onChangeText de TextInput.
 * Ex: "150099" → "1.500,99"
 */
export function maskCurrencyBRL(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (!digits) return "";

  const valueInCents = parseInt(digits, 10);
  const value = (valueInCents / 100).toFixed(2);
  const [intPart, decPart] = value.split(".");

  return `${formatIntWithDots(intPart)},${decPart}`;
}

/**
 * Remove a máscara e retorna o valor em centavos (inteiro).
 * Ex: "1.500,99" → 150099
 */
export function unmaskCurrencyBRL(masked: string): number {
  const digits = masked.replace(/\D/g, "");
  return parseInt(digits, 10) || 0;
}
