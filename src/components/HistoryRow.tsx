"use client";

import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { AppIcon } from "@/components/AppIcon";
import { AudioClip } from "@/components/AudioClip";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { PhotoThumb } from "@/components/PhotoThumb";
import { TocVisual } from "@/components/TocVisual";
import { formatTime } from "@/domain/dates";
import type { Confirmation, Toc } from "@/domain/types";
import { useAppTheme } from "@/state/theme";

type HistoryRowProps = {
  confirmation: Confirmation;
  toc: Toc | undefined;
  onDelete: () => void;
};

export function HistoryRow({ confirmation, toc, onDelete }: HistoryRowProps) {
  const { colors } = useAppTheme();
  const [confirming, setConfirming] = useState(false);
  const time = formatTime(new Date(confirmation.at));
  const name = toc?.name ?? confirmation.tocName ?? "TOC";

  return (
    <View style={styles.row} testID={`history-${confirmation.id}`}>
      <View style={styles.rail}>
        <View style={[styles.dot, { backgroundColor: colors.primary }]} />
      </View>
      <View style={styles.body}>
        <View style={styles.heading}>
          {toc ? <TocVisual appearance={toc.appearance} size={36} /> : null}
          <View style={styles.copy}>
            <Text style={[styles.name, { color: colors.text }]}>{name}</Text>
            <Text style={[styles.time, { color: colors.textMuted }]}>{time}</Text>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Borrar registro de ${name}`}
            onPress={() => setConfirming(true)}
            hitSlop={8}
            testID={`delete-history-${confirmation.id}`}
            style={({ pressed }) => [styles.delete, { opacity: pressed ? 0.6 : 1 }]}
          >
            <AppIcon name="trash" color={colors.danger} size={20} />
          </Pressable>
        </View>
        {confirmation.note ? <Text style={[styles.note, { color: colors.text }]}>{confirmation.note}</Text> : null}
        {confirmation.audioUri ? <AudioClip uri={confirmation.audioUri} /> : null}
        {confirmation.photoUri ? <PhotoThumb uri={confirmation.photoUri} /> : null}
      </View>
      {confirming ? (
        <ConfirmDialog
          visible
          title={`¿Desea borrar el registro de "${name}" a las ${time}?`}
          testID={`delete-history-dialog-${confirmation.id}`}
          onClose={() => setConfirming(false)}
          actions={[
            {
              label: "Borrar registro",
              onPress: () => {
                setConfirming(false);
                onDelete();
              },
              testID: `confirm-delete-history-${confirmation.id}`,
              danger: true,
            },
            { label: "Cancelar", onPress: () => setConfirming(false), testID: `cancel-delete-history-${confirmation.id}` },
          ]}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: 10,
  },
  rail: {
    width: 16,
    alignItems: "center",
    paddingTop: 16,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  body: {
    flex: 1,
    gap: 8,
    paddingBottom: 16,
  },
  heading: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  copy: {
    flex: 1,
    gap: 2,
  },
  delete: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  name: {
    fontSize: 16,
    fontWeight: "700",
  },
  time: {
    fontSize: 13,
  },
  note: {
    fontSize: 15,
    lineHeight: 21,
  },
});
