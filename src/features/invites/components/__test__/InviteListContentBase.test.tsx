import { render, screen } from "@testing-library/react-native";
import { Text } from "react-native";
import { EmptyState } from "@/src/shared/components/EmptyState";
import { InviteListContentBase } from "../InviteListContentBase";

jest.mock("@/src/shared/components/EmptyState", () => ({
  EmptyState: jest.fn(() => null),
}));

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const emptyState = {
  icon: "mail-open-outline" as const,
  iconColor: "#337176",
  bgColor: "bg-teal/10",
  title: "Nenhum convite",
  description: "Sem convites aqui.",
  buttonText: "Voltar",
  onPress: jest.fn(),
};

// ─── Setup ────────────────────────────────────────────────────────────────────

let consoleErrorSpy: jest.SpyInstance;

beforeEach(() => {
  jest.clearAllMocks();
  consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  expect(consoleErrorSpy).not.toHaveBeenCalled();
  consoleErrorSpy.mockRestore();
});

// ─── InviteListContentBase ────────────────────────────────────────────────────

describe("InviteListContentBase — estado de erro", () => {
  it("exibe o título padrão de erro", () => {
    render(
      <InviteListContentBase
        error="Falha de rede"
        hasItems={false}
        onRetry={jest.fn()}
        emptyState={emptyState}
      >
        <Text>conteúdo</Text>
      </InviteListContentBase>
    );
    const props = jest.mocked(EmptyState).mock.calls[0][0] as any;
    expect(props.title).toBe("Não foi possível carregar os convites");
  });

  it("exibe a mensagem de erro como descrição", () => {
    render(
      <InviteListContentBase
        error="Sem conexão"
        hasItems={false}
        onRetry={jest.fn()}
        emptyState={emptyState}
      >
        <Text>conteúdo</Text>
      </InviteListContentBase>
    );
    const props = jest.mocked(EmptyState).mock.calls[0][0] as any;
    expect(props.description).toBe("Sem conexão");
  });

  it("chama onRetry ao pressionar 'Tentar novamente'", () => {
    const onRetry = jest.fn();
    render(
      <InviteListContentBase
        error="Erro"
        hasItems={false}
        onRetry={onRetry}
        emptyState={emptyState}
      >
        <Text>conteúdo</Text>
      </InviteListContentBase>
    );
    const { onPress } = jest.mocked(EmptyState).mock.calls[0][0] as any;
    onPress();
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it("oculta os children quando há erro (mesmo com hasItems=true)", () => {
    render(
      <InviteListContentBase
        error="Erro"
        hasItems={true}
        onRetry={jest.fn()}
        emptyState={emptyState}
      >
        <Text>conteúdo</Text>
      </InviteListContentBase>
    );
    expect(screen.queryByText("conteúdo")).toBeNull();
  });
});

describe("InviteListContentBase — estado vazio", () => {
  it("exibe o EmptyState personalizado quando não há itens", () => {
    render(
      <InviteListContentBase
        error={null}
        hasItems={false}
        onRetry={jest.fn()}
        emptyState={emptyState}
      >
        <Text>conteúdo</Text>
      </InviteListContentBase>
    );
    const props = jest.mocked(EmptyState).mock.calls[0][0] as any;
    expect(props.title).toBe("Nenhum convite");
    expect(props.description).toBe("Sem convites aqui.");
  });

  it("chama emptyState.onPress ao pressionar o botão do estado vazio", () => {
    const onPress = jest.fn();
    render(
      <InviteListContentBase
        error={null}
        hasItems={false}
        onRetry={jest.fn()}
        emptyState={{ ...emptyState, onPress }}
      >
        <Text>conteúdo</Text>
      </InviteListContentBase>
    );
    const { onPress: renderedOnPress } = jest.mocked(EmptyState).mock
      .calls[0][0] as any;
    renderedOnPress();
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it("não exibe os children quando está vazio", () => {
    render(
      <InviteListContentBase
        error={null}
        hasItems={false}
        onRetry={jest.fn()}
        emptyState={emptyState}
      >
        <Text>conteúdo</Text>
      </InviteListContentBase>
    );
    expect(screen.queryByText("conteúdo")).toBeNull();
  });
});

describe("InviteListContentBase — com itens", () => {
  it("renderiza os children quando hasItems=true e sem erro", () => {
    render(
      <InviteListContentBase
        error={null}
        hasItems={true}
        onRetry={jest.fn()}
        emptyState={emptyState}
      >
        <Text>item da lista</Text>
      </InviteListContentBase>
    );
    expect(screen.getByText("item da lista")).toBeTruthy();
  });

  it("não exibe o EmptyState quando hasItems=true", () => {
    render(
      <InviteListContentBase
        error={null}
        hasItems={true}
        onRetry={jest.fn()}
        emptyState={emptyState}
      >
        <Text>item</Text>
      </InviteListContentBase>
    );
    expect(jest.mocked(EmptyState)).not.toHaveBeenCalled();
  });
});
