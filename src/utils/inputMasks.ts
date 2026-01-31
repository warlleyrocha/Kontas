// utils/inputMasks.ts
// Utilitário para máscaras de input

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

  while (cleaned.endsWith("-") || cleaned.endsWith(" ")) {
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
