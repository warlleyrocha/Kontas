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
import { useAccountForm } from "../hooks/useAccountForm";

interface AddAccountModalProps {
  visible: boolean;
  onClose: () => void;
}

export const AddAccountModal = ({ visible, onClose }: AddAccountModalProps) => {
  const {
    descricao,
    valorTotal,
    vencimento,
    metodoPagamento,
    tempVencimento,
    showDatepicker,
    tipoDivisao,
    moradoresDivisao,
    totalDivisaoPreenchido,

    setDescricao,
    setValorTotal,
    setMetodoPagamento,

    handleCloseModal,
    handleConfirmDate,
    handleOpenDatepicker,
    handleDateChange,
    handleSetTipoDivisao,
    handleToggleMorador,
    handleMoradorValorChange,
  } = useAccountForm({ onClose });

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
                <Text className="text-lg font-semibold">Nova Conta</Text>
                <Text className="mt-1 text-sm text-gray-500">
                  Adicione uma nova conta para a república
                </Text>
              </View>
              <TouchableOpacity onPress={handleCloseModal} className="p-2">
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
                    value={valorTotal}
                    onChangeText={setValorTotal}
                    keyboardType="numeric"
                    placeholder="0,00"
                    className="rounded border border-gray-200 bg-gray-50 px-3 py-2"
                  />
                </View>

                <View style={{ width: 140 }}>
                  <Text className="mb-1 text-sm text-gray-700">Vencimento</Text>
                  <TouchableOpacity
                    className="flex-row items-center justify-between rounded border border-gray-200 bg-gray-50 px-3 py-2"
                    onPress={handleOpenDatepicker}
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
                            <TouchableOpacity onPress={handleConfirmDate}>
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

              {/* Tipo de divisão */}
              <View className="mb-3 border-t border-gray-200 pt-3">
                <Text className="mb-2 text-sm text-gray-700">
                  Tipo de Divisão
                </Text>
                <View>
                  <TouchableOpacity
                    onPress={() => handleSetTipoDivisao("equal")}
                    className="mb-2 flex-row items-center"
                  >
                    <View
                      className={`mr-3 h-4 w-4 rounded-full border border-indigo-600 ${
                        tipoDivisao === "equal"
                          ? "bg-indigo-600"
                          : "bg-transparent"
                      }`}
                    />
                    <Text>Dividir igualmente</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => handleSetTipoDivisao("custom")}
                    className="flex-row items-center"
                  >
                    <View
                      className={`mr-3 h-4 w-4 rounded-full border border-indigo-600 ${
                        tipoDivisao === "custom"
                          ? "bg-indigo-600"
                          : "bg-transparent"
                      }`}
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
                  {moradoresDivisao.map((morador) => (
                    <View
                      key={morador.moradorId}
                      className="flex-row items-center justify-between rounded-md bg-gray-50 px-3 py-2"
                    >
                      <View className="flex-row items-center">
                        <TouchableOpacity
                          onPress={() => handleToggleMorador(morador.moradorId)}
                          className={`mr-3 h-6 w-6 items-center justify-center rounded-sm border ${
                            morador.checked
                              ? "border-indigo-600 bg-indigo-600"
                              : "border-gray-300 bg-white"
                          }`}
                        >
                          <Feather
                            name="check"
                            size={14}
                            color={morador.checked ? "#fff" : "transparent"}
                          />
                        </TouchableOpacity>

                        <Text>{morador.nome}</Text>
                      </View>

                      <View style={{ width: 120 }}>
                        <TextInput
                          value={morador.valor}
                          editable={morador.checked && tipoDivisao === "custom"}
                          onFocus={() => setIsValorInputFocused(true)}
                          onBlur={() => setIsValorInputFocused(false)}
                          onChangeText={(value) =>
                            handleMoradorValorChange(morador.moradorId, value)
                          }
                          keyboardType="numeric"
                          className={`rounded px-2 py-1 text-right ${
                            morador.checked && tipoDivisao === "custom"
                              ? "bg-white"
                              : "bg-gray-100 text-gray-500"
                          }`}
                        />
                      </View>
                    </View>
                  ))}
                </View>

                {/* total check */}
                <View className="mr-2 mt-8 flex-row items-center justify-between">
                  <Text className="text-sm text-gray-500">
                    Total preenchido
                  </Text>
                  <Text className="text-sm font-semibold">
                    R$ {totalDivisaoPreenchido.toFixed(2).replace(".", ",")}
                  </Text>
                </View>
              </View>

              {/* buttons */}
              <View className="mt-[10px] flex-row gap-3">
                <TouchableOpacity
                  onPress={() => console.log("clicado")}
                  className="flex-1 items-center rounded-md bg-indigo-600 py-3"
                >
                  <Text className="font-medium text-white">
                    Adicionar Conta
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleCloseModal}
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
