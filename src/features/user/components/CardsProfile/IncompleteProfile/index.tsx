import { Text, TouchableOpacity, View } from "react-native";

interface IncompleteProfileCardProps {
  readonly onContinue: () => void;
}

export default function IncompleteProfile({
  onContinue,
}: IncompleteProfileCardProps) {
  return (
    <View className="mt-[-30px] flex-1 items-center justify-center bg-gradient-to-b from-slate-50 to-white px-6">
      <View className="w-full max-w-md">
        <View className="rounded-3xl bg-white p-8 shadow-2xl shadow-gray-900/5">
          <View className="mb-4 self-start rounded-full bg-teal/10 px-4 py-2">
            <Text className="text-xs font-semibold text-teal">QUASE LÁ!</Text>
          </View>

          <Text className="mb-3 text-2xl font-bold leading-tight text-gray-900">
            Complete seu perfil
          </Text>

          <Text className="mb-8 text-base leading-relaxed text-gray-600">
            Cadastre sua chave PIX e telefone para desbloquear todos os recursos
            e participar de repúblicas.
          </Text>

          <TouchableOpacity
            onPress={onContinue}
            accessibilityRole="button"
            accessibilityLabel="Continuar configuração do perfil"
            className="w-full overflow-hidden rounded-2xl bg-teal px-6 py-4 shadow-lg hover:shadow-teal/30 active:scale-95"
            activeOpacity={0.9}
          >
            <Text className="text-center text-[16px] font-bold text-white">
              Continuar
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
