import { fireEvent, render, screen } from "@testing-library/react-native";
import React from "react";
import { RepublicContextMenu } from "../index";

jest.mock("@expo/vector-icons/MaterialCommunityIcons", () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock("@/src/shared/components/ContextMenu", () => ({
  ContextMenu: ({
    children,
    menuTotalHeight,
  }: {
    children: (handleClose: (cb?: () => void) => void) => React.ReactNode;
    menuTotalHeight: number;
  }) => {
    const { View } = jest.requireActual("react-native");
    const mockHandleClose = (cb?: () => void) => {
      if (cb) cb();
    };
    return (
      <View testID={`menu-height-${menuTotalHeight}`}>
        {children(mockHandleClose)}
      </View>
    );
  },
}));

const mockPosition = { x: 0, y: 0, width: 100, height: 50 };

const createProps = (overrides = {}) => ({
  visible: true,
  position: mockPosition,
  onClose: jest.fn(),
  onEdit: jest.fn(),
  onDelete: jest.fn(),
  onInvite: jest.fn(),
  ...overrides,
});

describe("RepublicContextMenu", () => {
  it("monta sem erros", () => {
    render(<RepublicContextMenu {...createProps()} />);
  });

  it('exibe o botão "Editar república"', () => {
    render(<RepublicContextMenu {...createProps()} />);
    expect(screen.getByText("Editar república")).toBeTruthy();
  });

  it('não exibe "Convidar novo morador" para não-admin', () => {
    render(<RepublicContextMenu {...createProps()} />);
    expect(screen.queryByText("Convidar novo morador")).toBeNull();
  });

  it('não exibe "Deletar república" para não-admin', () => {
    render(<RepublicContextMenu {...createProps()} />);
    expect(screen.queryByText("Deletar república")).toBeNull();
  });

  it('exibe "Convidar novo morador" quando isAdmin é true', () => {
    render(<RepublicContextMenu {...createProps({ isAdmin: true })} />);
    expect(screen.getByText("Convidar novo morador")).toBeTruthy();
  });

  it('exibe "Deletar república" quando isAdmin é true', () => {
    render(<RepublicContextMenu {...createProps({ isAdmin: true })} />);
    expect(screen.getByText("Deletar república")).toBeTruthy();
  });

  it("chama onEdit ao pressionar Editar república", () => {
    const props = createProps();
    render(<RepublicContextMenu {...props} />);

    fireEvent.press(screen.getByRole("button", { name: "Editar república" }));

    expect(props.onEdit).toHaveBeenCalledTimes(1);
  });

  it("chama onInvite ao pressionar Convidar novo morador", () => {
    const props = createProps({ isAdmin: true });
    render(<RepublicContextMenu {...props} />);

    fireEvent.press(
      screen.getByRole("button", { name: "Convidar novo morador" })
    );

    expect(props.onInvite).toHaveBeenCalledTimes(1);
  });

  it("chama onDelete ao pressionar Deletar república", () => {
    const props = createProps({ isAdmin: true });
    render(<RepublicContextMenu {...props} />);

    fireEvent.press(screen.getByRole("button", { name: "Deletar república" }));

    expect(props.onDelete).toHaveBeenCalledTimes(1);
  });

  it("passa menuTotalHeight correto para não-admin (52)", () => {
    render(<RepublicContextMenu {...createProps()} />);
    expect(screen.getByTestId("menu-height-52")).toBeTruthy();
  });

  it("passa menuTotalHeight correto para admin (158)", () => {
    render(<RepublicContextMenu {...createProps({ isAdmin: true })} />);
    expect(screen.getByTestId("menu-height-158")).toBeTruthy();
  });
});
