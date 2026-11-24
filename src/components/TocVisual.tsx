"use client";

import { Image } from "expo-image";
import { StyleSheet, View } from "react-native";

import { AppIcon } from "@/components/AppIcon";
import type { TocAppearance } from "@/domain/types";
import { useAppTheme } from "@/state/theme";

type TocVisualProps = {
  appearance: TocAppearance;
  size: number;
};

export function TocVisual({ appearance, size }: TocVisualProps) {
  const { colors } = useAppTheme();
  const radius = Math.round(size * 0.28);

  if (appearance.kind === "image") {
    return (
      <Image
        source={{ uri: appearance.imageUri }}
        style={{ width: size, height: size, borderRadius: radius, backgroundColor: colors.mint }}
        contentFit="cover"
        accessibilityIgnoresInvertColors
      />
    );
  }

  return (
    <View
      style={[
        styles.placeholder,
        { width: size, height: size, borderRadius: radius, backgroundColor: colors.mint },
      ]}
    >
      {appearance.kind === "icon" ? <AppIcon name={appearance.icon} color={colors.onMint} size={size * 0.48} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  placeholder: {
    alignItems: "center",
    justifyContent: "center",
  },
});
