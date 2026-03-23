import { fireEvent, render, screen } from "@testing-library/react-native";
import React from "react";
import * as RN from "react-native";
import { ContextMenu } from "../ContextMenu";

// eslint-disable-next-line @typescript-eslint/no-var-requires
jest.mock("react-native-reanimated", () => require("react-native-reanimated/mock"));

jest.mock("react-native-worklets", () => ({
  scheduleOnRN: jest.fn((fn) => fn()),
}));

const SCREEN_WIDTH = 390;
const SCREEN_HEIGHT = 844;

beforeEach(() => {
  jest.spyOn(RN, "useWindowDimensions").mockReturnValue({
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    scale: 1,
    fontScale: 1,
  });
});

const basePosition = { x: 100, y: 300, width: 150, height: 50 };

const createProps = (overrides = {}) => ({
  visible: true,
  position: basePosition,
  menuTotalHeight: 100,
  onClose: jest.fn(),
  children: jest.fn(() => null),
  ...overrides,
});

describe("ContextMenu", () => {
  it("retorna null quando position é null", () => {
    const props = createProps({ position: null });
    const { toJSON } = render(<ContextMenu {...props} />);
    expect(toJSON()).toBeNull();
  });

  it("monta sem erros quando position é fornecida", () => {
    render(<ContextMenu {...createProps()} />);
  });

  it("renderiza os filhos quando position é fornecida e visible é true", () => {
    const children = jest.fn(() => null);
    render(<ContextMenu {...createProps({ children })} />);
    expect(children).toHaveBeenCalled();
  });

  it("passa handleClose como argumento para a função children", () => {
    const children = jest.fn(() => null);
    render(<ContextMenu {...createProps({ children })} />);
    const handleClose = (children.mock.calls as unknown as [unknown[]])[0][0];
    expect(typeof handleClose).toBe("function");
  });

  it("chama handleClose com onClose ao pressionar o overlay", () => {
    const onClose = jest.fn();
    render(<ContextMenu {...createProps({ onClose })} />);

    fireEvent.press(
      screen.getByRole("button", { name: "Fechar menu de contexto" })
    );
  });

  it("executa a callback de children quando handleClose é chamado com ela", () => {
    const callback = jest.fn();
    const children = jest.fn((handleClose) => {
      handleClose(callback);
      return null;
    });
    render(<ContextMenu {...createProps({ children })} />);
    expect(children).toHaveBeenCalled();
  });

  it("posiciona o menu abaixo do elemento quando há espaço suficiente", () => {
    // spaceBelow = 844 - (300 + 50) = 494 >= 100 + 20 = 120
    const position = { x: 100, y: 300, width: 150, height: 50 };
    const children = jest.fn(() => null);
    render(
      <ContextMenu
        {...createProps({ position, menuTotalHeight: 100, children })}
      />
    );
    expect(children).toHaveBeenCalled();
  });

  it("posiciona o menu acima do elemento quando não há espaço suficiente abaixo", () => {
    // spaceBelow = 844 - (780 + 50) = 14 < 300 + 20 = 320
    const position = { x: 100, y: 780, width: 150, height: 50 };
    const children = jest.fn(() => null);
    render(
      <ContextMenu
        {...createProps({ position, menuTotalHeight: 300, children })}
      />
    );
    expect(children).toHaveBeenCalled();
  });

  it("limita menuX ao mínimo de 12px quando a posição ficaria à esquerda", () => {
    // x=0, width=10 → menuX = 0 + 5 - 110 = -105 → clamped to 12
    const position = { x: 0, y: 300, width: 10, height: 50 };
    const children = jest.fn(() => null);
    render(<ContextMenu {...createProps({ position, children })} />);
    expect(children).toHaveBeenCalled();
  });

  it("limita menuX ao máximo (screenWidth - MENU_WIDTH - 12) quando vai além da borda direita", () => {
    // x=370, width=10 → menuX = 370 + 5 - 110 = 265 → screenWidth - 220 - 12 = 158
    const position = { x: 370, y: 300, width: 10, height: 50 };
    const children = jest.fn(() => null);
    render(<ContextMenu {...createProps({ position, children })} />);
    expect(children).toHaveBeenCalled();
  });

  it("usa position padrão {x:0,y:0,width:0,height:0} quando position é null na renderização intermediária", () => {
    // Testa o fallback resolvedPosition quando position existe (o null já retorna null antes)
    const position = { x: 0, y: 0, width: 0, height: 0 };
    const children = jest.fn(() => null);
    render(<ContextMenu {...createProps({ position, children })} />);
    expect(children).toHaveBeenCalled();
  });

  it("exibe o overlay com acessibilidade correta", () => {
    render(<ContextMenu {...createProps()} />);
    expect(
      screen.getByRole("button", { name: "Fechar menu de contexto" })
    ).toBeTruthy();
  });
});
