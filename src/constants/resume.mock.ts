// mock/resume.mock.ts

export const mockRepublica = {
  contas: [
    { id: 1, descricao: "Aluguel", valor: 1200, pago: true },
    { id: 2, descricao: "Internet", valor: 99.9, pago: true },
    { id: 3, descricao: "Energia", valor: 350, pago: false },
    { id: 4, descricao: "Água", valor: 180, pago: false },
  ],
  moradores: [
    { id: 1, nome: "João", chavePix: "joao@pix.com" },
    { id: 2, nome: "Maria", chavePix: "maria@pix.com" },
    { id: 3, nome: "Pedro", chavePix: null },
  ],
};

// Dívidas por morador
export const mockDividas: Record<number, number> = {
  1: 180,
  2: 0,
  3: 350,
};
