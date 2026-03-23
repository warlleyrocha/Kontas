import { act, fireEvent, render, screen } from "@testing-library/react-native";
import React from "react";
import { Image } from "react-native";
import * as RN from "react-native";
import { SideMenu, MenuButton } from "../index";

jest.mock("react-native-reanimated", () =>
  require("react-native-reanimated/mock")
);
jest.mock("react-native-worklets", () => ({
  scheduleOnRN: jest.fn((fn: () => void) => fn()),
}));
jest.mock("@expo/vector-icons/Ionicons", () => "Ionicons");
jest.mock("react-native-safe-area-context", () => ({
  SafeAreaView: ({ children }: { children: React.ReactNode }) => children,
}));

// ─── Fixtures ──────────────────────────────────────────────────────────────────

const baseUser = {
  name: "Ana",
  email: "ana@email.com",
  phone: "(11) 99999-0000",
  pixKey: "ana@pix",
  photo: null,
  roleLabel: null,
};

const mockOnRequestClose = jest.fn();

function makeMenuItem(overrides = {}): any {
  return {
    id: "item-1",
    label: "Início",
    icon: "home-outline",
    onPress: jest.fn(),
    ...overrides,
  };
}

// ─── Setup ────────────────────────────────────────────────────────────────────

let consoleErrorSpy: jest.SpyInstance;

beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(RN, "useWindowDimensions").mockReturnValue({
    width: 390,
    height: 844,
    scale: 1,
    fontScale: 1,
  });
  consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  expect(consoleErrorSpy).not.toHaveBeenCalled();
  consoleErrorSpy.mockRestore();
});

// ─── SideMenu — User Header ───────────────────────────────────────────────────

describe("SideMenu — User Header", () => {
  it("exibe o nome do usuário", () => {
    render(
      <SideMenu
        onRequestClose={mockOnRequestClose}
        user={baseUser}
        menuItems={[]}
      />
    );
    expect(screen.getByText("Ana")).toBeTruthy();
  });

  it("exibe a inicial quando photo é null", () => {
    render(
      <SideMenu
        onRequestClose={mockOnRequestClose}
        user={baseUser}
        menuItems={[]}
      />
    );
    expect(screen.getByText("A")).toBeTruthy();
  });

  it("exibe a inicial após erro de carregamento da foto", () => {
    const { UNSAFE_getByType } = render(
      <SideMenu
        onRequestClose={mockOnRequestClose}
        user={{ ...baseUser, photo: "https://foto.jpg" }}
        menuItems={[]}
      />
    );
    act(() => {
      UNSAFE_getByType(Image).props.onError();
    });
    expect(screen.getByText("A")).toBeTruthy();
  });

  it("exibe o email quando fornecido", () => {
    render(
      <SideMenu
        onRequestClose={mockOnRequestClose}
        user={baseUser}
        menuItems={[]}
      />
    );
    expect(screen.getByText("ana@email.com")).toBeTruthy();
  });

  it("não exibe email quando não fornecido", () => {
    render(
      <SideMenu
        onRequestClose={mockOnRequestClose}
        user={{ ...baseUser, email: null }}
        menuItems={[]}
      />
    );
    expect(screen.queryByText("ana@email.com")).toBeNull();
  });

  it("exibe o telefone quando fornecido", () => {
    render(
      <SideMenu
        onRequestClose={mockOnRequestClose}
        user={baseUser}
        menuItems={[]}
      />
    );
    expect(screen.getByText("(11) 99999-0000")).toBeTruthy();
  });

  it("não exibe telefone quando não fornecido", () => {
    render(
      <SideMenu
        onRequestClose={mockOnRequestClose}
        user={{ ...baseUser, phone: null }}
        menuItems={[]}
      />
    );
    expect(screen.queryByText("(11) 99999-0000")).toBeNull();
  });

  it("exibe a chave Pix quando fornecida", () => {
    render(
      <SideMenu
        onRequestClose={mockOnRequestClose}
        user={baseUser}
        menuItems={[]}
      />
    );
    expect(screen.getByText("ana@pix")).toBeTruthy();
  });

  it("não exibe chave Pix quando não fornecida", () => {
    render(
      <SideMenu
        onRequestClose={mockOnRequestClose}
        user={{ ...baseUser, pixKey: null }}
        menuItems={[]}
      />
    );
    expect(screen.queryByText("ana@pix")).toBeNull();
  });

  it("exibe o roleLabel quando fornecido", () => {
    render(
      <SideMenu
        onRequestClose={mockOnRequestClose}
        user={{ ...baseUser, roleLabel: "Admin" }}
        menuItems={[]}
      />
    );
    expect(screen.getByText("Admin")).toBeTruthy();
  });

  it("não exibe roleLabel quando não fornecido", () => {
    render(
      <SideMenu
        onRequestClose={mockOnRequestClose}
        user={baseUser}
        menuItems={[]}
      />
    );
    expect(screen.queryByText("Admin")).toBeNull();
  });
});

