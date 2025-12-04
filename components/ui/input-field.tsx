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
  animatedLabel?: boolean;
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
  animatedLabel = false,
  labelProps,
  inputProps,
}: Readonly<InputFieldProps>) {
  const hasValue = value.length > 0;
  const shouldShowLabel = animatedLabel ? hasValue : true;
  const placeholderText = animatedLabel && !hasValue ? label : placeholder;

  return (
    <View className="w-full gap-[10px]">
      {shouldShowLabel && (
        <Text
          className="mb-2 text-[16px] font-medium leading-[18px] text-gray-700"
          {...labelProps}
        >
          {label}
        </Text>
      )}

      <TextInput
        className="mb-2 rounded-lg border border-gray-300 bg-white px-4 py-3 text-lg text-gray-900"
        placeholder={placeholderText || label}
        placeholderTextColor="#999"
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        editable={editable}
        {...inputProps}
      />
    </View>
  );
}
