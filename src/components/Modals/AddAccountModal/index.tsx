import useAddAccount from "@/src/components/Modals/AddAccountModal/useAccountModal";
import type { Conta, Republica } from "@/src/types/resume";
import { Feather } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface AddAccountModalProps {
  visible: boolean;
  onClose: () => void;
  republica: Republica;
  setRepublica: (r: Republica) => void;
  contaParaEditar?: Conta | null;
}

export const AddAccountModal: React.FC<AddAccountModalProps> = ({
  visible,
  onClose,
  republica,
  setRepublica,
  contaParaEditar,
}) => {
  const {
    descricao,
    setDescricao,
    valorStr,
    setValorStr,
    vencimento,
    showDatepicker,
    setShowDatepicker,
    metodoPagamento,
    setMetodoPagamento,
    responsavelId,
    setResponsavelId,
    tipoDivisao,
    setTipoDivisao,
    selectedIds,
    toggleSelectMorador,
    valoresByMorador,
    setValorMorador,
    somaResponsaveis,
    limpar,
    salvar,
    handleDateChange,
  } = useAddAccount({
    republica,
    setRepublica,
    onClose,
    visible,
    contaParaEditar,
  });

  const [isValorInputFocused, setIsValorInputFocused] = useState(false);

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View className="min-h-screen flex-1 justify-center bg-black/40 px-[16px] pt-[20px]">
        <KeyboardAvoidingView>
          <View
            className="max-h-[100%] rounded-xl bg-white px-6 pt-6"
            style={{
              transform: [{ translateY: isValorInputFocused ? -135 : 0 }],
            }}
          >
            {/* header */}
            <View className="mb-3 flex-row items-center justify-between">
              <View>
                <Text className="text-lg font-semibold">
                  {contaParaEditar ? "Editar Conta" : "Nova Conta"}
                </Text>
                <Text className="mt-1 text-sm text-gray-500">
                  {contaParaEditar
                    ? "Modifique os dados da conta"
                    : "Adicione uma nova conta para a república"}
                </Text>
              </View>
              <TouchableOpacity onPress={onClose} className="p-2">
                <Feather name="x" size={24} color="#374151" />
              </TouchableOpacity>
            </View>

            <ScrollView
              contentContainerStyle={{ paddingBottom: 16 }}
              showsVerticalScrollIndicator={false}
            >
              {/* Descrição */}
              <View className="mb-3">
                <Text className="mb-1 text-sm text-gray-700">Descrição</Text>
                <TextInput
                  value={descricao}
                  onChangeText={setDescricao}
                  placeholder="Ex: Cemig"
                  className="rounded border border-gray-200 bg-gray-50 px-3 py-2"
                />
              </View>

              {/* Valor e Vencimento - duas colunas */}
              <View className="mb-3 flex-row gap-3">
                <View className="flex-1">
                  <Text className="mb-1 text-sm text-gray-700">
                    Valor Total (R$)
                  </Text>
                  <TextInput
                    value={valorStr}
                    onChangeText={setValorStr}
                    keyboardType="numeric"
                    placeholder="0,00"
                    className="rounded border border-gray-200 bg-gray-50 px-3 py-2"
                  />
                </View>

                <View style={{ width: 140 }}>
                  <Text className="mb-1 text-sm text-gray-700">Vencimento</Text>
                  <TouchableOpacity
                    className="flex-row items-center justify-between rounded border border-gray-200 bg-gray-50 px-3 py-2"
                    onPress={() => setShowDatepicker(true)}
                  >
                    <Text>{vencimento.toLocaleDateString("pt-BR")}</Text>
                    <Feather name="calendar" size={18} color="#6b7280" />
                  </TouchableOpacity>
                  {Platform.OS === "ios" ? (
                    <Modal
                      visible={showDatepicker}
                      transparent
                      animationType="slide"
                    >
                      <View className="flex-1 justify-end bg-black/40">
                        <View className="bg-white pb-8 pt-4">
                          <View className="mb-2 flex-row justify-end px-4">
                            <TouchableOpacity
                              onPress={() => setShowDatepicker(false)}
                            >
                              <Text className="text-base font-semibold text-indigo-600">
                                Confirmar
                              </Text>
                            </TouchableOpacity>
                          </View>

                          <View className="items-center">
                            <DateTimePicker
                              value={vencimento}
                              mode="date"
                              display="spinner"
                              onChange={handleDateChange}
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
                        onChange={handleDateChange}
                      />
                    )
                  )}
                </View>
              </View>

              {/* Metodo e Responsavel principal */}
              <View className="mb-3">
                <Text className="mb-1 text-sm text-gray-700">
                  Método de Pagamento
                </Text>
                <TouchableOpacity
                  className="flex-row items-center justify-between rounded border border-gray-200 bg-gray-50 px-3 py-2"
                  onPress={() => {
                    // placeholder: ciclo simples entre algumas opções (pode trocar p/ menu)
                    let next: string;
                    if (metodoPagamento === "PIX") {
                      next = "Cartão";
                    } else if (metodoPagamento === "Cartão") {
                      next = "Dinheiro";
                    } else {
                      next = "PIX";
                    }
                    setMetodoPagamento(next);
                  }}
                >
                  <Text>{metodoPagamento}</Text>
                </TouchableOpacity>
              </View>

              <View className="mb-3">
                <Text className="mb-1 text-sm text-gray-700">
                  Morador Responsável
                </Text>
                <View className="flex-row flex-wrap gap-2">
                  {republica.moradores.map((m) => (
                    <TouchableOpacity
                      key={m.id}
                      onPress={() => setResponsavelId(m.id)}
                      className={`rounded-md border px-3 py-2 ${responsavelId === m.id ? "border-indigo-600 bg-indigo-50" : "border-gray-200"}`}
                    >
                      <Text
                        className={
                          responsavelId === m.id
                            ? "text-indigo-600"
                            : "text-gray-700"
                        }
                      >
                        {m.nome}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Tipo de divisão */}
              <View className="mb-3 border-t border-gray-200 pt-3">
                <Text className="mb-2 text-sm text-gray-700">
                  Tipo de Divisão
                </Text>
                <View>
                  <TouchableOpacity
                    onPress={() => setTipoDivisao("equal")}
                    className="mb-2 flex-row items-center"
                  >
                    <View
                      className={`mr-3 h-4 w-4 rounded-full border ${tipoDivisao === "equal" ? "border-indigo-600 bg-indigo-600" : "border-gray-300"}`}
                    />
                    <Text>Dividir igualmente</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => setTipoDivisao("custom")}
                    className="flex-row items-center"
                  >
                    <View
                      className={`mr-3 h-4 w-4 rounded-full border ${tipoDivisao === "custom" ? "border-indigo-600 bg-indigo-600" : "border-gray-300"}`}
                    />
                    <Text>Valores customizados</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Selecione os moradores (checkbox + valor) */}
              <View className="mb-4">
                <Text className="mb-2 text-sm text-gray-700">
                  Selecione os Moradores
                </Text>
                <View className="space-y-2">
                  {republica.moradores.map((m) => {
                    const checked = selectedIds.includes(m.id);
                    const valor = valoresByMorador[m.id] ?? "0.00";
                    return (
                      <View
                        key={m.id}
                        className="flex-row items-center justify-between rounded-md bg-gray-50 px-3 py-2"
                      >
                        <View className="flex-row items-center">
                          <TouchableOpacity
                            onPress={() => toggleSelectMorador(m.id)}
                            className={`mr-3 h-6 w-6 items-center justify-center rounded-sm ${checked ? "bg-indigo-600" : "border border-gray-300 bg-white"}`}
                          >
                            {checked && (
                              <Feather name="check" size={14} color="#fff" />
                            )}
                          </TouchableOpacity>

                          <Text>{m.nome}</Text>
                        </View>

                        <View style={{ width: 120 }}>
                          <TextInput
                            value={valor}
                            editable={checked}
                            onFocus={() => setIsValorInputFocused(true)}
                            onBlur={() => setIsValorInputFocused(false)}
                            onChangeText={(t) => setValorMorador(m.id, t)}
                            keyboardType="numeric"
                            className={`rounded px-2 py-1 text-right ${checked ? "border border-gray-200 bg-white" : "bg-gray-100"}`}
                          />
                        </View>
                      </View>
                    );
                  })}
                </View>

                {/* total check */}
                <View className="mr-2 mt-3 flex-row items-center justify-between">
                  <Text className="text-sm text-gray-500">
                    Total preenchido
                  </Text>
                  <Text className="text-sm font-semibold">
                    R$ {somaResponsaveis.toFixed(2)}
                  </Text>
                </View>
              </View>

              {/* buttons */}
              <View className="mt-[20px] flex-row gap-3">
                <TouchableOpacity
                  onPress={async () => {
                    const ok = await salvar();
                    // salvar já chama onClose() via hook; caso prefira, pode controlar aqui também
                    if (ok) {
                      // nada extra por enquanto
                    }
                  }}
                  className="flex-1 items-center rounded-md bg-indigo-600 py-3"
                >
                  <Text className="font-medium text-white">
                    Adicionar Conta
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => {
                    limpar();
                    onClose();
                  }}
                  className="flex-1 items-center rounded-md border border-gray-300 py-3"
                >
                  <Text className="font-medium text-gray-700">Cancelar</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

export default AddAccountModal;