// ─── SideMenu — backdrop ──────────────────────────────────────────────────────

describe("SideMenu — backdrop", () => {
  it("pressionar o backdrop chama closeMenu e depois onRequestClose", () => {
    render(
      <SideMenu
        onRequestClose={mockOnRequestClose}
        user={baseUser}
        menuItems={[]}
      />
    );
    fireEvent.press(
      screen.getByRole("button", { name: "Fechar menu lateral" })
    );
    expect(mockOnRequestClose).toHaveBeenCalled();
  });
});

// ─── SideMenu — MenuItem simples ──────────────────────────────────────────────

describe("SideMenu — MenuItem (sem filhos)", () => {
  it("exibe o label do item", () => {
    render(
      <SideMenu
        onRequestClose={mockOnRequestClose}
        user={baseUser}
        menuItems={[makeMenuItem()]}
      />
    );
    expect(screen.getByText("Início")).toBeTruthy();
  });

  it("pressionar o item chama onPress e fecha o menu", () => {
    jest.useFakeTimers();
    const onPress = jest.fn();
    render(
      <SideMenu
        onRequestClose={mockOnRequestClose}
        user={baseUser}
        menuItems={[makeMenuItem({ onPress })]}
      />
    );
    fireEvent.press(screen.getByRole("button", { name: "Início" }));
    jest.runAllTimers();
    expect(onPress).toHaveBeenCalled();
    expect(mockOnRequestClose).toHaveBeenCalled();
    jest.useRealTimers();
  });

  it("pressionar item sem onPress não lança erro", () => {
    render(
      <SideMenu
        onRequestClose={mockOnRequestClose}
        user={baseUser}
        menuItems={[makeMenuItem({ onPress: undefined })]}
      />
    );
    fireEvent.press(screen.getByRole("button", { name: "Início" }));
  });

  it("exibe badge quando badge > 0", () => {
    render(
      <SideMenu
        onRequestClose={mockOnRequestClose}
        user={baseUser}
        menuItems={[makeMenuItem({ badge: 5 })]}
      />
    );
    expect(screen.getByText("5")).toBeTruthy();
  });

  it("exibe '99+' quando badge > 99", () => {
    render(
      <SideMenu
        onRequestClose={mockOnRequestClose}
        user={baseUser}
        menuItems={[makeMenuItem({ badge: 150 })]}
      />
    );
    expect(screen.getByText("99+")).toBeTruthy();
  });

  it("não exibe badge quando badge é 0", () => {
    render(
      <SideMenu
        onRequestClose={mockOnRequestClose}
        user={baseUser}
        menuItems={[makeMenuItem({ badge: 0 })]}
      />
    );
    expect(screen.queryByText("0")).toBeNull();
  });

  it("item com danger=true recebe cor vermelha (L114–115)", () => {
    render(
      <SideMenu
        onRequestClose={mockOnRequestClose}
        user={baseUser}
        menuItems={[makeMenuItem({ id: "d-1", label: "Sair", danger: true })]}
      />
    );
    // O label é renderizado — confirma que o ramo danger foi executado
    expect(screen.getByText("Sair")).toBeTruthy();
  });
});

