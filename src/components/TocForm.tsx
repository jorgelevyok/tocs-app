"use client";

import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { AppIcon } from "@/components/AppIcon";
import { Illustration } from "@/components/Illustration";
import { PrimaryButton } from "@/components/PrimaryButton";
import { TextField } from "@/components/TextField";
import { TocCard } from "@/components/TocCard";
import { TOC_ICONS, type TocAppearance, type TocDraft, type TocIconName } from "@/domain/types";
import { useAppTheme } from "@/state/theme";

type TocFormProps = {
  initial?: TocDraft;
  subtitle: string;
  submitLabel: string;
  onSubmit: (draft: TocDraft) => Promise<void>;
};

type VisualMode = TocAppearance["kind"];

export function TocForm({ initial, subtitle, submitLabel, onSubmit }: TocFormProps) {
  const { colors } = useAppTheme();
  const [name, setName] = useState(initial?.name ?? "");
  const [mode, setMode] = useState<VisualMode>(initial?.appearance.kind ?? "icon");
  const [icon, setIcon] = useState<TocIconName>(initial?.appearance.kind === "icon" ? initial.appearance.icon : "flame");
  const [imageUri, setImageUri] = useState<string | null>(initial?.appearance.kind === "image" ? initial.appearance.imageUri : null);
  const [imagePersisted, setImagePersisted] = useState(Boolean(initial?.imagePersisted));
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const appearance: TocAppearance =
    mode === "image" && imageUri
      ? { kind: "image", imageUri }
      : mode === "none"
        ? { kind: "none" }
        : { kind: "icon", icon };

  const pickImage = async () => {
    setError(null);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        quality: 0.8,
      });
      if (result.canceled) return;
      const uri = result.assets[0]?.uri;
      if (!uri) return;
      setImageUri(uri);
      setImagePersisted(false);
      setMode("image");
    } catch {
      setError("No se pudo abrir la galería.");
    }
  };

  const submit = async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      setError("El nombre es obligatorio.");
      return;
    }
    if (mode === "image" && !imageUri) {
      setError("Elegí una imagen o cambiá la opción.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await onSubmit({
        name: trimmed,
        appearance: mode === "image" && imageUri ? { kind: "image", imageUri } : mode === "none" ? { kind: "none" } : { kind: "icon", icon },
        imagePersisted: mode === "image" ? imagePersisted : undefined,
      });
    } catch {
      setError("No se pudo guardar. Intentá de nuevo.");
      setSaving(false);
    }
  };

  return (
    <View style={styles.wrap}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <TextField
          label="Nombre del TOC"
          value={name}
          onChangeText={setName}
          placeholder="Cerré la llave de gas"
          testID="toc-name"
        />
        <View style={[styles.segment, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Segment label="Ícono" icon="check" selected={mode === "icon"} onPress={() => setMode("icon")} testID="mode-icon" />
          <Segment label="Imagen" icon="image" selected={mode === "image"} onPress={() => setMode("image")} testID="mode-image" />
          <Segment label="Sin imagen" icon="close" selected={mode === "none"} onPress={() => setMode("none")} testID="mode-none" />
        </View>
        {mode === "icon" ? (
          <View style={styles.block}>
            <Text style={[styles.blockTitle, { color: colors.text }]}>Elegí un ícono</Text>
            <View style={styles.grid}>
              {TOC_ICONS.map((item) => {
                const selected = item === icon;
                return (
                  <Pressable
                    key={item}
                    accessibilityRole="button"
                    accessibilityLabel={item}
                    accessibilityState={{ selected }}
                    testID={`icon-${item}`}
                    onPress={() => setIcon(item)}
                    style={[
                      styles.iconCell,
                      {
                        backgroundColor: selected ? colors.mint : colors.surface,
                        borderColor: selected ? colors.primary : colors.border,
                      },
                    ]}
                  >
                    <AppIcon name={item} color={colors.primary} size={26} />
                  </Pressable>
                );
              })}
            </View>
          </View>
        ) : null}
        {mode === "image" ? (
          <PrimaryButton label={imageUri ? "Cambiar imagen" : "Elegir de la galería"} onPress={() => void pickImage()} testID="pick-image" />
        ) : null}
        <View style={styles.block}>
          <Text style={[styles.blockTitle, { color: colors.text }]}>Vista previa</Text>
          <View style={styles.preview}>
            <View style={styles.previewCard}>
              <TocCard name={name.trim() || "Nombre del TOC"} appearance={mode === "image" && !imageUri ? { kind: "none" } : appearance} subtitle={subtitle} />
            </View>
            <Illustration width={78} height={78} />
          </View>
        </View>
        {error ? <Text style={[styles.error, { color: colors.danger }]}>{error}</Text> : null}
      </ScrollView>
      <View style={styles.footer}>
        <PrimaryButton
          label={saving ? "Guardando..." : submitLabel}
          onPress={() => void submit()}
          disabled={saving}
          testID="save-toc"
        />
      </View>
    </View>
  );
}

function Segment({
  label,
  icon,
  selected,
  onPress,
  testID,
}: {
  label: string;
  icon: "check" | "image" | "close";
  selected: boolean;
  onPress: () => void;
  testID: string;
}) {
  const { colors } = useAppTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      testID={testID}
      style={[styles.segmentItem, { backgroundColor: selected ? colors.mint : "transparent" }]}
    >
      <AppIcon name={icon} color={selected ? colors.onMint : colors.textMuted} size={16} />
      <Text style={[styles.segmentLabel, { color: selected ? colors.onMint : colors.textMuted }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 18,
  },
  segment: {
    flexDirection: "row",
    borderWidth: 1,
    borderRadius: 18,
    padding: 4,
    gap: 4,
  },
  segmentItem: {
    flex: 1,
    minHeight: 42,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 4,
  },
  segmentLabel: {
    fontSize: 13,
    fontWeight: "700",
  },
  block: {
    gap: 10,
  },
  blockTitle: {
    fontSize: 16,
    fontWeight: "700",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  iconCell: {
    width: "30%",
    aspectRatio: 1,
    maxWidth: 108,
    borderRadius: 18,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  preview: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  previewCard: {
    flex: 1,
  },
  error: {
    fontSize: 14,
    fontWeight: "600",
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
});
