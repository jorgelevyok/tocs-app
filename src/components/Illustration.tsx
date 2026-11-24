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

export function BrandLogo() {
  const { scheme } = useAppTheme();
  return (
    <View style={[styles.logoPlate, scheme === "dark" && styles.logoPlateDark]}>
      <Image
        source={require("../../assets/images/tocs-logo.png")}
        style={styles.logo}
        contentFit="contain"
        accessibilityLabel="TOCs"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  logoPlate: {
    borderRadius: 14,
  },
  logoPlateDark: {
    backgroundColor: "#F8F8F5",
    paddingHorizontal: 8,
  },
  logo: {
    width: 132,
    height: 44,
  },
});
