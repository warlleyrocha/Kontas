interface Responsavel {
  moradorId: string;
  valor: number;
  pago?: boolean;
}

interface Conta {
  id: string;
  descricao: string;
  valor: number;
  vencimento: string;
  status: string;
  mesReferencia: string;
  responsaveis: Responsavel[];
  pago: boolean;
  pagoEm?: string; // ISO date,
  metodoPagamento?: string;
}

export const mesesDisponiveis = ["2024-01", "2024-02", "2024-03", "2024-04"];

export const contasMockadas: Conta[] = [
  {
    id: "1",
    descricao: "Energia Elétrica",
    valor: 250.5,
    vencimento: "2024-03-15",
    status: "aberta",
    mesReferencia: "2024-03",
    metodoPagamento: "PIX",
    pago: false,
    responsaveis: [
      { moradorId: "1", valor: 83.5, pago: true },
      { moradorId: "2", valor: 83.5, pago: false },
      { moradorId: "3", valor: 83.5, pago: false },
    ],
  },
  {
    id: "2",
    descricao: "Água",
    valor: 120.0,
    vencimento: "2024-03-20",
    status: "aberta",
    mesReferencia: "2024-03",
    pago: false,
    responsaveis: [
      { moradorId: "1", valor: 40.0, pago: false },
      { moradorId: "2", valor: 40.0, pago: false },
      { moradorId: "3", valor: 40.0, pago: false },
    ],
  },
  {
    id: "3",
    descricao: "Internet",
    valor: 99.9,
    vencimento: "2024-03-10",
    status: "paga",
    mesReferencia: "2024-03",
    metodoPagamento: "Cartão de Crédito",
    pago: true,
    pagoEm: "2024-03-08",
    responsaveis: [
      { moradorId: "1", valor: 33.3, pago: true },
      { moradorId: "2", valor: 33.3, pago: true },
      { moradorId: "3", valor: 33.3, pago: true },
    ],
  },
  {
    id: "4",
    descricao: "Aluguel",
    valor: 1500.0,
    vencimento: "2024-03-05",
    status: "paga",
    mesReferencia: "2024-03",
    metodoPagamento: "Transferência",
    pago: true,
    pagoEm: "2024-03-04",
    responsaveis: [
      { moradorId: "1", valor: 500.0, pago: true },
      { moradorId: "2", valor: 500.0, pago: true },
      { moradorId: "3", valor: 500.0, pago: true },
    ],
  },
  {
    id: "5",
    descricao: "Gás",
    valor: 85.0,
    vencimento: "2026-01-25",
    status: "aberta",
    mesReferencia: "2024-02",
    pago: false,
    responsaveis: [
      { moradorId: "1", valor: 28.33, pago: false },
      { moradorId: "2", valor: 28.33, pago: false },
      { moradorId: "3", valor: 28.34, pago: false },
    ],
  },
];

// Mock de moradores para exibir nomes
export const moradoresMock = [
  { id: "1", nome: "João Silva" },
  { id: "2", nome: "Maria Santos" },
  { id: "3", nome: "Pedro Costa" },
];

export const responsavel = {
  id: "1",
  nome: "João Silva",
  chavePix: "joao@email.com",
};
