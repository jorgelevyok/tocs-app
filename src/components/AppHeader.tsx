"use client";

/**
 * Encabezado propio. `mode: "home"` centra el logo, abre el Drawer a la
 * izquierda y deja el alta a la derecha. `mode: "back"` usa `goBack` salvo
 * que la pantalla pase `onBack` (las tabs vuelven a Inicio con `navigate`,
 * no desapilan).
 */

import { DrawerActions } from "@react-navigation/native";
import { useNavigation } from "expo-router";
import type { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";

import { AppIconButton, PlusButton } from "@/components/AppIcon";
import { BrandLogo } from "@/components/Illustration";
import { goBack, navigatePath } from "@/lib/navigation";
import { useAppTheme } from "@/state/theme";

type AppHeaderProps =
  | { mode: "home"; onAdd: () => void }
  | {
      mode: "back";
      title: string;
      onBack?: () => void;
      right?: { label: string; onPress: () => void; testID?: string };
      accessory?: ReactNode;
    };

export function AppHeader(props: AppHeaderProps) {
  const { colors } = useAppTheme();
  const navigation = useNavigation();

  if (props.mode === "home") {
    return (
      <View style={styles.home}>
        <AppIconButton
          icon="menu"
          label="Abrir menú"
          color={colors.primary}
          onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
          testID="open-drawer"
        />
        <View pointerEvents="none" style={styles.logoWrap}>
          <BrandLogo />
        </View>
        <PlusButton onPress={props.onAdd} />
      </View>
    );
  }

  return (
    <View style={styles.titleBar}>
      <AppIconButton
        icon="back"
        label="Volver"
        color={colors.primary}
        onPress={props.onBack ?? goBack}
        testID="go-back"
      />
      <Text style={[styles.title, { color: colors.text }, props.accessory ? styles.titleShrink : styles.titleFlex]} numberOfLines={1}>
        {props.title}
      </Text>
      {props.accessory ? <View style={styles.grow} /> : null}
      {props.accessory}
      {props.right ? (
        <AppIconButton
          icon="edit"
          label={props.right.label}
          color={colors.primary}
          onPress={props.right.onPress}
          testID={props.right.testID}
        />
      ) : props.accessory ? null : (
        <View style={styles.spacer} />
      )}
    </View>
  );
}

export function backToHome() {
  navigatePath("/");
}

const styles = StyleSheet.create({
  home: {
    height: 64,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  logoWrap: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
  },
  titleBar: {
    minHeight: 60,
    paddingHorizontal: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
  },
  titleShrink: {
    flexShrink: 1,
  },
  titleFlex: {
    flex: 1,
  },
  grow: {
    flex: 1,
  },
  spacer: {
    width: 44,
  },
});
