import { fireEvent, render, screen } from "@testing-library/react-native";
import { AccountContextMenu } from "../index";

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
  ...overrides,
});

describe("AccountContextMenu", () => {
  it("monta sem erros", () => {
    render(<AccountContextMenu {...createProps()} />);
  });

  it('não exibe "Deletar conta" quando nem admin nem owner', () => {
    render(<AccountContextMenu {...createProps()} />);
    expect(screen.queryByText("Deletar conta")).toBeNull();
  });

  it('exibe "Deletar conta" quando isAdmin é true', () => {
    render(<AccountContextMenu {...createProps({ isAdmin: true })} />);
    expect(screen.getByText("Deletar conta")).toBeTruthy();
  });

  it('exibe "Deletar conta" quando isOwner é true', () => {
    render(<AccountContextMenu {...createProps({ isOwner: true })} />);
    expect(screen.getByText("Deletar conta")).toBeTruthy();
  });

  it('exibe "Deletar conta" quando isAdmin e isOwner são true', () => {
    render(
      <AccountContextMenu {...createProps({ isAdmin: true, isOwner: true })} />
    );
    expect(screen.getByText("Deletar conta")).toBeTruthy();
  });

  it("chama onDelete ao pressionar Deletar conta (admin)", () => {
    const props = createProps({ isAdmin: true });
    render(<AccountContextMenu {...props} />);

    fireEvent.press(screen.getByRole("button", { name: "Deletar conta" }));

    expect(props.onDelete).toHaveBeenCalledTimes(1);
  });

  it("chama onDelete ao pressionar Deletar conta (owner)", () => {
    const props = createProps({ isOwner: true });
    render(<AccountContextMenu {...props} />);

    fireEvent.press(screen.getByRole("button", { name: "Deletar conta" }));

    expect(props.onDelete).toHaveBeenCalledTimes(1);
  });

  it("passa menuTotalHeight correto quando não pode deletar (52)", () => {
    render(<AccountContextMenu {...createProps()} />);
    expect(screen.getByTestId("menu-height-52")).toBeTruthy();
  });

  it("passa menuTotalHeight correto para admin (105)", () => {
    render(<AccountContextMenu {...createProps({ isAdmin: true })} />);
    expect(screen.getByTestId("menu-height-105")).toBeTruthy();
  });

  it("passa menuTotalHeight correto para owner (105)", () => {
    render(<AccountContextMenu {...createProps({ isOwner: true })} />);
    expect(screen.getByTestId("menu-height-105")).toBeTruthy();
  });
});
