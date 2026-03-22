import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { configureGoogleSignin } from "@/src/lib/google-signin";

jest.mock("@react-native-google-signin/google-signin", () => ({
  __esModule: true,
  GoogleSignin: {
    configure: jest.fn(),
  },
}));

const mockGoogleSignin = jest.mocked(GoogleSignin);

describe("configureGoogleSignin", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("chama GoogleSignin.configure com os client ids do app", () => {
    configureGoogleSignin();

    expect(mockGoogleSignin.configure).toHaveBeenCalledTimes(1);
    expect(mockGoogleSignin.configure).toHaveBeenCalledWith({
      iosClientId:
        "475215012202-oq93e4s85f7uuhfji6k2nkhdb7i2dfm3.apps.googleusercontent.com",
      webClientId:
        "475215012202-3au572tua9mtmv5647hbdsu342402sko.apps.googleusercontent.com",
    });
  });
});
