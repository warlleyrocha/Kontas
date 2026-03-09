import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  View,
} from "react-native";
import { AddAccountModalActions } from "./AddAccountModalActions";
import { AddAccountModalFormSection } from "./AddAccountModalFormSection";
import { AddAccountModalHeader } from "./AddAccountModalHeader";
import { AddAccountModalResidentsSection } from "./AddAccountModalResidentsSection";
import { useAccountForm } from "../hooks/useAccountForm";
import {
  type CriarContaComMoradoresRequest,
  StatusConta,
} from "../types/account.types";

interface AddAccountModalProps {
  readonly visible: boolean;
  readonly onClose: () => void;
  readonly republicId: string;
  readonly onSubmit: (
    data: CriarContaComMoradoresRequest,
  ) => Promise<void> | void;
}

function getNextPaymentMethod(currentMethod: string): string {
  if (currentMethod === "PIX") {
    return "Cartão";
  }

  if (currentMethod === "Cartão") {
    return "Dinheiro";
  }

  return "PIX";
}

export default function AddAccountModal({
  visible,
  onClose,
  republicId,
  onSubmit,
}: AddAccountModalProps) {
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
    handleSetTipoDivisao,
    handleToggleMorador,
    handleMoradorValorChange,
  } = useAccountForm({ onClose, republicId });
  // Destructuring
  const {
    descricao,
    valorTotal,
    vencimento,
    metodoPagamento,
    tipoDivisao,
    moradoresDivisao,
  } = formData;

  const [isValorInputFocused, setIsValorInputFocused] = useState(false);

  const handleDescricaoChange = (value: string) => {
    setFormData((prev) => ({ ...prev, descricao: value }));
  };

  const handleCyclePaymentMethod = () => {
    setFormData((prev) => ({
      ...prev,
      metodoPagamento: getNextPaymentMethod(prev.metodoPagamento),
    }));
  };

  const handleSubmit = () => {
    // Converte a data para formato ISO string
    const vencimentoISO = vencimento.toISOString();

    // Converte o valor de string para número
    const valorNumerico = parseFloat(valorTotal.replace(",", ".")) || 0;

    // Monta o payload no formato REST
    const moradorIds = moradoresDivisao
      .filter((morador) => morador.checked)
      .map((morador) => String(morador.moradorId));

    const payload: CriarContaComMoradoresRequest = {
      descricao,
      valor: valorNumerico,
      vencimento: vencimentoISO,
      metodoPagamento,
      republicaId: republicId,
      status: StatusConta.PENDENTE,
      moradorIds,
    };

    void onSubmit(payload);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View className="flex-1 items-center justify-center bg-black/40 px-4">
          <View
            className="max-h-[90%] w-full max-w-[480px] rounded-xl bg-white px-6 pt-6"
            style={{
              transform: [{ translateY: isValorInputFocused ? -135 : 0 }],
            }}
          >
            <AddAccountModalHeader onClose={handleCloseModal} />

            <ScrollView
              contentContainerStyle={{ paddingBottom: 16 }}
              showsVerticalScrollIndicator={false}
            >
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

              <AddAccountModalResidentsSection
                tipoDivisao={tipoDivisao}
                moradoresDivisao={moradoresDivisao}
                totalDivisaoPreenchido={totalDivisaoPreenchido}
                onSetTipoDivisao={handleSetTipoDivisao}
                onToggleMorador={handleToggleMorador}
                onMoradorValorChange={handleMoradorValorChange}
                onValorInputFocusChange={setIsValorInputFocused}
              />

              <AddAccountModalActions
                onSubmit={handleSubmit}
                onCancel={handleCloseModal}
              />
            </ScrollView>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
