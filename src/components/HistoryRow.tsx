"use client";

import { StyleSheet, Text, View } from "react-native";

import { AudioClip } from "@/components/AudioClip";
import { PhotoThumb } from "@/components/PhotoThumb";
import { TocVisual } from "@/components/TocVisual";
import { formatTime } from "@/domain/dates";
import type { Confirmation, Toc } from "@/domain/types";
import { useAppTheme } from "@/state/theme";

type HistoryRowProps = {
  confirmation: Confirmation;
  toc: Toc | undefined;
};

export function HistoryRow({ confirmation, toc }: HistoryRowProps) {
  const { colors } = useAppTheme();
  const time = formatTime(new Date(confirmation.at));

  return (
    <View style={styles.row} testID={`history-${confirmation.id}`}>
      <View style={styles.rail}>
        <View style={[styles.dot, { backgroundColor: colors.primary }]} />
      </View>
      <View style={styles.body}>
        <View style={styles.heading}>
          {toc ? <TocVisual appearance={toc.appearance} size={36} /> : null}
          <View style={styles.copy}>
            <Text style={[styles.name, { color: colors.text }]}>{toc?.name ?? "TOC"}</Text>
            <Text style={[styles.time, { color: colors.textMuted }]}>{time}</Text>
          </View>
        </View>
        {confirmation.note ? <Text style={[styles.note, { color: colors.text }]}>{confirmation.note}</Text> : null}
        {confirmation.audioUri ? <AudioClip uri={confirmation.audioUri} /> : null}
        {confirmation.photoUri ? <PhotoThumb uri={confirmation.photoUri} /> : null}
      </View>
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
