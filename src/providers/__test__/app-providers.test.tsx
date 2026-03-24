import type { ReactNode } from "react";
import { render, screen } from "@testing-library/react-native";
import { Text } from "react-native";
import { QueryClientProvider } from "@tanstack/react-query";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { AuthProvider } from "@/src/features/auth/contexts";
import { RepublicListProvider } from "@/src/features/republic/contexts/RepublicListContext";
import { queryClient } from "@/src/services/queryClient";
import { GlobalErrorBoundary } from "@/src/shared/components/error-boundary/GlobalErrorBoundary";
import { RefreshProvider } from "@/src/shared/contexts/RefreshContext";
import { AppProviders } from "../AppProviders";

jest.mock("react-native-gesture-handler", () => ({
  __esModule: true,
  GestureHandlerRootView: jest.fn(
    ({ children }: { children: ReactNode }) => children,
  ),
}));

jest.mock("@tanstack/react-query", () => ({
  __esModule: true,
  QueryClientProvider: jest.fn(
    ({ children }: { children: ReactNode }) => children,
  ),
}));

jest.mock("@/src/features/auth/contexts", () => ({
  __esModule: true,
  AuthProvider: jest.fn(({ children }: { children: ReactNode }) => children),
}));

jest.mock("@/src/features/republic/contexts/RepublicListContext", () => ({
  __esModule: true,
  RepublicListProvider: jest.fn(
    ({ children }: { children: ReactNode }) => children,
  ),
}));

jest.mock("@/src/shared/components/error-boundary/GlobalErrorBoundary", () => ({
  __esModule: true,
  GlobalErrorBoundary: jest.fn(
    ({ children }: { children: ReactNode }) => children,
  ),
}));

jest.mock("@/src/shared/contexts/RefreshContext", () => ({
  __esModule: true,
  RefreshProvider: jest.fn(({ children }: { children: ReactNode }) => children),
}));

jest.mock("@/src/services/queryClient", () => ({
  __esModule: true,
  queryClient: { scope: "mock-query-client" },
}));

const mockGestureHandlerRootView = jest.mocked(GestureHandlerRootView);
const mockGlobalErrorBoundary = jest.mocked(GlobalErrorBoundary);
const mockQueryClientProvider = jest.mocked(QueryClientProvider);
const mockAuthProvider = jest.mocked(AuthProvider);
const mockRepublicListProvider = jest.mocked(RepublicListProvider);
const mockRefreshProvider = jest.mocked(RefreshProvider);

describe("AppProviders", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renderiza a cadeia de providers e exibe os children", () => {
    render(
      <AppProviders>
        <Text>conteudo filho</Text>
      </AppProviders>,
    );

    expect(mockGestureHandlerRootView).toHaveBeenCalledWith(
      expect.objectContaining({
        style: { flex: 1 },
      }),
      undefined,
    );
    expect(mockGlobalErrorBoundary).toHaveBeenCalledTimes(1);
    expect(mockQueryClientProvider).toHaveBeenCalledWith(
      expect.objectContaining({
        client: queryClient,
      }),
      undefined,
    );
    expect(mockAuthProvider).toHaveBeenCalledTimes(1);
    expect(mockRepublicListProvider).toHaveBeenCalledTimes(1);
    expect(mockRefreshProvider).toHaveBeenCalledTimes(1);
    expect(screen.getByText("conteudo filho")).toBeTruthy();
  });
});
