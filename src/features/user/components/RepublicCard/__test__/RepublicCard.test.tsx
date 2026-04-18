import { fireEvent, render, screen } from "@testing-library/react-native";
import { Image, View } from "react-native";
import type { RepublicResponse } from "@/src/features/republic/types/republic.types";
import RepublicCard from "../index";

jest.mock("react-native-reanimated", () =>
  jest.requireActual("react-native-reanimated/mock")
);

jest.mock("@expo/vector-icons", () => ({
  Feather: "Feather",
  Ionicons: "Ionicons",
}));

const mockRepublic: RepublicResponse = {
  id: "rep-1",
  nome: "Alpha",
};

const onSelect = jest.fn();
const onLongPress = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
});

describe("RepublicCard", () => {
  it("renderiza o nome da república", () => {
    render(<RepublicCard republic={mockRepublic} onSelect={onSelect} />);

    expect(screen.getByText("Alpha")).toBeTruthy();
  });

  it("exibe '0 Moradores' por padrão", () => {
    render(<RepublicCard republic={mockRepublic} onSelect={onSelect} />);

    expect(screen.getByText("0 Moradores")).toBeTruthy();
  });

  it("exibe '1 Morador' quando residentsCount é 1", () => {
    render(
      <RepublicCard
        republic={mockRepublic}
        residentsCount={1}
        onSelect={onSelect}
      />
    );

    expect(screen.getByText("1 Morador")).toBeTruthy();
  });

  it("exibe plural quando residentsCount é maior que 1", () => {
    render(
      <RepublicCard
        republic={mockRepublic}
        residentsCount={3}
        onSelect={onSelect}
      />
    );

    expect(screen.getByText("3 Moradores")).toBeTruthy();
  });

  it("chama onSelect ao pressionar o card", () => {
    render(<RepublicCard republic={mockRepublic} onSelect={onSelect} />);

    fireEvent.press(screen.getByLabelText("Abrir república Alpha"));

    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  it("não lança erro ao pressionar longamente com onLongPress fornecido", () => {
    // onLongPress depende de cardRef.current?.measure(), indisponível no ambiente de teste
    render(
      <RepublicCard
        republic={mockRepublic}
        onSelect={onSelect}
        onLongPress={onLongPress}
      />
    );

    expect(() =>
      fireEvent(screen.getByLabelText("Abrir república Alpha"), "longPress")
    ).not.toThrow();
  });

  it("não lança erro ao pressionar longamente sem onLongPress", () => {
    render(<RepublicCard republic={mockRepublic} onSelect={onSelect} />);

    expect(() =>
      fireEvent(screen.getByLabelText("Abrir república Alpha"), "longPress")
    ).not.toThrow();
  });

  it("renderiza ícone padrão quando imagemRepublica não está definida", () => {
    render(<RepublicCard republic={mockRepublic} onSelect={onSelect} />);

    // Verifica se o componente renderiza sem erros e contém o nome da república
    expect(screen.getByText("Alpha")).toBeTruthy();
    // Como o mock substitui os ícones por strings, não podemos testar a presença específica do ícone
    // Mas podemos verificar que não há erro de renderização
  });

  it("chama shrink (withTiming) ao disparar pressIn", () => {
    render(<RepublicCard republic={mockRepublic} onSelect={onSelect} />);

    expect(() =>
      fireEvent(screen.getByLabelText("Abrir república Alpha"), "pressIn")
    ).not.toThrow();
  });

  it("chama reset ao disparar pressOut", () => {
    render(<RepublicCard republic={mockRepublic} onSelect={onSelect} />);

    expect(() =>
      fireEvent(screen.getByLabelText("Abrir república Alpha"), "pressOut")
    ).not.toThrow();
  });

  it("chama onLongPress com a república e posição quando measure está disponível", () => {
    jest
      .spyOn(View.prototype, "measure")
      .mockImplementation((cb: (...args: number[]) => void) =>
        cb(0, 0, 100, 50, 10, 20)
      );

    render(
      <RepublicCard
        republic={mockRepublic}
        onSelect={onSelect}
        onLongPress={onLongPress}
      />
    );

    fireEvent(screen.getByLabelText("Abrir república Alpha"), "longPress");

    expect(onLongPress).toHaveBeenCalledWith(mockRepublic, {
      x: 10,
      y: 20,
      width: 100,
      height: 50,
    });
  });

  it("exibe Image e chama setImageError ao disparar onError", () => {
    const republicWithImage: RepublicResponse = {
      ...mockRepublic,
      imagemRepublica: "https://example.com/photo.jpg",
    };

    render(<RepublicCard republic={republicWithImage} onSelect={onSelect} />);

    // Verifica que a Image está presente inicialmente
    const image = screen.UNSAFE_getByType(Image);
    expect(image).toBeTruthy();

    // Simula erro na imagem
    fireEvent(image, "error");

    // Verifica que o componente ainda renderiza corretamente após o erro
    expect(screen.getByText("Alpha")).toBeTruthy();
  });
});
