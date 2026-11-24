"use client";

import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { AppHeader, backToHome } from "@/components/AppHeader";
import { Illustration } from "@/components/Illustration";
import { Screen } from "@/components/Screen";
import type { AppearancePreference } from "@/domain/types";
import { useAppTheme } from "@/state/theme";

const OPTIONS: { value: AppearancePreference; label: string }[] = [
  { value: "light", label: "Claro" },
  { value: "dark", label: "Oscuro" },
  { value: "system", label: "Sistema" },
];

export default function SettingsScreen() {
  const { colors, preference, setPreference } = useAppTheme();

  return (
    <Screen testID="settings-screen">
      <AppHeader mode="back" title="Ajustes" onBack={backToHome} />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.section, { color: colors.text }]}>Apariencia</Text>
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {OPTIONS.map((option) => {
            const selected = preference === option.value;
            return (
              <Pressable
                key={option.value}
                accessibilityRole="radio"
                accessibilityState={{ checked: selected }}
                accessibilityLabel={option.label}
                testID={`appearance-${option.value}`}
                onPress={() => setPreference(option.value)}
                style={[styles.option, { backgroundColor: selected ? colors.selected : "transparent" }]}
              >
                <View style={[styles.radio, { borderColor: selected ? colors.primary : colors.textMuted }]}>
                  {selected ? <View style={[styles.dot, { backgroundColor: colors.primary }]} /> : null}
                </View>
                <Text style={[styles.optionLabel, { color: colors.text }]}>{option.label}</Text>
              </Pressable>
            );
          })}
        </View>
        <View style={styles.mascot}>
          <Illustration width={220} height={180} />
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    flexGrow: 1,
  },
  section: {
    fontSize: 22,
    fontWeight: "800",
    marginBottom: 12,
  },
  card: {
    borderWidth: 1.5,
    borderRadius: 22,
    overflow: "hidden",
  },
  option: {
    minHeight: 58,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  optionLabel: {
    fontSize: 17,
    fontWeight: "600",
  },
  mascot: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 24,
  },
});
