import React from "react";
import { Text, TextInput, TextInputProps, TextProps, View } from "react-native";

interface InputFieldProps {
  label: string;
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  keyboardType?:
    | "default"
    | "email-address"
    | "numeric"
    | "phone-pad"
    | "decimal-pad";
  editable?: boolean;
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  labelProps?: TextProps;
  inputProps?: TextInputProps;
}

export default function InputField({
  label,
  placeholder,
  value,
  onChangeText,
  secureTextEntry = false,
  keyboardType = "default",
  editable = true,
  autoCapitalize = "sentences",
  labelProps,
  inputProps,
}: Readonly<InputFieldProps>) {
  return (
    <View className="w-full gap-[10px]">
      <Text
        className="mb-2 font-inter-semibold text-[16px] leading-[18px] text-gray-700"
        {...labelProps}
      >
        {label}
      </Text>

      <TextInput
        className="mb-2 rounded-lg border border-gray-300 bg-white px-4 py-3 font-mulish-medium text-lg text-gray-900"
        placeholder={placeholder ?? label}
        placeholderTextColor="#999"
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        editable={editable}
        autoCapitalize={autoCapitalize}
        {...inputProps}
      />
    </View>
  );
}
