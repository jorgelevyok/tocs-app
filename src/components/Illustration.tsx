"use client";

/**
 * Ilustraciones por pantalla. Cada export elige el PNG claro u oscuro
 * según `scheme`. Los archivos están en `assets/images/illustrations/<pantalla>/`.
 * El logo de marca está aparte, en `assets/images/logo/`.
 */

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

const lightLogo = require("../../assets/images/logo/light.png");
const darkLogo = require("../../assets/images/logo/dark.png");
const emptyLight = require("../../assets/images/illustrations/inicio/light.png");
const emptyDark = require("../../assets/images/illustrations/inicio/dark.png");
const deleteLight = require("../../assets/images/illustrations/borrar/light.png");
const deleteDark = require("../../assets/images/illustrations/borrar/dark.png");
const historyLight = require("../../assets/images/illustrations/historial/light.png");
const historyDark = require("../../assets/images/illustrations/historial/dark.png");
const detailLight = require("../../assets/images/illustrations/registro/light.png");
const detailDark = require("../../assets/images/illustrations/registro/dark.png");
const appearanceLight = require("../../assets/images/illustrations/ajustes/light.png");
const appearanceDark = require("../../assets/images/illustrations/ajustes/dark.png");
const newTocLight = require("../../assets/images/illustrations/nuevo/light.png");
const newTocDark = require("../../assets/images/illustrations/nuevo/dark.png");
const editTocLight = require("../../assets/images/illustrations/editar/light.png");
const editTocDark = require("../../assets/images/illustrations/editar/dark.png");

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

export function HistoryIllustration() {
  const { scheme } = useAppTheme();
  return (
    <Illustration
      width={96}
      height={96}
      source={scheme === "dark" ? historyDark : historyLight}
      label="Historial"
    />
  );
}

export function RecordIllustration() {
  const { scheme } = useAppTheme();
  return (
    <Illustration
      width={88}
      height={88}
      source={scheme === "dark" ? detailDark : detailLight}
      label="Registro guardado"
    />
  );
}

export function AppearanceIllustration() {
  const { scheme } = useAppTheme();
  return (
    <Image
      source={scheme === "dark" ? appearanceDark : appearanceLight}
      style={styles.fill}
      contentFit="contain"
      accessibilityLabel="Apariencia"
    />
  );
}

export function NewTocIllustration() {
  const { scheme } = useAppTheme();
  return (
    <Illustration
      width={92}
      height={92}
      source={scheme === "dark" ? newTocDark : newTocLight}
      label="Nuevo TOC"
    />
  );
}

export function EditTocIllustration() {
  const { scheme } = useAppTheme();
  return (
    <Illustration
      width={92}
      height={92}
      source={scheme === "dark" ? editTocDark : editTocLight}
      label="Editar TOC"
    />
  );
}

export function DeleteIllustration() {
  const { scheme } = useAppTheme();
  return (
    <Illustration
      width={180}
      height={180}
      source={scheme === "dark" ? deleteDark : deleteLight}
      label="Borrar TOC"
    />
  );
}

const styles = StyleSheet.create({
  logo: {
    width: 132,
    height: 44,
  },
  fill: {
    flex: 1,
    width: "100%",
  },
});
