export type Morador = {
  id: string;
  nome: string;
  chavePix?: string;
  fotoPerfil?: string;
  telefone?: string;
};

export type Responsavel = {
  moradorId: string;
  valor: number;
  pago?: boolean;
};

export type Conta = {
  id: string;
  descricao: string;
  valor: number;
  vencimento: string; // ISO date
  pago: boolean;
  pagoEm?: string; // ISO date
  responsavelId: string; // morador responsável principal
  responsaveis: Responsavel[]; // divisão
  metodoPagamento?: string;
};

export type Republica = {
  id: string;
  nome: string;
  imagemRepublica?: string;
  moradores: Morador[];
  contas: Conta[];
};
