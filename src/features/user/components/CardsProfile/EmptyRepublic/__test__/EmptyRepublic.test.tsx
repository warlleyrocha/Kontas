import { fireEvent, render, screen } from "@testing-library/react-native";
import EmptyRepublic from "../index";

const onCreateRepublic = jest.fn();
const onViewInvites = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
});

describe("EmptyRepublic", () => {
  it("renderiza os textos principais", () => {
    render(
      <EmptyRepublic
        onCreateRepublic={onCreateRepublic}
        onViewInvites={onViewInvites}
      />
    );

    expect(screen.getByText("Nenhuma república vinculada")).toBeTruthy();
    expect(screen.getByText("Criar República")).toBeTruthy();
    expect(screen.getByText("Ver meus convites")).toBeTruthy();
  });

  it("chama onCreateRepublic ao pressionar o botão principal", () => {
    render(
      <EmptyRepublic
        onCreateRepublic={onCreateRepublic}
        onViewInvites={onViewInvites}
      />
    );

    fireEvent.press(screen.getByAccessibilityHint ? screen.getByText("Criar República") : screen.getByText("Criar República"));

    expect(onCreateRepublic).toHaveBeenCalledTimes(1);
  });

  it("chama onViewInvites ao pressionar o link secundário", () => {
    render(
      <EmptyRepublic
        onCreateRepublic={onCreateRepublic}
        onViewInvites={onViewInvites}
      />
    );

    fireEvent.press(screen.getByText("Ver meus convites"));

    expect(onViewInvites).toHaveBeenCalledTimes(1);
  });
});
