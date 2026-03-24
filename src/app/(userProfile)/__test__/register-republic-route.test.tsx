import { render } from "@testing-library/react-native";
import { RegisterRepublicScreen } from "@/src/features/republic";
import RegisterRepublicRoute from "../register/republic";

jest.mock("@/src/features/republic", () => ({
  __esModule: true,
  RegisterRepublicScreen: jest.fn(() => null),
}));

const mockRegisterRepublicScreen = jest.mocked(RegisterRepublicScreen);

describe("register republic route", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renderiza RegisterRepublicScreen", () => {
    render(<RegisterRepublicRoute />);

    expect(mockRegisterRepublicScreen).toHaveBeenCalledTimes(1);
  });
});
