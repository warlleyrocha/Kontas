// Funções auxiliares
export const formatMounthYear = (mesAno: string): string => {
  const [ano, mes] = mesAno.split("-");
  const meses = [
    "Jan",
    "Fev",
    "Mar",
    "Abr",
    "Mai",
    "Jun",
    "Jul",
    "Ago",
    "Set",
    "Out",
    "Nov",
    "Dez",
  ];
  return `${meses[parseInt(mes) - 1]}/${ano}`;
};

export const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
  });
};

export function formatIntWithDots(intPart: string): string {
  let result = "";
  const len = intPart.length;
  for (let i = 0; i < len; i++) {
    if (i > 0 && (len - i) % 3 === 0) result += ".";
    result += intPart[i];
  }
  return result;
}

export function formatBRL(value: number): string {
  const [intPart, decPart] = value.toFixed(2).split(".");
  return `${formatIntWithDots(intPart)},${decPart}`;
}

export function formatCurrency(value: number): string {
  return `R$ ${formatBRL(value)}`;
}
