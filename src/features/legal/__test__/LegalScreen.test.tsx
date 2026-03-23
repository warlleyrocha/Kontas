import { render, screen } from "@testing-library/react-native";
import type { LegalDoc } from "@/src/shared/constants/legalContent";
import { LegalScreen } from "../screens/LegalScreen";

jest.mock("@/src/shared/components/Header", () => ({
  __esModule: true,
  default: ({ title }: { title: string }) => {
    const { Text } = require("react-native");
    return <Text>{title}</Text>;
  },
}));

const mockDoc: LegalDoc = {
  title: "Título Legal",
  lastUpdated: "março de 2026",
  sections: [
    {
      title: "Seção Principal",
      blocks: [
        { kind: "h3", text: "Subtítulo da seção" },
        { kind: "p", text: "Parágrafo de texto descritivo." },
        { kind: "bullets", items: ["Item A", "Item B"] },
        { kind: "numbered", items: ["Passo 1", "Passo 2"] },
        {
          kind: "table",
          headers: ["Coluna 1", "Coluna 2"],
          rows: [
            ["Célula 1-1", "Célula 1-2"],
            ["Célula 2-1", "Célula 2-2"],
          ],
        },
      ],
    },
  ],
};

describe("LegalScreen", () => {
  it("monta sem erros", () => {
    render(<LegalScreen doc={mockDoc} />);
  });

  it("exibe o título do documento no Header", () => {
    render(<LegalScreen doc={mockDoc} />);
    expect(screen.getByText("Título Legal")).toBeTruthy();
  });

  it("exibe a data de última atualização", () => {
    render(<LegalScreen doc={mockDoc} />);
    expect(screen.getByText(/março de 2026/)).toBeTruthy();
  });

  it("exibe o título da seção", () => {
    render(<LegalScreen doc={mockDoc} />);
    expect(screen.getByText("Seção Principal")).toBeTruthy();
  });

  it("renderiza bloco h3", () => {
    render(<LegalScreen doc={mockDoc} />);
    expect(screen.getByText("Subtítulo da seção")).toBeTruthy();
  });

  it("renderiza bloco p", () => {
    render(<LegalScreen doc={mockDoc} />);
    expect(screen.getByText("Parágrafo de texto descritivo.")).toBeTruthy();
  });

  it("renderiza bloco bullets com os itens", () => {
    render(<LegalScreen doc={mockDoc} />);
    expect(screen.getByText("Item A")).toBeTruthy();
    expect(screen.getByText("Item B")).toBeTruthy();
  });

  it("renderiza bloco numbered com numeração e itens", () => {
    render(<LegalScreen doc={mockDoc} />);
    expect(screen.getByText("Passo 1")).toBeTruthy();
    expect(screen.getByText("Passo 2")).toBeTruthy();
    expect(screen.getByText("1.")).toBeTruthy();
    expect(screen.getByText("2.")).toBeTruthy();
  });

  it("renderiza bloco table com cabeçalhos e células", () => {
    render(<LegalScreen doc={mockDoc} />);
    expect(screen.getByText("Coluna 1")).toBeTruthy();
    expect(screen.getByText("Coluna 2")).toBeTruthy();
    expect(screen.getByText("Célula 1-1")).toBeTruthy();
    expect(screen.getByText("Célula 2-1")).toBeTruthy();
    expect(screen.getByText("Célula 1-2")).toBeTruthy();
    expect(screen.getByText("Célula 2-2")).toBeTruthy();
  });

  it("renderiza múltiplas seções", () => {
    const docMultiSection: LegalDoc = {
      ...mockDoc,
      sections: [
        { title: "Seção 1", blocks: [{ kind: "p", text: "Texto 1" }] },
        { title: "Seção 2", blocks: [{ kind: "p", text: "Texto 2" }] },
      ],
    };
    render(<LegalScreen doc={docMultiSection} />);
    expect(screen.getByText("Seção 1")).toBeTruthy();
    expect(screen.getByText("Seção 2")).toBeTruthy();
    expect(screen.getByText("Texto 1")).toBeTruthy();
    expect(screen.getByText("Texto 2")).toBeTruthy();
  });
});
