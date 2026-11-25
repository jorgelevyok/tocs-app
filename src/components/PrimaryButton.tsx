"use client";

/**
 * Botón de acción principal. El fondo es `colors.primary` y el texto `onPrimary`.
 * `disabled` baja la opacidad y bloquea `onPress`.
 */

import { Pressable, StyleSheet, Text } from "react-native";

import { AppIcon, type IconName } from "@/components/AppIcon";
import { useAppTheme } from "@/state/theme";

type PrimaryButtonProps = {
  label: string;
  onPress: () => void;
  icon?: IconName;
  disabled?: boolean;
  testID?: string;
};

export function PrimaryButton({ label, onPress, icon, disabled = false, testID }: PrimaryButtonProps) {
  const { colors } = useAppTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      testID={testID}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: colors.primary, opacity: disabled ? 0.5 : pressed ? 0.88 : 1 },
      ]}
    >
      {icon ? <AppIcon name={icon} color={colors.onPrimary} size={20} /> : null}
      <Text style={[styles.label, { color: colors.onPrimary }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 54,
    borderRadius: 28,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  label: {
    fontSize: 17,
    fontWeight: "700",
  },
});
