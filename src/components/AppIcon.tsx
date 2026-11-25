"use client";

/**
 * Íconos. En iOS se usa SF Symbols (`SymbolView`). En Android se carga
 * Material Symbols y se dibuja el glifo por el codepoint de `ANDROID`.
 * `AppIconButton` y `PlusButton` son los controles de 44 px del encabezado.
 */

import { loadAsync } from "expo-font";
import { MaterialSymbols_400Regular } from "@expo-google-fonts/material-symbols/400Regular";
import { SymbolView, type SymbolViewProps } from "expo-symbols";
import { useEffect, useState } from "react";
import { Platform, Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from "react-native";

import type { TocIconName } from "@/domain/types";
import { useAppTheme } from "@/state/theme";

export type IconName =
  | TocIconName
  | "menu"
  | "add"
  | "back"
  | "history"
  | "settings"
  | "clock"
  | "mic"
  | "image"
  | "camera"
  | "play"
  | "pause"
  | "close"
  | "edit"
  | "chevron"
  | "checkCircle"
  | "trash";

const ICONS: Record<IconName, { ios: string; android: string }> = {
  menu: { ios: "line.3.horizontal", android: "menu" },
  add: { ios: "plus", android: "add" },
  back: { ios: "chevron.left", android: "arrow_back" },
  home: { ios: "house.fill", android: "home" },
  history: { ios: "clock.arrow.circlepath", android: "history" },
  settings: { ios: "gearshape.fill", android: "settings" },
  clock: { ios: "clock", android: "schedule" },
  flame: { ios: "flame.fill", android: "local_fire_department" },
  lock: { ios: "lock.fill", android: "lock" },
  water: { ios: "drop.fill", android: "water_drop" },
  leaf: { ios: "leaf.fill", android: "eco" },
  check: { ios: "checkmark", android: "check" },
  mic: { ios: "mic.fill", android: "mic" },
  image: { ios: "photo", android: "image" },
  camera: { ios: "camera.fill", android: "photo_camera" },
  play: { ios: "play.fill", android: "play_arrow" },
  pause: { ios: "pause.fill", android: "pause" },
  close: { ios: "xmark", android: "close" },
  edit: { ios: "pencil", android: "edit" },
  chevron: { ios: "chevron.down", android: "expand_more" },
  checkCircle: { ios: "checkmark.circle.fill", android: "check_circle" },
  trash: { ios: "trash", android: "delete" },
};

type AppIconProps = {
  name: IconName;
  color: string;
  size?: number;
};

const MATERIAL_FONT = "MaterialSymbols_400Regular";

const MATERIAL_GLYPHS: Record<string, number> = {
  menu: 58834,
  add: 57669,
  arrow_back: 58820,
  home: 59530,
  history: 59529,
  settings: 59576,
  schedule: 59573,
  local_fire_department: 61269,
  lock: 59543,
  water_drop: 59288,
  eco: 59957,
  check: 58826,
  mic: 57385,
  image: 58356,
  photo_camera: 58386,
  play_arrow: 57399,
  pause: 57396,
  close: 58829,
  edit: 58313,
  expand_more: 58831,
  check_circle: 59500,
  delete: 59506,
};

let materialFont: Promise<void> | null = null;

function loadMaterialFont() {
  materialFont ??= loadAsync({ [MATERIAL_FONT]: MaterialSymbols_400Regular }).then(() => undefined);
  return materialFont;
}

export function AppIcon({ name, color, size = 24 }: AppIconProps) {
  const spec = ICONS[name];
  const [ready, setReady] = useState(Platform.OS === "ios");

  useEffect(() => {
    if (Platform.OS === "ios") return;
    let active = true;
    loadMaterialFont()
      .then(() => {
        if (active) setReady(true);
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, []);

  if (Platform.OS === "ios") {
    return (
      <SymbolView
        name={{ ios: spec.ios, android: spec.android, web: spec.android } as unknown as SymbolViewProps["name"]}
        tintColor={color}
        size={size}
      />
    );
  }

  const glyph = MATERIAL_GLYPHS[spec.android];
  if (!ready || glyph === undefined) {
    return <View style={{ width: size, height: size }} />;
  }

  return (
    <Text
      style={{
        width: size,
        height: size,
        fontFamily: MATERIAL_FONT,
        fontSize: size,
        lineHeight: size,
        color,
        textAlign: "center",
        textAlignVertical: "center",
        includeFontPadding: false,
      }}
    >
      {String.fromCharCode(glyph)}
    </Text>
  );
}

type AppIconButtonProps = {
  icon: IconName;
  label: string;
  color: string;
  onPress: () => void;
  testID?: string;
  style?: StyleProp<ViewStyle>;
};

export function AppIconButton({ icon, label, color, onPress, testID, style }: AppIconButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      hitSlop={8}
      testID={testID}
      style={({ pressed }) => [styles.button, style, pressed && styles.pressed]}
    >
      <AppIcon name={icon} color={color} />
    </Pressable>
  );
}

export function PlusButton({ onPress }: { onPress: () => void }) {
  const { colors } = useAppTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Nuevo TOC"
      onPress={onPress}
      testID="new-toc"
      style={({ pressed }) => [styles.plus, { backgroundColor: colors.primary, opacity: pressed ? 0.85 : 1 }]}
    >
      <AppIcon name="add" color={colors.onPrimary} size={26} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 22,
  },
  pressed: {
    opacity: 0.6,
  },
  plus: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
});
