import { Feather } from "@expo/vector-icons";
import React, { useRef } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function CheckEmail() {
  const [code, setCode] = React.useState(["", "", "", "", "", ""]);

  // Ref para acessar cada input
  const inputRefs = useRef<(TextInput | null)[]>([]);

  // Função que lida com a mudança de texto em cada input
  const handleChangeText = (text: string, index: number) => {
    // Remove caracteres não numéricos
    const numericText = text.replaceAll(/\D/g, "");

    // Cria uma cópia do código atual
    const newCode = [...code];

    // Se o usuário colou um código completo
    if (numericText.length > 1) {
      const digits = numericText.slice(0, 6).split("");

      // Preenche os inputs com os dígitos colados
      digits.forEach((digit, i) => {
        if (index + i < 6) {
          newCode[index + i] = digit;
        }
      });

      setCode(newCode);

      // Move o foco para o próximo input vazio ou último input
      const nextIndex = Math.min(index + digits.length, 5);
      inputRefs.current[nextIndex]?.focus();
      return;
    }

    // Atualiza o código com o novo dígito (digitação normal)
    newCode[index] = numericText;
    setCode(newCode);

    // Se digitou um número e não é o último input, vai para o próximo
    if (numericText && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Função para lidar com a tecla Backspace
  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === "Backspace" && !code[index] && index > 0) {
      // Se o campo está vazio e pressionar backspace, volta para o anterior
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Função para reenviar o código
  const handleResendCode = () => {
    setCode(["", "", "", "", "", ""]);
    inputRefs.current[0]?.focus();

    console.log("Código reenviado");
  };

  // Função para continuar (verificar o código)
  const handleContinue = () => {
    const fullCode = code.join("");
    if (fullCode.length === 6) {
      console.log("Código digitado:", fullCode);
    } else {
      alert("Por favor, digite o código completo");
    }
  };

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
            {code.map((digit, index) => (
              <TextInput
                key={index}
                ref={(ref) => {
                  inputRefs.current[index] = ref;
                }}
                value={digit}
                onChangeText={(text) => handleChangeText(text, index)}
                onKeyPress={(e) => handleKeyPress(e, index)}
                keyboardType="number-pad"
                maxLength={1} // Limita a um caractere
                className="w-12 h-14 border-2 border-gray-300 rounded-lg text-center text-xl font-bold"
                style={{ borderColor: digit ? "#6366f1" : "#d1d5db" }}
                selectTextOnFocus
                autoFocus={index === 0} // Foca no primeiro input ao carregar
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
            className={`py-4 rounded-lg items-center ${
              code.join("").length === 6 ? "bg-indigo-600" : "bg-gray-300"
            }`}
            onPress={handleContinue}
            disabled={code.join("").length !== 6}
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
