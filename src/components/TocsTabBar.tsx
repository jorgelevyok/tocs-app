"use client";

/**
 * Barra inferior. `navigateToTab` viene de `expo-router/js-tabs` y cambia
 * la ruta sin apilar. El icono sale del nombre de archivo de la tab.
 */

import type { BottomTabBarProps } from "expo-router/js-tabs";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { AppIcon, type IconName } from "@/components/AppIcon";
import { useAppTheme } from "@/state/theme";

const ICONS: Record<string, IconName> = {
  index: "home",
  historial: "history",
  ajustes: "settings",
};

export function TocsTabBar({ state, descriptors, navigateToTab, insets }: BottomTabBarProps) {
  const { colors } = useAppTheme();

  return (
    <View
      style={[
        styles.bar,
        {
          backgroundColor: colors.background,
          borderTopColor: colors.border,
          paddingBottom: Math.max(insets.bottom, 10),
        },
      ]}
    >
      {state.routes.map((route, index) => {
        const focused = state.index === index;
        const options = descriptors[route.key]?.options;
        const label = options?.title ?? route.name;
        const icon = ICONS[route.name] ?? "home";
        return (
          <Pressable
            key={route.key}
            accessibilityRole="tab"
            accessibilityState={{ selected: focused }}
            accessibilityLabel={label}
            testID={`tab-${route.name}`}
            onPress={() => navigateToTab(route.key)}
            style={[styles.item, focused && { backgroundColor: colors.mint }]}
          >
            <AppIcon name={icon} color={focused ? colors.onMint : colors.tabInactive} size={22} />
            <Text style={[styles.label, { color: focused ? colors.onMint : colors.tabInactive }]}>{label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: 8,
    paddingHorizontal: 12,
  },
  item: {
    minWidth: 96,
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 18,
  },
  label: {
    fontSize: 12,
    fontWeight: "700",
  },
});
