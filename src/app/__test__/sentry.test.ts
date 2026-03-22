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

describe("initSentry", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockMobileReplayIntegration.mockReturnValue({
      name: "mobile-replay",
    } as never);
    mockFeedbackIntegration.mockReturnValue({
      name: "feedback",
    } as never);
  });

  it("inicializa o Sentry com as integrações e configurações do app", () => {
    initSentry();

    expect(mockMobileReplayIntegration).toHaveBeenCalledTimes(1);
    expect(mockFeedbackIntegration).toHaveBeenCalledTimes(1);
    expect(mockInit).toHaveBeenCalledTimes(1);
    expect(mockInit).toHaveBeenCalledWith({
      dsn: "https://da32d972451786e6c1a0aea2f4024516@o4510817801928704.ingest.us.sentry.io/4510818996322304",
      sendDefaultPii: true,
      enableLogs: true,
      replaysSessionSampleRate: 0.1,
      replaysOnErrorSampleRate: 1,
      integrations: [{ name: "mobile-replay" }, { name: "feedback" }],
    });
  });
});
