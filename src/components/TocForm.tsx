"use client";

/**
 * Formulario compartido por el alta y la edición.
 * El nombre se recorta al enviar. Modo `image` sin URI no se puede guardar.
 * La cámara pide permiso antes de `launchCameraAsync`. Si se niega, el nombre
 * escrito se conserva y el error queda en el estado local del formulario.
 * `imagePersisted` viaja en el draft para que el almacenamiento no recopíe
 * una imagen que ya está en `tocs-covers`.
 */

import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { AppIcon } from "@/components/AppIcon";
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

  const chooseImage = async (source: "library" | "camera") => {
    setError(null);
    try {
      if (source === "camera") {
        const permission = await ImagePicker.requestCameraPermissionsAsync();
        if (!permission.granted) {
          setError("No se pudo usar la cámara.");
          return;
        }
      }
      const result =
        source === "camera"
          ? await ImagePicker.launchCameraAsync({ mediaTypes: ["images"], quality: 0.8 })
          : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images"], quality: 0.8 });
      if (result.canceled) return;
      const uri = result.assets[0]?.uri;
      if (!uri) return;
      setImageUri(uri);
      setImagePersisted(false);
      setMode("image");
    } catch {
      setError(source === "camera" ? "No se pudo usar la cámara." : "No se pudo abrir la galería.");
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
            <View>
              {[TOC_ICONS.slice(0, 3), TOC_ICONS.slice(3)].map((row) => (
                <View key={row.join("-")} style={styles.iconRow}>
                  {row.map((item) => {
                    const selected = item === icon;
                    return (
                      <View key={item} style={styles.iconCell}>
                        <Pressable
                          accessibilityRole="button"
                          accessibilityLabel={item}
                          accessibilityState={{ selected }}
                          testID={`icon-${item}`}
                          onPress={() => setIcon(item)}
                          style={[
                            styles.iconGlyph,
                            {
                              backgroundColor: selected ? colors.mint : colors.surface,
                              borderColor: selected ? colors.primary : colors.border,
                            },
                          ]}
                        >
                          <AppIcon name={item} color={colors.primary} size={28} />
                        </Pressable>
                      </View>
                    );
                  })}
                </View>
              ))}
            </View>
          </View>
        ) : null}
        {mode === "image" ? (
          <View style={styles.imageActions}>
            <ImageChoice
              icon="image"
              label="Elegir de la galería"
              onPress={() => void chooseImage("library")}
              testID="pick-image"
            />
            <ImageChoice icon="camera" label="Tomar foto" onPress={() => void chooseImage("camera")} testID="take-photo" />
          </View>
        ) : null}
        <View style={styles.block}>
          <Text style={[styles.blockTitle, { color: colors.text }]}>Vista previa</Text>
          <TocCard
            name={name.trim() || "Nombre del TOC"}
            appearance={mode === "image" && !imageUri ? { kind: "none" } : appearance}
            subtitle={subtitle}
          />
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

function ImageChoice({
  icon,
  label,
  onPress,
  testID,
}: {
  icon: "image" | "camera";
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
      style={({ pressed }) => [styles.imageChoice, { borderColor: colors.border, opacity: pressed ? 0.75 : 1 }]}
    >
      <AppIcon name={icon} color={colors.primary} size={18} />
      <Text style={[styles.imageChoiceLabel, { color: colors.text }]}>{label}</Text>
    </Pressable>
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
  iconRow: {
    flexDirection: "row",
  },
  iconCell: {
    flex: 1,
    aspectRatio: 1,
    padding: 6,
  },
  iconGlyph: {
    flex: 1,
    borderRadius: 18,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  imageActions: {
    flexDirection: "row",
    gap: 10,
  },
  imageChoice: {
    flex: 1,
    minHeight: 64,
    borderWidth: 1.5,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingHorizontal: 8,
    paddingVertical: 10,
  },
  imageChoiceLabel: {
    fontSize: 14,
    fontWeight: "700",
    textAlign: "center",
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
