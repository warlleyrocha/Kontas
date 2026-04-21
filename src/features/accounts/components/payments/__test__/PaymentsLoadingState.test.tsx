import { render, screen } from "@testing-library/react-native";
import { ActivityIndicator } from "react-native";
import { PaymentsLoadingState } from "../PaymentsLoadingState";

describe("PaymentsLoadingState", () => {
  it("monta sem erros e exibe o estado de carregamento", () => {
    render(<PaymentsLoadingState />);

    expect(screen.UNSAFE_getByType(ActivityIndicator)).toBeTruthy();
    expect(screen.getByText("Carregando pagamentos...")).toBeTruthy();
  });
});
