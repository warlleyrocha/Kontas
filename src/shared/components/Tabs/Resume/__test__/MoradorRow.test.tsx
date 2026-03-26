import { render, screen } from "@testing-library/react-native";
import type { ResidentResponse } from "@/src/shared/types/resident.types";
import { MoradorRow } from "../MoradorRow";

const mockMorador: ResidentResponse = {
  id: "m-1",
  nome: "Ana",
  email: "ana@email.com",
  fotoPerfil: null,
  chavePix: null,
  telefone: null,
  role: "MORADOR" as any,
};

describe("MoradorRow", () => {
  it("monta sem erros", () => {
    render(<MoradorRow morador={mockMorador} valor={50} />);
  });

  it("exibe o nome do morador", () => {
    render(<MoradorRow morador={mockMorador} valor={50} />);
    expect(screen.getByText("Ana")).toBeTruthy();
  });

  it("exibe o valor formatado", () => {
    render(<MoradorRow morador={mockMorador} valor={75.5} />);
    expect(screen.getByText("R$ 75,50")).toBeTruthy();
  });

  it("exibe 'Pendente' quando valor > 0", () => {
    render(<MoradorRow morador={mockMorador} valor={50} />);
    expect(screen.getByText("Pendente")).toBeTruthy();
  });

  it("exibe 'Em dia' quando valor é 0", () => {
    render(<MoradorRow morador={mockMorador} valor={0} />);
    expect(screen.getByText("Em dia")).toBeTruthy();
  });

  it("exibe a chave PIX quando fornecida", () => {
    const moradorComPix = { ...mockMorador, chavePix: "ana@pix.com" };
    render(<MoradorRow morador={moradorComPix} valor={0} />);
    expect(screen.getByText("PIX: ana@pix.com")).toBeTruthy();
  });

  it("não exibe chave PIX quando não fornecida", () => {
    render(<MoradorRow morador={mockMorador} valor={0} />);
    expect(screen.queryByText(/PIX:/)).toBeNull();
  });
});
