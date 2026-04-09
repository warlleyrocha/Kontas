import { fireEvent, render, screen } from "@testing-library/react-native";
import SessionErrorScreen from "../session-error-screen";

const defaultProps = {
  title: "Erro de sessão",
  message: "Ocorreu um erro inesperado.",
  onRetry: jest.fn(),
};

describe("SessionErrorScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("actionLabel default value (line 16)", () => {
    it('renders "Tentar novamente" when actionLabel is not provided', () => {
      render(<SessionErrorScreen {...defaultProps} />);

      expect(screen.getByText("Tentar novamente")).toBeTruthy();
    });

    it('uses "Tentar novamente" as accessibilityLabel when actionLabel is not provided', () => {
      render(<SessionErrorScreen {...defaultProps} />);

      expect(
        screen.getByRole("button", { name: "Tentar novamente" })
      ).toBeTruthy();
    });

    it("renders custom actionLabel when provided", () => {
      render(<SessionErrorScreen {...defaultProps} actionLabel="Recarregar" />);

      expect(screen.getByText("Recarregar")).toBeTruthy();
      expect(screen.queryByText("Tentar novamente")).toBeNull();
    });

    it("uses custom actionLabel as accessibilityLabel when provided", () => {
      render(<SessionErrorScreen {...defaultProps} actionLabel="Recarregar" />);

      expect(screen.getByRole("button", { name: "Recarregar" })).toBeTruthy();
    });
  });

  describe("onRetry callback", () => {
    it("calls onRetry when button is pressed with default actionLabel", () => {
      render(<SessionErrorScreen {...defaultProps} />);

      fireEvent.press(screen.getByRole("button", { name: "Tentar novamente" }));

      expect(defaultProps.onRetry).toHaveBeenCalledTimes(1);
    });

    it("calls onRetry when button is pressed with custom actionLabel", () => {
      render(<SessionErrorScreen {...defaultProps} actionLabel="Recarregar" />);

      fireEvent.press(screen.getByRole("button", { name: "Recarregar" }));

      expect(defaultProps.onRetry).toHaveBeenCalledTimes(1);
    });
  });
});
