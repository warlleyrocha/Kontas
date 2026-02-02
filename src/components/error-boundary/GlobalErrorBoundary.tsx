import { captureException } from "@sentry/react-native";
import React, { type ErrorInfo, type ReactNode } from "react";
import { Text, TouchableOpacity, View } from "react-native";

interface GlobalErrorBoundaryProps {
  readonly children: ReactNode;
}

interface GlobalErrorBoundaryState {
  readonly hasError: boolean;
  readonly error: Error | null;
}

export class GlobalErrorBoundary extends React.Component<
  GlobalErrorBoundaryProps,
  GlobalErrorBoundaryState
> {
  public constructor(props: GlobalErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  public static getDerivedStateFromError(error: Error): GlobalErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    captureException(error, {
      tags: {
        boundaryType: "global",
      },
      contexts: {
        react: {
          componentStack: errorInfo.componentStack,
        },
      },
    });
  }

  private readonly handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
    });
  };

  public render() {
    if (!this.state.hasError || !this.state.error) {
      return this.props.children;
    }

    return (
      <View className="flex-1 items-center justify-center bg-white px-6">
        <Text className="text-center font-inter-semibold text-2xl text-gray-900">
          Ocorreu um erro inesperado
        </Text>
        <Text className="mt-3 text-center font-inter-regular text-base text-gray-600">
          Tente novamente. Se persistir, reinicie o aplicativo.
        </Text>
        {__DEV__ && (
          <Text className="mt-4 text-center font-inter-regular text-xs text-red-500">
            {this.state.error.message}
          </Text>
        )}
        <TouchableOpacity
          onPress={this.handleRetry}
          className="mt-8 rounded-xl bg-indigo-600 px-5 py-3"
        >
          <Text className="font-inter-semibold text-white">Tentar novamente</Text>
        </TouchableOpacity>
      </View>
    );
  }
}
