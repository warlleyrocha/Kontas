import { render } from "@testing-library/react-native";
import { Stack } from "expo-router";
import { preventAutoHideAsync } from "expo-splash-screen";
import { wrap } from "@sentry/react-native";
import { useAuth } from "@/src/features/auth/contexts";
import { configureGoogleSignin } from "@/src/lib/google-signin";
import { initSentry } from "@/src/lib/sentry";
import useAppReady from "@/src/hooks/useAppReady";
import { Toaster } from "@/src/shared/components/ui/sonner";
import { AppProviders } from "../../providers/AppProviders";
import LoadingScreen from "@/src/shared/components/ui/loading-screen";
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

jest.mock("@/src/features/auth/contexts", () => ({
  __esModule: true,
  useAuth: jest.fn(),
}));

jest.mock("@/src/hooks/useAppReady", () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock("../../providers/AppProviders", () => ({
  __esModule: true,
  AppProviders: jest.fn(({ children }) => children),
}));

jest.mock("@/src/shared/components/ui/loading-screen", () => ({
  __esModule: true,
  default: jest.fn(() => null),
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
const mockUseAuth = jest.mocked(useAuth);
const mockConfigureGoogleSignin = jest.mocked(configureGoogleSignin);
const mockInitSentry = jest.mocked(initSentry);
const mockUseAppReady = jest.mocked(useAppReady);
const mockToaster = jest.mocked(Toaster);
const mockAppProviders = jest.mocked(AppProviders);
const mockLoadingScreen = jest.mocked(LoadingScreen);

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
    mockUseAuth.mockReturnValue({ loading: false } as never);
  });

  it("retorna null enquanto o app não estiver pronto", () => {
    mockUseAppReady.mockReturnValue(false);

    const { toJSON } = render(<AppLayout />);

    expect(toJSON()).toBeNull();
    expect(mockUseAuth).not.toHaveBeenCalled();
    expect(mockAppProviders).not.toHaveBeenCalled();
    expect(mockStack).not.toHaveBeenCalled();
    expect(mockToaster).not.toHaveBeenCalled();
  });

  it("renderiza LoadingScreen quando a autenticação ainda está carregando", () => {
    mockUseAuth.mockReturnValue({ loading: true } as never);

    render(<AppLayout />);

    expect(mockAppProviders).toHaveBeenCalledTimes(1);
    expect(mockLoadingScreen).toHaveBeenCalledTimes(1);
    expect(mockStack).not.toHaveBeenCalled();
    expect(mockToaster).toHaveBeenCalledWith(
      expect.objectContaining({ position: "bottom-center" }),
      undefined
    );
  });

  it("renderiza Stack quando o app está pronto e autenticado", () => {
    render(<AppLayout />);

    expect(mockAppProviders).toHaveBeenCalledTimes(1);
    expect(mockLoadingScreen).not.toHaveBeenCalled();
    expect(mockStack).toHaveBeenCalledWith(
      expect.objectContaining({
        screenOptions: { headerShown: false },
      }),
      undefined
    );
    expect(mockToaster).toHaveBeenCalledWith(
      expect.objectContaining({ position: "bottom-center" }),
      undefined
    );
  });
});
