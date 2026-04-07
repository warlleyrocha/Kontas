import {
  feedbackIntegration,
  init,
  mobileReplayIntegration,
} from "@sentry/react-native";
import { initSentry } from "@/src/lib/sentry";

jest.mock("@sentry/react-native", () => ({
  __esModule: true,
  feedbackIntegration: jest.fn(),
  init: jest.fn(),
  mobileReplayIntegration: jest.fn(),
}));

const mockFeedbackIntegration = jest.mocked(feedbackIntegration);
const mockInit = jest.mocked(init);
const mockMobileReplayIntegration = jest.mocked(mobileReplayIntegration);

const MOCK_DSN = "https://test-key@sentry.io/test-project";

describe("initSentry", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.EXPO_PUBLIC_SENTRY_DSN = MOCK_DSN;
    mockMobileReplayIntegration.mockReturnValue({
      name: "mobile-replay",
    } as never);
    mockFeedbackIntegration.mockReturnValue({
      name: "feedback",
    } as never);
  });

  afterEach(() => {
    delete process.env.EXPO_PUBLIC_SENTRY_DSN;
  });

  it("inicializa o Sentry com as integrações e configurações do app", () => {
    initSentry();

    expect(mockMobileReplayIntegration).toHaveBeenCalledTimes(1);
    expect(mockMobileReplayIntegration).toHaveBeenCalledWith({
      maskAllText: true,
      maskAllImages: true,
    });
    expect(mockFeedbackIntegration).toHaveBeenCalledTimes(1);
    expect(mockInit).toHaveBeenCalledTimes(1);
    expect(mockInit).toHaveBeenCalledWith({
      dsn: MOCK_DSN,
      sendDefaultPii: false,
      enableLogs: true,
      replaysSessionSampleRate: 0,
      replaysOnErrorSampleRate: 0.5,
      integrations: [{ name: "mobile-replay" }, { name: "feedback" }],
      beforeSend: expect.any(Function),
    });
  });

  it("passa dsn=undefined quando a variável de ambiente não está definida", () => {
    delete process.env.EXPO_PUBLIC_SENTRY_DSN;
    initSentry();
    expect(mockInit).toHaveBeenCalledWith(
      expect.objectContaining({ dsn: undefined })
    );
  });
});
