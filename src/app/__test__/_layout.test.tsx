import { render } from "@testing-library/react-native";
import { Stack } from "expo-router";
import { preventAutoHideAsync } from "expo-splash-screen";
import { wrap } from "@sentry/react-native";
import { useSessionLifecycle } from "@/src/features/auth/hooks/useAuth";
import { configureGoogleSignin } from "@/src/lib/google-signin";
import { initSentry } from "@/src/lib/sentry";
import useAppReady from "@/src/hooks/useAppReady";
import { Toaster } from "@/src/shared/components/ui/sonner";
import { AppProviders } from "../../providers/AppProviders";
import AppLayout from "../_layout";

jest.mock("../../../global.css", () => ({}));

jest.mock("expo-router", () => ({
  __esModule: true,
  Stack: jest.fn(() => null),
}));

jest.mock("expo-splash-screen", () => ({
  __esModule: true,
  preventAutoHideAsync: jest.fn(),
}));

jest.mock("@sentry/react-native", () => ({
  __esModule: true,
  wrap: jest.fn((Component) => Component),
}));

jest.mock("@/src/lib/sentry", () => ({
  __esModule: true,
  initSentry: jest.fn(),
}));

jest.mock("@/src/lib/google-signin", () => ({
  __esModule: true,
  configureGoogleSignin: jest.fn(),
}));

jest.mock("@/src/hooks/useAppReady", () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock("@/src/features/auth/hooks/useAuth", () => ({
  __esModule: true,
  useSessionLifecycle: jest.fn(),
}));

jest.mock("../../providers/AppProviders", () => ({
  __esModule: true,
  AppProviders: jest.fn(({ children }) => children),
}));

jest.mock("@/src/shared/components/ui/sonner", () => ({
  __esModule: true,
  Toaster: jest.fn(() => null),
  toast: {
    custom: jest.fn(),
    dismiss: jest.fn(),
  },
}));

const mockStack = jest.mocked(Stack);
const mockPreventAutoHideAsync = jest.mocked(preventAutoHideAsync);
const mockWrap = jest.mocked(wrap);
const mockConfigureGoogleSignin = jest.mocked(configureGoogleSignin);
const mockInitSentry = jest.mocked(initSentry);
const mockUseAppReady = jest.mocked(useAppReady);
const mockUseSessionLifecycle = jest.mocked(useSessionLifecycle);
const mockToaster = jest.mocked(Toaster);
const mockAppProviders = jest.mocked(AppProviders);

describe("_layout module", () => {
  it("executa o bootstrap do app ao carregar o módulo", () => {
    expect(mockInitSentry).toHaveBeenCalledTimes(1);
    expect(mockConfigureGoogleSignin).toHaveBeenCalledTimes(1);
    expect(mockPreventAutoHideAsync).toHaveBeenCalledTimes(1);
    expect(mockWrap).toHaveBeenCalledWith(expect.any(Function));
  });
});

describe("_layout render", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAppReady.mockReturnValue(true);
  });

  it("retorna null enquanto o app não estiver pronto", () => {
    mockUseAppReady.mockReturnValue(false);

    const { toJSON } = render(<AppLayout />);

    expect(toJSON()).toBeNull();
    expect(mockAppProviders).not.toHaveBeenCalled();
    expect(mockStack).not.toHaveBeenCalled();
    expect(mockToaster).not.toHaveBeenCalled();
  });

  it("renderiza Stack quando o app está pronto", () => {
    render(<AppLayout />);

    expect(mockAppProviders).toHaveBeenCalledTimes(1);
    expect(mockUseSessionLifecycle).toHaveBeenCalledTimes(1);
    expect(mockStack).toHaveBeenCalledWith(
      expect.objectContaining({
        screenOptions: { headerShown: false },
      }),
      undefined,
    );
    expect(mockToaster).toHaveBeenCalledWith(
      expect.objectContaining({ position: "bottom-center" }),
      undefined,
    );
  });
});
