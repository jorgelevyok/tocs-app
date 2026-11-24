"use client";

import { DrawerActions } from "@react-navigation/native";
import { useNavigation } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

import { AppIconButton, PlusButton } from "@/components/AppIcon";
import { BrandLogo } from "@/components/Illustration";
import { goBack, navigatePath } from "@/lib/navigation";
import { useAppTheme } from "@/state/theme";

function useOpenDrawer() {
  const navigation = useNavigation();
  return () => navigation.dispatch(DrawerActions.toggleDrawer());
}

type AppHeaderProps =
  | { mode: "home"; onAdd: () => void }
  | {
      mode: "back";
      title: string;
      onBack?: () => void;
      right?: { label: string; onPress: () => void; testID?: string };
    };

export function AppHeader(props: AppHeaderProps) {
  const { colors } = useAppTheme();
  const openDrawer = useOpenDrawer();

  if (props.mode === "home") {
    return (
      <View style={styles.home}>
        <AppIconButton icon="menu" label="Abrir menú" color={colors.primary} onPress={openDrawer} testID="open-drawer" />
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
      <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
        {props.title}
      </Text>
      {props.right ? (
        <AppIconButton
          icon="edit"
          label={props.right.label}
          color={colors.primary}
          onPress={props.right.onPress}
          testID={props.right.testID}
        />
      ) : (
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
    flex: 1,
    fontSize: 28,
    fontWeight: "800",
  },
  spacer: {
    width: 44,
  },
});
