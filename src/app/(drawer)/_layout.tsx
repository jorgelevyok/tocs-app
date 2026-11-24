"use client";

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
