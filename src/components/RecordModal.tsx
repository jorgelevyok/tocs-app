"use client";

import {
  RecordingPresets,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  useAudioRecorder,
  useAudioRecorderState,
} from "expo-audio";
import * as ImagePicker from "expo-image-picker";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { BackHandler, Dimensions, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { AppIcon } from "@/components/AppIcon";
import { AudioClip } from "@/components/AudioClip";
import { DeleteIllustration, Illustration } from "@/components/Illustration";
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
  onDeleteToc: () => void;
  onDeleteTocAndRecords: () => void;
};

export function RecordModal({
  confirmation,
  tocName,
  onClose,
  onSave,
  onDeleteToc,
  onDeleteTocAndRecords,
}: RecordModalProps) {
  const { colors } = useAppTheme();
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(recorder);
  const [note, setNote] = useState("");
  const [audioUri, setAudioUri] = useState<string | null>(null);
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const time = formatTime(new Date(confirmation.at));

  const close = () => {
    if (recorderState.isRecording) void recorder.stop();
    onClose();
  };

  useEffect(() => {
    const subscription = BackHandler.addEventListener("hardwareBackPress", () => {
      if (confirmDelete) {
        setConfirmDelete(false);
        return true;
      }
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

  const runDelete = (records: boolean) => {
    if (recorderState.isRecording) void recorder.stop();
    if (records) onDeleteTocAndRecords();
    else onDeleteToc();
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
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Borrar ${tocName}`}
              disabled={saving}
              onPress={() => setConfirmDelete(true)}
              testID="delete-toc"
              style={({ pressed }) => [styles.delete, { opacity: saving ? 0.5 : pressed ? 0.7 : 1 }]}
            >
              <AppIcon name="trash" color={colors.danger} size={18} />
              <Text style={[styles.deleteLabel, { color: colors.danger }]}>Borrar TOC</Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
      <Modal
        visible={confirmDelete}
        transparent
        animationType="fade"
        statusBarTranslucent
        navigationBarTranslucent
        presentationStyle="overFullScreen"
        onRequestClose={() => setConfirmDelete(false)}
      >
        <StatusBar hidden />
        <View style={[styles.confirmOverlay, { width: Dimensions.get("screen").width, height: Dimensions.get("screen").height }]}>
          <Pressable
            accessibilityLabel="Cancelar"
            style={StyleSheet.absoluteFill}
            onPress={() => setConfirmDelete(false)}
          />
          <View style={[styles.confirmCard, { backgroundColor: colors.surface }]} testID="delete-toc-dialog">
            <DeleteIllustration />
            <Text style={[styles.confirmTitle, { color: colors.text }]}>¿Desea borrar "{tocName}"?</Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Borrar TOC"
              onPress={() => runDelete(false)}
              testID="delete-toc-only"
              style={({ pressed }) => [styles.choice, { borderColor: colors.border, opacity: pressed ? 0.7 : 1 }]}
            >
              <Text style={[styles.choiceLabel, { color: colors.danger }]}>Borrar TOC</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Borrar TOC y todos sus registros"
              onPress={() => runDelete(true)}
              testID="delete-toc-and-records"
              style={({ pressed }) => [styles.choice, { borderColor: colors.border, opacity: pressed ? 0.7 : 1 }]}
            >
              <Text style={[styles.choiceLabel, { color: colors.danger }]}>Borrar TOC y todos sus registros</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Cancelar"
              onPress={() => setConfirmDelete(false)}
              testID="delete-toc-cancel"
              style={({ pressed }) => [styles.choice, { borderColor: colors.border, opacity: pressed ? 0.7 : 1 }]}
            >
              <Text style={[styles.choiceLabel, { color: colors.text }]}>Cancelar</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
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
    gap: 8,
  },
  delete: {
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  deleteLabel: {
    fontSize: 16,
    fontWeight: "700",
  },
  confirmOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    backgroundColor: "rgba(22, 32, 30, 0.55)",
    justifyContent: "center",
    padding: 24,
  },
  confirmCard: {
    borderRadius: 24,
    padding: 20,
    alignItems: "center",
    gap: 12,
    zIndex: 21,
    elevation: 21,
  },
  confirmTitle: {
    fontSize: 20,
    fontWeight: "800",
    textAlign: "center",
  },
  choice: {
    alignSelf: "stretch",
    minHeight: 48,
    borderWidth: 1.5,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  choiceLabel: {
    fontSize: 16,
    fontWeight: "700",
    textAlign: "center",
  },
});
