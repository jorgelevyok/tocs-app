"use client";

/**
 * Contenido del Drawer. Cada ítem cierra el panel y hace `navigate`
 * a la pestaña: Inicio, Historial o Ajustes.
 */

import { DrawerContentScrollView, type DrawerContentComponentProps } from "expo-router/drawer";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AppIcon, type IconName } from "@/components/AppIcon";
import { BrandLogo } from "@/components/Illustration";
import { navigatePath } from "@/lib/navigation";
import { useAppTheme } from "@/state/theme";

export function AppDrawerContent(props: DrawerContentComponentProps) {
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();

  const go = (path: string) => {
    props.navigation.closeDrawer();
    navigatePath(path);
  };

  return (
    <DrawerContentScrollView
      {...props}
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 16 }]}
    >
      <BrandLogo />
      <Text style={[styles.caption, { color: colors.textMuted }]}>Registrá lo que ya hiciste</Text>
      <DrawerLink icon="home" label="Inicio" onPress={() => go("/")} testID="drawer-home" />
      <DrawerLink icon="history" label="Historial" onPress={() => go("/historial")} testID="drawer-history" />
      <DrawerLink icon="settings" label="Ajustes" onPress={() => go("/ajustes")} testID="drawer-settings" />
    </DrawerContentScrollView>
  );
}

function DrawerLink({
  icon,
  label,
  onPress,
  testID,
}: {
  icon: IconName;
  label: string;
  onPress: () => void;
  testID: string;
}) {
  const { colors } = useAppTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      testID={testID}
      style={({ pressed }) => [styles.link, { backgroundColor: pressed ? colors.mint : "transparent" }]}
    >
      <View style={[styles.iconWrap, { backgroundColor: colors.mint }]}>
        <AppIcon name={icon} color={colors.onMint} size={20} />
      </View>
      <Text style={[styles.linkLabel, { color: colors.text }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 20,
    gap: 8,
  },
  caption: {
    fontSize: 14,
    marginTop: 8,
    marginBottom: 12,
  },
  link: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 8,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  linkLabel: {
    fontSize: 16,
    fontWeight: "700",
  },
});
