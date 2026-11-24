"use client";

import { Image, type ImageSource } from "expo-image";
import { StyleSheet, View } from "react-native";

import { useAppTheme } from "@/state/theme";

type IllustrationProps = {
  width: number;
  height: number;
  source?: ImageSource | null;
  label?: string;
};

/**
 * Reserva el lugar de una ilustración. Si todavía no hay archivo, el espacio queda vacío:
 * no se importa una imagen inexistente ni se recorta un mockup.
 */
export function Illustration({ width, height, source, label }: IllustrationProps) {
  if (!source) {
    return <View accessibilityElementsHidden importantForAccessibility="no" style={{ width, height }} />;
  }

  return <Image source={source} style={{ width, height }} contentFit="contain" accessibilityLabel={label} />;
}

const lightLogo = require("../../assets/images/tocs-logo.png");
const darkLogo = require("../../assets/images/tocs-dark-logo.png");
const emptyLight = require("../../assets/images/empty-tocs.png");
const emptyDark = require("../../assets/images/empty-tocs-dark.png");

export function BrandLogo() {
  const { scheme } = useAppTheme();
  return (
    <Image
      source={scheme === "dark" ? darkLogo : lightLogo}
      style={styles.logo}
      contentFit="contain"
      accessibilityLabel="TOCs"
    />
  );
}

export function EmptyTocsIllustration() {
  const { scheme } = useAppTheme();
  return (
    <Illustration
      width={260}
      height={260}
      source={scheme === "dark" ? emptyDark : emptyLight}
      label="Sin TOCs cargados"
    />
  );
}

const styles = StyleSheet.create({
  logo: {
    width: 132,
    height: 44,
  },
});
