import Feather from "@expo/vector-icons/Feather";
import React, { useEffect, useRef } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function CheckEmail() {
  const baseId = React.useId();

  const [code, setCode] = React.useState(() =>
    Array.from({ length: 6 }, (_, i) => ({ id: `${baseId}-${i}`, value: "" })),
  );

  const inputRefs = useRef<(TextInput | null)[]>([]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleChangeText = (text: string, id: string) => {
    const index = code.findIndex((s) => s.id === id);
    const numericText = text.replaceAll(/\D/g, "");
    const newCode = [...code];

    if (numericText.length > 1) {
      const digits = numericText.slice(0, 6).split("");

      digits.forEach((digit, i) => {
        if (index + i < 6) {
          newCode[index + i] = { ...newCode[index + i], value: digit };
        }
      });

      setCode(newCode);
      inputRefs.current[Math.min(index + digits.length, 5)]?.focus();
      return;
    }

    newCode[index] = { ...newCode[index], value: numericText };
    setCode(newCode);

    if (numericText && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, id: string) => {
    const index = code.findIndex((s) => s.id === id);
    if (e.nativeEvent.key === "Backspace" && !code[index].value && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleResendCode = () => {
    setCode((prev) => prev.map((slot) => ({ ...slot, value: "" })));
    inputRefs.current[0]?.focus();
    console.log("Código reenviado");
  };

  const handleContinue = () => {
    const fullCode = code.map((s) => s.value).join("");
    if (fullCode.length === 6) {
      console.log("Código digitado:", fullCode);
    } else {
      alert("Por favor, digite o código completo");
    }
  };

  const isFilled = code.every((s) => s.value !== "");

  return (
    <SafeAreaView className="flex-1">
      <View className="flex-1 items-center justify-center gap-6 px-4 mt-[132px]">
        <View className="bg-[#ACEFC8] w-[80px] h-[80px] items-center justify-center rounded-full">
          <Feather name="mail" size={32} color="black" />
        </View>

        <View className="flex mt-[32px]">
          <Text className="font-inter-bold text-[18px] text-center mb-[28px]">
            Enviamos um código de verificação para o seu email.
          </Text>

          <Text className="font-inter-semibold text-[16px] mb-[6px]">
            Verifique sua caixa de entrada.
          </Text>

          <Text className="font-mulish text-gray-500 text-[15px]">
            Insira no campo a seguir o código recebido em seu email:
          </Text>

          <View className="flex-row gap-3 items-center justify-center mt-[32px]">
            {code.map((slot, index) => (
              <TextInput
                key={slot.id}
                ref={(ref) => {
                  inputRefs.current[index] = ref;
                }}
                value={slot.value}
                onChangeText={(text) => handleChangeText(text, slot.id)}
                onKeyPress={(e) => handleKeyPress(e, slot.id)}
                keyboardType="number-pad"
                maxLength={1}
                className="w-12 h-14 border-2 border-gray-300 rounded-lg text-center text-xl font-bold"
                style={{ borderColor: slot.value ? "#6366f1" : "#d1d5db" }}
                selectTextOnFocus
              />
            ))}
          </View>

          <TouchableOpacity onPress={handleResendCode} className="mt-4">
            <Text className="text-indigo-600 font-medium text-sm">
              Reenviar código
            </Text>
          </TouchableOpacity>
        </View>

        <View className="w-full mt-auto pb-[20px]">
          <TouchableOpacity
            className={`py-4 rounded-lg items-center ${isFilled ? "bg-indigo-600" : "bg-gray-300"}`}
            onPress={handleContinue}
            disabled={!isFilled}
          >
            <Text className="text-white text-[16px] leading-[18px] font-mulish-medium">
              Enviar
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