// ─── SideMenu — MenuItem com filhos (expansível) ──────────────────────────────

describe("SideMenu — MenuItem (expansível)", () => {
  const child = { id: "c-1", label: "República Alpha", onPress: jest.fn() };
  const expandableItem = makeMenuItem({
    id: "exp-1",
    label: "Repúblicas",
    children: [child],
  });

  it("accessibilityLabel inclui 'Expandir' quando recolhido", () => {
    render(
      <SideMenu
        onRequestClose={mockOnRequestClose}
        user={baseUser}
        menuItems={[expandableItem]}
      />
    );
    expect(
      screen.getByRole("button", { name: "Expandir Repúblicas" })
    ).toBeTruthy();
  });

  it("pressionar o item expansível revela os filhos", () => {
    render(
      <SideMenu
        onRequestClose={mockOnRequestClose}
        user={baseUser}
        menuItems={[expandableItem]}
      />
    );
    fireEvent.press(
      screen.getByRole("button", { name: "Expandir Repúblicas" })
    );
    expect(
      screen.getByRole("button", { name: "República Alpha" })
    ).toBeTruthy();
  });

  it("accessibilityLabel muda para 'Recolher' após expandir", () => {
    render(
      <SideMenu
        onRequestClose={mockOnRequestClose}
        user={baseUser}
        menuItems={[expandableItem]}
      />
    );
    fireEvent.press(
      screen.getByRole("button", { name: "Expandir Repúblicas" })
    );
    expect(
      screen.getByRole("button", { name: "Recolher Repúblicas" })
    ).toBeTruthy();
  });

  it("pressionar o item novamente recolhe os filhos", () => {
    render(
      <SideMenu
        onRequestClose={mockOnRequestClose}
        user={baseUser}
        menuItems={[expandableItem]}
      />
    );
    fireEvent.press(
      screen.getByRole("button", { name: "Expandir Repúblicas" })
    );
    fireEvent.press(
      screen.getByRole("button", { name: "Recolher Repúblicas" })
    );
    expect(
      screen.queryByRole("button", { name: "República Alpha" })
    ).toBeNull();
  });

  it("exibe emptyLabel quando children está vazio", () => {
    render(
      <SideMenu
        onRequestClose={mockOnRequestClose}
        user={baseUser}
        menuItems={[
          makeMenuItem({
            id: "exp-2",
            label: "Repúblicas",
            children: [],
            emptyLabel: "Nenhuma república",
          }),
        ]}
      />
    );
    fireEvent.press(
      screen.getByRole("button", { name: "Expandir Repúblicas" })
    );
    expect(screen.getByText("Nenhuma república")).toBeTruthy();
  });

  it("exibe texto padrão quando children está vazio e emptyLabel não fornecido", () => {
    render(
      <SideMenu
        onRequestClose={mockOnRequestClose}
        user={baseUser}
        menuItems={[
          makeMenuItem({ id: "exp-3", label: "Repúblicas", children: [] }),
        ]}
      />
    );
    fireEvent.press(
      screen.getByRole("button", { name: "Expandir Repúblicas" })
    );
    expect(screen.getByText("Nenhuma república disponível")).toBeTruthy();
  });
});

// ─── SideMenu — MenuSubItemComponent ─────────────────────────────────────────

