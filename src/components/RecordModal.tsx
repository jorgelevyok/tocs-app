"use client";

import {
  RecordingPresets,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  useAudioRecorder,
  useAudioRecorderState,
} from "expo-audio";
import * as ImagePicker from "expo-image-picker";
import { useEffect, useRef, useState } from "react";
import { Animated, BackHandler, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { AppIcon } from "@/components/AppIcon";
import { AudioClip } from "@/components/AudioClip";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { RecordIllustration } from "@/components/Illustration";
import { PhotoThumb } from "@/components/PhotoThumb";
import { PrimaryButton } from "@/components/PrimaryButton";
import { TextField } from "@/components/TextField";
import { TocVisual } from "@/components/TocVisual";
import { formatTime } from "@/domain/dates";
import type { Confirmation, TocAppearance } from "@/domain/types";
import { useAppTheme } from "@/state/theme";

type RecordModalProps = {
  confirmation: Confirmation;
  tocName: string;
  appearance: TocAppearance;
  onClose: () => void;
  onSave: (details: { note?: string; audioUri?: string; photoUri?: string }) => Promise<void>;
  onDeleteToc: () => void;
  onDeleteTocAndRecords: () => void;
};

export function RecordModal({
  confirmation,
  tocName,
  appearance,
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
              <RecordIllustration />
              <Text style={[styles.saved, { color: colors.text }]}>Registro guardado a las {time}</Text>
            </View>
            <View style={styles.nameRow}>
              <TocVisual appearance={appearance} size={56} />
              <Text style={[styles.name, { color: colors.text }]}>{tocName}</Text>
            </View>
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
                recording={recorderState.isRecording}
                onPress={() => void record()}
                testID="record-audio"
              />
              <ActionButton icon="image" label="Agregar foto" onPress={() => void pickPhoto()} testID="record-photo" />
            </View>
            {recorderState.isRecording ? <RecordingIndicator /> : null}
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
      <ConfirmDialog
        visible={confirmDelete}
        title={`¿Desea borrar "${tocName}"?`}
        testID="delete-toc-dialog"
        onClose={() => setConfirmDelete(false)}
        actions={[
          { label: "Borrar TOC", onPress: () => runDelete(false), testID: "delete-toc-only", danger: true },
          {
            label: "Borrar TOC y todos sus registros",
            onPress: () => runDelete(true),
            testID: "delete-toc-and-records",
            danger: true,
          },
          { label: "Cancelar", onPress: () => setConfirmDelete(false), testID: "delete-toc-cancel" },
        ]}
      />
    </View>
  );
}

function RecordingIndicator() {
  const { colors } = useAppTheme();
  const bars = useRef([new Animated.Value(0.35), new Animated.Value(0.35), new Animated.Value(0.35)]).current;

  useEffect(() => {
    const animations = bars.map((bar, index) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(index * 160),
          Animated.timing(bar, { toValue: 1, duration: 280, useNativeDriver: true }),
          Animated.timing(bar, { toValue: 0.35, duration: 280, useNativeDriver: true }),
        ]),
      ),
    );
    for (const animation of animations) animation.start();
    return () => {
      for (const animation of animations) animation.stop();
    };
  }, [bars]);

  return (
    <View style={styles.recording} accessibilityRole="text" accessibilityLiveRegion="polite" accessibilityLabel="Grabando audio">
      <View style={styles.bars}>
        {bars.map((bar, index) => (
          <Animated.View
            key={index}
            style={[styles.bar, { backgroundColor: colors.danger, transform: [{ scaleY: bar }] }]}
          />
        ))}
      </View>
      <Text style={[styles.recordingText, { color: colors.danger }]}>Grabando</Text>
    </View>
  );
}

function ActionButton({
  icon,
  label,
  onPress,
  testID,
  recording = false,
}: {
  icon: "mic" | "pause" | "image";
  label: string;
  onPress: () => void;
  testID: string;
  recording?: boolean;
}) {
  const { colors } = useAppTheme();
  const tone = recording ? colors.danger : colors.primary;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      testID={testID}
      style={({ pressed }) => [styles.action, { borderColor: recording ? colors.danger : colors.border, opacity: pressed ? 0.75 : 1 }]}
    >
      <AppIcon name={icon} color={tone} size={18} />
      <Text style={[styles.actionLabel, { color: recording ? colors.danger : colors.text }]}>{label}</Text>
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
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  name: {
    flex: 1,
    fontSize: 26,
    fontWeight: "800",
  },
  recording: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    minHeight: 28,
  },
  bars: {
    height: 18,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  bar: {
    width: 4,
    height: 18,
    borderRadius: 2,
  },
  recordingText: {
    fontSize: 15,
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
});
