"use client";

/**
 * Contenedor de pantalla. `edges` omite el borde inferior por defecto
 * para no sumar padding encima de la tab bar. `Card` es la superficie
 * con borde y radio usados por los bloques estáticos.
 */

import type { ReactNode } from "react";
import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import { SafeAreaView, type Edge } from "react-native-safe-area-context";

import { useAppTheme } from "@/state/theme";

type ScreenProps = {
  children: ReactNode;
  edges?: Edge[];
  testID?: string;
};

export function Screen({ children, edges = ["top", "left", "right"], testID = "screen-root" }: ScreenProps) {
  const { colors } = useAppTheme();
  return (
    <SafeAreaView testID={testID} edges={edges} style={[styles.screen, { backgroundColor: colors.background }]}>
      {children}
    </SafeAreaView>
  );
}

type CardProps = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
};

export function Card({ children, style }: CardProps) {
  const { colors } = useAppTheme();
  return <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  card: {
    borderWidth: 1,
    borderRadius: 22,
    padding: 14,
  },
});
