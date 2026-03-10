import { Feather } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import {
  Modal,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { MetodoPagamento } from "../../types/account.types";

const paymentMethodLabels: Record<MetodoPagamento, string> = {
  [MetodoPagamento.PIX]: "PIX",
  [MetodoPagamento.CARTAO]: "Cartão",
  [MetodoPagamento.DINHEIRO]: "Dinheiro",
};

interface AddAccountModalFormSectionProps {
  readonly descricao: string;
  readonly valorTotal: string;
  readonly vencimento: Date;
  readonly tempVencimento: Date;
  readonly showDatepicker: boolean;
  readonly metodoPagamento: MetodoPagamento;
  readonly onDescricaoChange: (value: string) => void;
  readonly onValorTotalChange: (value: string) => void;
  readonly onOpenDatepicker: () => void;
  readonly onConfirmDate: () => void;
  readonly onDateChange: (_: unknown, selectedDate?: Date) => void;
  readonly onCycleMetodoPagamento: () => void;
}

export function AddAccountModalFormSection({
  descricao,
  valorTotal,
  vencimento,
  tempVencimento,
  showDatepicker,
  metodoPagamento,
  onDescricaoChange,
  onValorTotalChange,
  onOpenDatepicker,
  onConfirmDate,
  onDateChange,
  onCycleMetodoPagamento,
}: AddAccountModalFormSectionProps) {
  return (
    <>
      <View className="mb-3">
        <Text className="mb-1 text-sm text-gray-700">Descrição</Text>
        <TextInput
          value={descricao}
          onChangeText={onDescricaoChange}
          placeholder="Ex: Cemig"
          className="rounded border border-gray-200 bg-gray-50 px-3 py-2"
        />
      </View>

      <View className="mb-3 flex-row gap-3">
        <View className="flex-1">
          <Text className="mb-1 text-sm text-gray-700">Valor Total (R$)</Text>
          <TextInput
            value={valorTotal}
            onChangeText={onValorTotalChange}
            keyboardType="numeric"
            placeholder="0,00"
            className="rounded border border-gray-200 bg-gray-50 px-3 py-2"
          />
        </View>

        <View style={{ width: 140 }}>
          <Text className="mb-1 text-sm text-gray-700">Vencimento</Text>
          <TouchableOpacity
            className="flex-row items-center justify-between rounded border border-gray-200 bg-gray-50 px-3 py-2"
            onPress={onOpenDatepicker}
          >
            <Text>{vencimento.toLocaleDateString("pt-BR")}</Text>
            <Feather name="calendar" size={18} color="#6b7280" />
          </TouchableOpacity>

          {Platform.OS === "ios" ? (
            <Modal visible={showDatepicker} transparent animationType="slide">
              <View className="flex-1 justify-end bg-black/40">
                <View className="bg-white pb-8 pt-4">
                  <View className="mb-2 flex-row justify-end px-4">
                    <TouchableOpacity onPress={onConfirmDate}>
                      <Text className="text-base font-semibold text-indigo-600">
                        Confirmar
                      </Text>
                    </TouchableOpacity>
                  </View>

                  <View className="items-center">
                    <DateTimePicker
                      value={tempVencimento}
                      mode="date"
                      display="spinner"
                      onChange={onDateChange}
                      locale="pt-BR"
                    />
                  </View>
                </View>
              </View>
            </Modal>
          ) : (
            showDatepicker && (
              <DateTimePicker
                value={vencimento}
                mode="date"
                display="calendar"
                onChange={onDateChange}
              />
            )
          )}
        </View>
      </View>

      <View className="mb-3">
        <Text className="mb-1 text-sm text-gray-700">Método de Pagamento</Text>
        <TouchableOpacity
          className="flex-row items-center justify-between rounded border border-gray-200 bg-gray-50 px-3 py-2"
          onPress={onCycleMetodoPagamento}
        >
          <Text>{paymentMethodLabels[metodoPagamento]}</Text>
        </TouchableOpacity>
      </View>
    </>
  );
}