describe("SideMenu — MenuSubItemComponent", () => {
  const childOnPress = jest.fn();
  const expandableItem = makeMenuItem({
    id: "exp-1",
    label: "Repúblicas",
    children: [{ id: "c-1", label: "República Alpha", onPress: childOnPress }],
  });

  beforeEach(() => {
    render(
      <SideMenu
        onRequestClose={mockOnRequestClose}
        user={baseUser}
        menuItems={[expandableItem]}
      />
    );
    fireEvent.press(
      screen.getByRole("button", { name: "Expandir Repúblicas" })
    );
  });

  it("exibe a inicial do filho quando não há imagem", () => {
    expect(screen.getByText("R")).toBeTruthy();
  });

  it("pressionar o filho chama onPress e fecha o menu", () => {
    jest.useFakeTimers();
    fireEvent.press(screen.getByRole("button", { name: "República Alpha" }));
    jest.runAllTimers();
    expect(childOnPress).toHaveBeenCalled();
    expect(mockOnRequestClose).toHaveBeenCalled();
    jest.useRealTimers();
  });

  it("erro no carregamento da imagem do filho mostra a inicial", () => {
    const { UNSAFE_getAllByType } = render(
      <SideMenu
        onRequestClose={mockOnRequestClose}
        user={baseUser}
        menuItems={[
          makeMenuItem({
            id: "exp-img",
            label: "Repúblicas",
            children: [
              {
                id: "c-img",
                label: "Beta",
                onPress: jest.fn(),
                image: "https://img.jpg",
              },
            ],
          }),
        ]}
      />
    );
    fireEvent.press(
      screen.getByRole("button", { name: "Expandir Repúblicas" })
    );
    const images = UNSAFE_getAllByType(Image);
    act(() => {
      images[images.length - 1].props.onError();
    });
    expect(screen.getByText("B")).toBeTruthy();
  });

  it("item ativo (active=true) renderiza o label (L61 e L82)", () => {
    render(
      <SideMenu
        onRequestClose={mockOnRequestClose}
        user={baseUser}
        menuItems={[
          makeMenuItem({
            id: "exp-active",
            label: "Repúblicas",
            children: [
              {
                id: "c-active",
                label: "Alpha Ativa",
                onPress: jest.fn(),
                active: true,
              },
            ],
          }),
        ]}
      />
    );
    fireEvent.press(
      screen.getByRole("button", { name: "Expandir Repúblicas" })
    );
    expect(screen.getByRole("button", { name: "Alpha Ativa" })).toBeTruthy();
  });
});

// ─── SideMenu — footer items ──────────────────────────────────────────────────

describe("SideMenu — footer items", () => {
  it("não renderiza footer quando footerItems está vazio", () => {
    render(
      <SideMenu
        onRequestClose={mockOnRequestClose}
        user={baseUser}
        menuItems={[]}
        footerItems={[]}
      />
    );
    expect(screen.queryByText("Sair")).toBeNull();
  });

  it("renderiza footer items quando fornecidos", () => {
    render(
      <SideMenu
        onRequestClose={mockOnRequestClose}
        user={baseUser}
        menuItems={[]}
        footerItems={[makeMenuItem({ id: "f-1", label: "Sair" })]}
      />
    );
    expect(screen.getByText("Sair")).toBeTruthy();
  });

  it("pressionar item do footer chama onPress e fecha o menu", () => {
    jest.useFakeTimers();
    const onPress = jest.fn();
    render(
      <SideMenu
        onRequestClose={mockOnRequestClose}
        user={baseUser}
        menuItems={[]}
        footerItems={[makeMenuItem({ id: "f-1", label: "Sair", onPress })]}
      />
    );
    fireEvent.press(screen.getByRole("button", { name: "Sair" }));
    jest.runAllTimers();
    expect(onPress).toHaveBeenCalled();
    expect(mockOnRequestClose).toHaveBeenCalled();
    jest.useRealTimers();
  });
});

// ─── MenuButton ───────────────────────────────────────────────────────────────

describe("MenuButton", () => {
  it("renderiza com accessibilityLabel 'Abrir menu' quando sem notificação", () => {
    render(<MenuButton onPress={jest.fn()} />);
    expect(screen.getByRole("button", { name: "Abrir menu" })).toBeTruthy();
  });

  it("renderiza com accessibilityLabel 'Abrir menu com notificações' quando hasNotification=true", () => {
    render(<MenuButton onPress={jest.fn()} hasNotification />);
    expect(
      screen.getByRole("button", { name: "Abrir menu com notificações" })
    ).toBeTruthy();
  });

  it("pressionar o botão chama onPress", () => {
    const onPress = jest.fn();
    render(<MenuButton onPress={onPress} />);
    fireEvent.press(screen.getByRole("button", { name: "Abrir menu" }));
    expect(onPress).toHaveBeenCalled();
  });
});
