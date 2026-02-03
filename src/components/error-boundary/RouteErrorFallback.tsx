import { captureException } from "@sentry/react-native";
import type { ErrorBoundaryProps } from "expo-router";
import React, { useEffect } from "react";
import { Text, TouchableOpacity, View } from "react-native";

interface RouteErrorFallbackProps extends ErrorBoundaryProps {
  readonly domain: string;
}

export function RouteErrorFallback({
  domain,
  error,
  retry,
}: Readonly<RouteErrorFallbackProps>) {
  useEffect(() => {
    captureException(error, {
      tags: {
        boundaryType: "route",
        domain,
      },
    });
  }, [domain, error]);

  return (
    <View className="flex-1 items-center justify-center bg-white px-6">
      <Text className="text-center font-inter-semibold text-2xl text-gray-900">
        Ops! Falha no domínio {domain}
      </Text>
      <Text className="mt-3 text-center font-inter-regular text-base text-gray-600">
        Ocorreu um erro inesperado nesta área do app.
      </Text>
      {__DEV__ && (
        <Text className="mt-4 text-center font-inter-regular text-xs text-red-500">
          {error.message}
        </Text>
      )}
      <TouchableOpacity
        onPress={retry}
        className="mt-8 rounded-xl bg-indigo-600 px-5 py-3"
      >
        <Text className="font-inter-semibold text-white">Tentar novamente</Text>
      </TouchableOpacity>
    </View>
  );
}
