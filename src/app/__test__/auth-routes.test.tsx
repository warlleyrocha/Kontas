import { render } from "@testing-library/react-native";
import {
  CheckEmailScreen,
  LoginScreen,
  OnboardingScreen,
} from "@/src/features/auth";
import CheckEmailRoute from "../(auth)/checkEmail";
import LoginRoute from "../(auth)/login";
import OnboardingRoute from "../(auth)/onboarding";

jest.mock("@/src/features/auth", () => ({
  __esModule: true,
  CheckEmailScreen: jest.fn(() => null),
  LoginScreen: jest.fn(() => null),
  OnboardingScreen: jest.fn(() => null),
}));

const mockCheckEmailScreen = jest.mocked(CheckEmailScreen);
const mockLoginScreen = jest.mocked(LoginScreen);
const mockOnboardingScreen = jest.mocked(OnboardingScreen);

describe("auth routes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renderiza CheckEmailScreen na rota checkEmail", () => {
    render(<CheckEmailRoute />);

    expect(mockCheckEmailScreen).toHaveBeenCalledTimes(1);
  });

  it("renderiza LoginScreen na rota login", () => {
    render(<LoginRoute />);

    expect(mockLoginScreen).toHaveBeenCalledTimes(1);
  });

  it("renderiza OnboardingScreen na rota onboarding", () => {
    render(<OnboardingRoute />);

    expect(mockOnboardingScreen).toHaveBeenCalledTimes(1);
  });
});
