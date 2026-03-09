import {
  StatusConta,
  Conta,
} from "@/src/features/accounts/types/account.types";

import {
  ContaMorador,
  StatusPagamento,
} from "@/src/features/accounts/types/accountResidents.types";

export type ContaStatusIcon =
  | {
      library: "material";
      name: "payment";
      color: "#16a34a";
    }
  | {
      library: "material-community";
      name: "alert-circle-outline" | "cash-clock";
      color: "#dc2626" | "#6b7280";
    };

export function parseContaVencimento(vencimento: string): Date | null {
  const onlyDateMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(vencimento);
  if (onlyDateMatch) {
    const [, year, month, day] = onlyDateMatch;
    return new Date(Number(year), Number(month) - 1, Number(day));
  }

  const parsedDate = new Date(vencimento);
  if (Number.isNaN(parsedDate.getTime())) {
    return null;
  }

  return parsedDate;
}

export function getContaStatusVisual(conta: Conta): StatusConta {
  const vencimento = parseContaVencimento(conta.vencimento);
  const isVencimentoValido = vencimento !== null;
  let atrasadaPorVencimento = false;

  if (vencimento && isVencimentoValido) {
    vencimento.setHours(23, 59, 59, 999);
    atrasadaPorVencimento = vencimento < new Date();
  }

  if (conta.pago || conta.status === StatusConta.PAGO) {
    return StatusConta.PAGO;
  }

  if (conta.status === StatusConta.ATRASADO || atrasadaPorVencimento) {
    return StatusConta.ATRASADO;
  }

  return StatusConta.PENDENTE;
}

export function getContaStatusIcon(statusConta: StatusConta): ContaStatusIcon {
  if (statusConta === StatusConta.PAGO) {
    return {
      library: "material",
      name: "payment",
      color: "#16a34a",
    };
  }

  if (statusConta === StatusConta.ATRASADO) {
    return {
      library: "material-community",
      name: "alert-circle-outline",
      color: "#dc2626",
    };
  }

  return {
    library: "material-community",
    name: "cash-clock",
    color: "#6b7280",
  };
}

export function getMoradorStatusVisual(
  contaMorador: ContaMorador
): StatusPagamento {
  if (
    contaMorador.status === StatusPagamento.PAGO ||
    Boolean(contaMorador.pagoEm)
  ) {
    return StatusPagamento.PAGO;
  }

  if (contaMorador.status === StatusPagamento.AGUARDANDO_CONFIRMACAO) {
    return StatusPagamento.AGUARDANDO_CONFIRMACAO;
  }

  return StatusPagamento.PENDENTE;
}

type MoradorStatusBadge = {
  backgroundClassName: string;
  textClassName: string;
  label: string;
};

export type MoradorStatusIcon =
  | {
      library: "material";
      name: "payment";
      color: "#16a34a";
    }
  | {
      library: "material-community";
      name: "progress-clock" | "account-clock-outline";
      color: "#d97706" | "#6b7280";
    };

export function getMoradorStatusBadge(
  statusPagamento: StatusPagamento
): MoradorStatusBadge {
  if (statusPagamento === StatusPagamento.PAGO) {
    return {
      backgroundClassName: "bg-green-50",
      textClassName: "text-green-600",
      label: "Pago",
    };
  }

  if (statusPagamento === StatusPagamento.AGUARDANDO_CONFIRMACAO) {
    return {
      backgroundClassName: "bg-amber-50",
      textClassName: "text-amber-700",
      label: "Aguardando",
    };
  }

  return {
    backgroundClassName: "bg-gray-100",
    textClassName: "text-gray-600",
    label: "Pendente",
  };
}

export function getMoradorStatusIcon(
  statusPagamento: StatusPagamento
): MoradorStatusIcon {
  if (statusPagamento === StatusPagamento.PAGO) {
    return {
      library: "material",
      name: "payment",
      color: "#16a34a",
    };
  }

  if (statusPagamento === StatusPagamento.AGUARDANDO_CONFIRMACAO) {
    return {
      library: "material-community",
      name: "progress-clock",
      color: "#d97706",
    };
  }

  return {
    library: "material-community",
    name: "account-clock-outline",
    color: "#6b7280",
  };
}
