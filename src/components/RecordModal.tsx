"use client";

import {
  RecordingPresets,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  useAudioRecorder,
  useAudioRecorderState,
} from "expo-audio";
import * as ImagePicker from "expo-image-picker";
import { useEffect, useState } from "react";
import { BackHandler, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { AppIcon } from "@/components/AppIcon";
import { AudioClip } from "@/components/AudioClip";
import { Illustration } from "@/components/Illustration";
import { PhotoThumb } from "@/components/PhotoThumb";
import { PrimaryButton } from "@/components/PrimaryButton";
import { TextField } from "@/components/TextField";
import { formatTime } from "@/domain/dates";
import type { Confirmation } from "@/domain/types";
import { useAppTheme } from "@/state/theme";

type RecordModalProps = {
  confirmation: Confirmation;
  tocName: string;
  onClose: () => void;
  onSave: (details: { note?: string; audioUri?: string; photoUri?: string }) => Promise<void>;
};

export function RecordModal({ confirmation, tocName, onClose, onSave }: RecordModalProps) {
  const { colors } = useAppTheme();
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(recorder);
  const [note, setNote] = useState("");
  const [audioUri, setAudioUri] = useState<string | null>(null);
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const time = formatTime(new Date(confirmation.at));

  const close = () => {
    if (recorderState.isRecording) void recorder.stop();
    onClose();
  };

  useEffect(() => {
    const subscription = BackHandler.addEventListener("hardwareBackPress", () => {
      close();
      return true;
    });
    return () => subscription.remove();
  });

  const record = async () => {
    setMessage(null);
    try {
      if (recorderState.isRecording) {
        await recorder.stop();
        if (recorder.uri) setAudioUri(recorder.uri);
        await setAudioModeAsync({ allowsRecording: false, playsInSilentMode: true });
        return;
      }
      const permission = await requestRecordingPermissionsAsync();
      if (!permission.granted) {
        setMessage("No se pudo usar el micrófono. El registro se conserva.");
        return;
      }
      await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
      await recorder.prepareToRecordAsync();
      recorder.record();
    } catch {
      setMessage("No se pudo usar el micrófono. El registro se conserva.");
    }
  };

  const pickPhoto = async () => {
    setMessage(null);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        quality: 0.8,
      });
      if (result.canceled) return;
      const uri = result.assets[0]?.uri;
      if (uri) setPhotoUri(uri);
    } catch {
      setMessage("No se pudo abrir la galería. El registro se conserva.");
    }
  };

  const save = async () => {
    setSaving(true);
    setMessage(null);
    try {
      let nextAudio = audioUri;
      if (recorderState.isRecording) {
        await recorder.stop();
        nextAudio = recorder.uri ?? nextAudio;
      }
      await onSave({
        note,
        audioUri: nextAudio ?? undefined,
        photoUri: photoUri ?? undefined,
      });
    } catch {
      setMessage("No se pudieron guardar los detalles. El registro original sigue guardado.");
      setSaving(false);
    }
  };

  return (
    <View pointerEvents="box-none" style={[StyleSheet.absoluteFill, styles.overlay]} testID="record-modal">
      <Pressable accessibilityLabel="Cerrar sin guardar detalles" style={StyleSheet.absoluteFill} onPress={close} />
      <KeyboardAvoidingView
        pointerEvents="box-none"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.center}
      >
        <View style={[styles.sheet, { backgroundColor: colors.surface }]}>
          <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
            <View style={styles.titleRow}>
              <Illustration width={72} height={72} label="Registro guardado" />
              <Text style={[styles.saved, { color: colors.text }]}>Registro guardado a las {time}</Text>
            </View>
            <Text style={[styles.name, { color: colors.text }]}>{tocName}</Text>
            <TextField
              value={note}
              onChangeText={setNote}
              placeholder="Nota (opcional)"
              multiline
              testID="record-note"
            />
            <View style={styles.actions}>
              <ActionButton
                icon={recorderState.isRecording ? "pause" : "mic"}
                label={recorderState.isRecording ? "Detener" : "Grabar audio"}
                onPress={() => void record()}
                testID="record-audio"
              />
              <ActionButton icon="image" label="Agregar foto" onPress={() => void pickPhoto()} testID="record-photo" />
            </View>
            {audioUri ? <AudioClip uri={audioUri} onRemove={() => setAudioUri(null)} /> : null}
            {photoUri ? <PhotoThumb uri={photoUri} onRemove={() => setPhotoUri(null)} /> : null}
            {message ? <Text style={[styles.message, { color: colors.danger }]}>{message}</Text> : null}
          </ScrollView>
          <View style={styles.footer}>
            <PrimaryButton
              label={saving ? "Guardando..." : "Listo"}
              onPress={() => void save()}
              disabled={saving}
              testID="record-done"
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

function ActionButton({
  icon,
  label,
  onPress,
  testID,
}: {
  icon: "mic" | "pause" | "image";
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
      style={({ pressed }) => [styles.action, { borderColor: colors.border, opacity: pressed ? 0.75 : 1 }]}
    >
      <AppIcon name={icon} color={colors.primary} size={18} />
      <Text style={[styles.actionLabel, { color: colors.text }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  overlay: {
    backgroundColor: "rgba(22, 32, 30, 0.28)",
    justifyContent: "flex-end",
  },
  center: {
    flex: 1,
    justifyContent: "flex-end",
    padding: 12,
  },
  sheet: {
    maxHeight: "92%",
    borderRadius: 28,
    overflow: "hidden",
  },
  content: {
    padding: 18,
    gap: 14,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  saved: {
    flex: 1,
    fontSize: 16,
    fontWeight: "700",
  },
  name: {
    fontSize: 26,
    fontWeight: "800",
  },
  actions: {
    flexDirection: "row",
    gap: 10,
  },
  action: {
    flex: 1,
    minHeight: 48,
    borderWidth: 1.5,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingHorizontal: 8,
  },
  actionLabel: {
    fontSize: 14,
    fontWeight: "700",
  },
  message: {
    fontSize: 14,
    fontWeight: "600",
  },
  footer: {
    paddingHorizontal: 18,
    paddingBottom: 18,
  },
});
