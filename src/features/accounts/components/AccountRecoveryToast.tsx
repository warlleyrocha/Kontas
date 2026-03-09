import { useEffect, useMemo, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface AccountRecoveryToastProps {
  readonly message: string;
  readonly onRecover: () => void;
  readonly durationMs: number;
}

const UPDATE_INTERVAL_MS = 100;

export function AccountRecoveryToast({
  message,
  onRecover,
  durationMs,
}: AccountRecoveryToastProps) {
  const [remainingMs, setRemainingMs] = useState(durationMs);

  useEffect(() => {
    const startedAt = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startedAt;
      const nextRemainingMs = Math.max(durationMs - elapsed, 0);
      setRemainingMs(nextRemainingMs);
      if (nextRemainingMs <= 0) clearInterval(interval);
    }, UPDATE_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [durationMs]);

  const progressPercent = useMemo(() => {
    if (durationMs <= 0) return 0;
    return (remainingMs / durationMs) * 100;
  }, [durationMs, remainingMs]);

  return (
    <View
      className="overflow-hidden rounded-xl"
      style={{
        backgroundColor: "#ffffff",
        marginHorizontal: 16,
        padding: 4,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.35,
        shadowRadius: 16,
        elevation: 12,
      }}
    >
      {/* Content row — justify-between separa esquerda e direita */}
      <View className="flex-row items-center justify-between px-6 py-3.5">
        {/* Esquerda: ícone animado + mensagem */}
        <View className="flex-row items-center gap-3">
          <Text className="text-[14x]" style={{ color: "#16a34a" }}>
            {message}
          </Text>
        </View>

        {/* Direita: botão como ícone estático */}
        <TouchableOpacity onPress={onRecover} activeOpacity={0.6}>
          <Ionicons name="sync" size={20} color="#16a34a" />
        </TouchableOpacity>
      </View>

      {/* Progress bar */}
      {/* Progress bar — fixada no bottom com bordas arredondadas */}
      <View
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: 2,
          backgroundColor: "rgba(1, 151, 9, 0.1)",
          borderBottomLeftRadius: 12,
          borderBottomRightRadius: 12,
        }}
      >
        <View
          style={{
            height: "100%",
            width: `${progressPercent}%`,
            backgroundColor: "#16a34a",
            borderBottomLeftRadius: 12,
          }}
        />
      </View>
    </View>
  );
}
