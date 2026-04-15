import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { NextButton } from "@/src/shared/components/NextButton";
import { formatBRL } from "@/src/shared/utils/formats";
import { useAccountForm } from "../../hooks/useAccountForm";
import {
  type CriarContaComMoradoresRequest,
  MetodoPagamento,
  StatusConta,
} from "../../types/account.types";
import { parseCurrencyValue } from "../../utils/accountForm.utils";
import { AddAccountModalActions } from "./AddAccountModalActions";
import { AddAccountModalFormSection } from "./AddAccountModalFormSection";
import { AddAccountModalHeader } from "./AddAccountModalHeader";
import { AddAccountModalResidentsSection } from "./AddAccountModalResidentsSection";

interface AddAccountModalProps {
  readonly visible: boolean;
  readonly onClose: () => void;
  readonly republicId: string;
  readonly onSubmit: (
    data: CriarContaComMoradoresRequest
  ) => Promise<void> | void;
}

function getNextPaymentMethod(currentMethod: MetodoPagamento): MetodoPagamento {
  if (currentMethod === MetodoPagamento.PIX) {
    return MetodoPagamento.CARTAO;
  }

  if (currentMethod === MetodoPagamento.CARTAO) {
    return MetodoPagamento.DINHEIRO;
  }

  return MetodoPagamento.PIX;
}

export default function AddAccountModal({
  visible,
  onClose,
  republicId,
  onSubmit,
}: AddAccountModalProps) {
  const [activeTab, setActiveTab] = useState<"form" | "residents">("form");
  const {
    formData,
    tempVencimento,
    showDatepicker,
    totalDivisaoPreenchido,
    setFormData,

    handleCloseModal,
    handleConfirmDate,
    handleOpenDatepicker,
    handleDateChange,
    handleValorTotalChange,
    handleToggleMorador,
    handleMoradorValorChange,
  } = useAccountForm({ onClose, republicId, visible });
  // Destructuring
  const {
    descricao,
    valorTotal,
    vencimento,
    metodoPagamento,
    moradoresDivisao,
    tipoDivisao,
  } = formData;

  const valorTotalNumerico = parseCurrencyValue(valorTotal);
  const restante = valorTotalNumerico - totalDivisaoPreenchido;

  const handleDescricaoChange = (value: string) => {
    setFormData((prev) => ({ ...prev, descricao: value }));
  };

  const handleCyclePaymentMethod = () => {
    setFormData((prev) => ({
      ...prev,
      metodoPagamento: getNextPaymentMethod(prev.metodoPagamento),
    }));
  };

  const handleSubmit = async () => {
    // Converte a data para formato ISO string
    const vencimentoISO = vencimento.toISOString();

   const moradoresIgual = tipoDivisao === "equal"
  ? moradoresDivisao
      .filter((morador) => morador.checked)
      .map((morador) => String(morador.moradorId))
  : [];

const moradoresCustomizados = tipoDivisao === "custom"
  ? moradoresDivisao
      .filter((morador) => morador.checked)
      .map((morador) => ({
        moradorId: String(morador.moradorId),
        valor: parseCurrencyValue(morador.valor),
      }))
  : [];

    const payload: CriarContaComMoradoresRequest = {
    descricao,
    valor: valorTotalNumerico,
    vencimento: vencimentoISO,
    metodoPagamento,
    republicaId: republicId,
    status: StatusConta.PENDENTE,
    moradores: {
      igual: moradoresIgual,
      customizados: moradoresCustomizados,
    },
  };
    await onSubmit(payload);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <SafeAreaView className="flex-1 items-center justify-end bg-black/40">
        {/* Header — fixo, bg white */}
        <AddAccountModalHeader onClose={handleCloseModal} />

        {/* Body — scrollável, bg cinza */}
        <KeyboardAvoidingView
          className="w-full flex-1 bg-[#EFF1F0]"
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <ScrollView
            className="px-6 pt-6"
            contentContainerStyle={{ paddingBottom: 16 }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {activeTab === "form" && (
              <AddAccountModalFormSection
                descricao={descricao}
                valorTotal={valorTotal}
                vencimento={vencimento}
                tempVencimento={tempVencimento}
                showDatepicker={showDatepicker}
                metodoPagamento={metodoPagamento}
                onDescricaoChange={handleDescricaoChange}
                onValorTotalChange={handleValorTotalChange}
                onOpenDatepicker={handleOpenDatepicker}
                onConfirmDate={handleConfirmDate}
                onDateChange={handleDateChange}
                onCycleMetodoPagamento={handleCyclePaymentMethod}
              />
            )}

            {activeTab === "residents" && (
              <AddAccountModalResidentsSection
                moradoresDivisao={moradoresDivisao}
                onToggleMorador={handleToggleMorador}
                onMoradorValorChange={handleMoradorValorChange}
              />
            )}
          </ScrollView>
        </KeyboardAvoidingView>

        {/* Footer — fixo, bg white, conteúdo condicional */}
        <View className="w-full bg-white px-6 pt-4 pb-6">
          {activeTab === "form" && (
            <NextButton
              onNext={() => setActiveTab("residents")}
              onCancel={handleCloseModal}
              disabled={!descricao.trim() || !valorTotal.trim()}
            />
          )}

          {activeTab === "residents" && (
            <>
              {/* Total preenchido / restante */}
              <View className="flex-row justify-between items-end mb-4">
                <View>
                  <Text className="text-xs text-gray-500 font-inter-bold">
                    TOTAL PREENCHIDO
                  </Text>
                  <Text className="text-2xl font-inter-bold text-gray-900">
                    R$ {formatBRL(totalDivisaoPreenchido)}
                  </Text>
                </View>
                <View className="items-end">
                  <Text className="text-xs text-gray-400 font-inter-bold">
                    RESTANTE
                  </Text>
                  <Text className="text-lg text-gray-400 font-inter-bold">
                    R$ {formatBRL(restante)}
                  </Text>
                </View>
              </View>

              <AddAccountModalActions
                onSubmit={handleSubmit}
                onCancel={() => setActiveTab("form")}
              />
            </>
          )}
        </View>
      </SafeAreaView>
    </Modal>
  );
}
