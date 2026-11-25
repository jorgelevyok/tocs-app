"use client";

/**
 * Tabs de Inicio, Historial y Ajustes. La barra es `TocsTabBar`:
 * el tab bar por defecto de Expo Router no se renderiza.
 * `headerShown: false` porque el título vive en `AppHeader`.
 */

import { Tabs } from "expo-router/js-tabs";

import { TocsTabBar } from "@/components/TocsTabBar";
import { useAppTheme } from "@/state/theme";

export default function TabsLayout() {
  const { colors } = useAppTheme();

  return (
    <Tabs
      tabBar={(props) => <TocsTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: colors.background },
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Inicio" }} />
      <Tabs.Screen name="historial" options={{ title: "Historial" }} />
      <Tabs.Screen name="ajustes" options={{ title: "Ajustes" }} />
    </Tabs>
  );
}
