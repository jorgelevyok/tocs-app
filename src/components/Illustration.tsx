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
const deleteLight = require("../../assets/images/delete.png");
const deleteDark = require("../../assets/images/delete-dark.png");
const historyLight = require("../../assets/images/history.png");
const historyDark = require("../../assets/images/history-dark.png");
const detailLight = require("../../assets/images/toc-detail.png");
const detailDark = require("../../assets/images/toc-detail-dark.png");
const appearanceLight = require("../../assets/images/appearance.png");
const appearanceDark = require("../../assets/images/appearance-dark.png");
const newTocLight = require("../../assets/images/new-toc.png");
const newTocDark = require("../../assets/images/new-toc-dark.png");
const editTocLight = require("../../assets/images/edit-toc.png");
const editTocDark = require("../../assets/images/edit-toc-dark.png");

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
