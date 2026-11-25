"use client";

/**
 * `TextInput` controlado. El valor vive en el padre (`value` / `onChangeText`).
 * El color de placeholder sale del tema; el borde pasa a `danger` si hay `error`.
 */

import { StyleSheet, Text, TextInput, View, type TextInputProps } from "react-native";

import { useAppTheme } from "@/state/theme";

type TextFieldProps = {
  label?: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  error?: string;
  multiline?: boolean;
  testID?: string;
} & Pick<TextInputProps, "autoCapitalize" | "autoFocus">;

export function TextField({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  multiline = false,
  testID,
  autoCapitalize = "sentences",
  autoFocus,
}: TextFieldProps) {
  const { colors } = useAppTheme();
  return (
    <View style={styles.wrap}>
      {label ? <Text style={[styles.label, { color: colors.text }]}>{label}</Text> : null}
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        multiline={multiline}
        autoCapitalize={autoCapitalize}
        autoFocus={autoFocus}
        testID={testID}
        style={[
          styles.input,
          multiline && styles.multiline,
          {
            color: colors.text,
            backgroundColor: colors.surface,
            borderColor: error ? colors.danger : colors.border,
          },
        ]}
      />
      {error ? <Text style={[styles.error, { color: colors.danger }]}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: "700",
  },
  input: {
    minHeight: 52,
    borderWidth: 1.5,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  multiline: {
    minHeight: 88,
    textAlignVertical: "top",
  },
  error: {
    fontSize: 13,
    fontWeight: "600",
  },
});
