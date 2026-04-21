import { formatBRL } from "@/src/shared/utils/formats";
import type { MoradorDivisao, TipoDivisao } from "../types/accountForm.types";

export function parseCurrencyValue(value: string): number {
  const normalized = value.replace(/\./g, "").replace(",", ".").trim();
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function splitEvenly(total: number, parts: number): number[] {
  if (!parts) return [];

  const cents = Math.round(total * 100);
  const base = Math.floor(cents / parts);
  let remainder = cents - base * parts;

  return Array.from({ length: parts }, () => {
    const current = base + (remainder > 0 ? 1 : 0);
    remainder = Math.max(0, remainder - 1);
    return current / 100;
  });
}

export function applyEqualSplitValues(
  list: MoradorDivisao[],
  values: number[]
): MoradorDivisao[] {
  let cursor = 0;

  return list.map((morador) => {
    if (!morador.checked) return { ...morador, valor: "" };

    const nextValue = values[cursor] ?? 0;
    cursor += 1;

    return {
      ...morador,
      valor: formatBRL(nextValue),
    };
  });
}

export function applySplitByType(
  list: MoradorDivisao[],
  type: TipoDivisao,
  totalValue: string
): MoradorDivisao[] {
  const selected = list.filter((morador) => morador.checked);
  if (!selected.length)
    return list.map((morador) => ({ ...morador, valor: "" }));

  if (type === "custom") {
    const getValor = (morador: MoradorDivisao) => {
      if (!morador.checked) return "";
      return morador.valor || "0,00";
    };

    return list.map((morador) => ({
      ...morador,
      valor: getValor(morador),
    }));
  }

  const total = parseCurrencyValue(totalValue);
  const values = splitEvenly(total, selected.length);

  return applyEqualSplitValues(list, values);
}
