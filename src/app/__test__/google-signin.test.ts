import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { configureGoogleSignin } from "@/src/lib/google-signin";

jest.mock("@react-native-google-signin/google-signin", () => ({
  __esModule: true,
  GoogleSignin: {
    configure: jest.fn(),
  },
}));

const mockGoogleSignin = jest.mocked(GoogleSignin);

const MOCK_IOS_CLIENT_ID = "test-ios-client-id.apps.googleusercontent.com";
const MOCK_WEB_CLIENT_ID = "test-web-client-id.apps.googleusercontent.com";

describe("configureGoogleSignin", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID = MOCK_IOS_CLIENT_ID;
    process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID = MOCK_WEB_CLIENT_ID;
  });

  afterEach(() => {
    delete process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;
    delete process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
  });

  it("chama GoogleSignin.configure com os client ids lidos do ambiente", () => {
    configureGoogleSignin();

    expect(mockGoogleSignin.configure).toHaveBeenCalledTimes(1);
    expect(mockGoogleSignin.configure).toHaveBeenCalledWith({
      iosClientId: MOCK_IOS_CLIENT_ID,
      webClientId: MOCK_WEB_CLIENT_ID,
    });
  });

  it("passa undefined quando as variáveis de ambiente não estão definidas", () => {
    delete process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;
    delete process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;

    configureGoogleSignin();

    expect(mockGoogleSignin.configure).toHaveBeenCalledWith({
      iosClientId: undefined,
      webClientId: undefined,
    });
  });
});
