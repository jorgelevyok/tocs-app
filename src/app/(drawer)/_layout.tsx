"use client";

/**
 * Drawer que envuelve las tabs. Se abre con el botón de menú de Inicio
 * y con el gesto desde el borde izquierdo. El header nativo no se usa;
 * cada pantalla dibuja el suyo.
 */

import { Drawer } from "expo-router/drawer";

import { AppDrawerContent } from "@/components/AppDrawerContent";
import { useAppTheme } from "@/state/theme";

export default function DrawerLayout() {
  const { colors } = useAppTheme();

  return (
    <Drawer
      drawerContent={(props) => <AppDrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerStyle: { backgroundColor: colors.background, width: 300 },
        overlayColor: colors.overlay,
        swipeEnabled: true,
      }}
    >
      <Drawer.Screen name="(tabs)" options={{ title: "Inicio" }} />
    </Drawer>
  );
}
