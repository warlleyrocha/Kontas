import { Text, TouchableOpacity, View } from "react-native";

interface EmptyRepublicProps {
  readonly onCreateRepublic: () => void;
  readonly onViewInvites: () => void;
}

export default function EmptyRepublic({
  onCreateRepublic,
  onViewInvites,
}: EmptyRepublicProps) {
  return (
    <View className="flex-1 items-center justify-center px-6">
      <View className="w-full max-w-md">
        <View className="rounded-3xl bg-white p-8 shadow-lg">
          {/* Ícone ilustrativo */}
          <View className="mb-6 items-center">
            <View className="h-20 w-20 items-center justify-center rounded-full bg-gray-100">
              <Text className="text-4xl">🏘️</Text>
            </View>
          </View>

          <Text className="mb-3 text-center text-2xl font-bold text-gray-900">
            Nenhuma república vinculada
          </Text>

          <Text className="mb-8 text-center text-base leading-relaxed text-gray-600">
            Crie sua primeira república ou aguarde um convite para começar a
            gerenciar despesas compartilhadas.
          </Text>

          {/* Botão principal */}
          <TouchableOpacity
            onPress={onCreateRepublic}
            className="mb-3 w-full overflow-hidden rounded-2xl bg-teal px-6 py-4 shadow-lg shadow-teal/30"
            activeOpacity={0.9}
          >
            <Text className="text-center text-base font-bold text-white">
              Criar República
            </Text>
          </TouchableOpacity>

          {/* Link secundário */}
          <TouchableOpacity onPress={onViewInvites} activeOpacity={0.7}>
            <Text className="text-center text-sm font-medium text-teal">
              Ver meus convites
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
