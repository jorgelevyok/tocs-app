"use client";

import { useAudioPlayer, useAudioPlayerStatus } from "expo-audio";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { AppIcon } from "@/components/AppIcon";
import { useAppTheme } from "@/state/theme";

function formatDuration(seconds: number): string {
  const total = Math.max(0, Math.floor(seconds));
  const minutes = Math.floor(total / 60);
  const rest = total % 60;
  return `${minutes}:${String(rest).padStart(2, "0")}`;
}

type AudioClipProps = {
  uri: string;
  onRemove?: () => void;
};

export function AudioClip({ uri, onRemove }: AudioClipProps) {
  const { colors } = useAppTheme();
  const player = useAudioPlayer(uri);
  const status = useAudioPlayerStatus(player);
  const elapsed = status.playing || status.currentTime > 0 ? status.currentTime : status.duration;

  const toggle = () => {
    if (status.playing) {
      player.pause();
      return;
    }
    if (status.duration > 0 && status.currentTime >= status.duration - 0.05) {
      void player.seekTo(0);
    }
    player.play();
  };

  return (
    <View style={[styles.row, { backgroundColor: colors.mint }]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={status.playing ? "Pausar audio" : "Reproducir audio"}
        onPress={toggle}
        style={[styles.play, { backgroundColor: colors.primary }]}
      >
        <AppIcon name={status.playing ? "pause" : "play"} color={colors.onPrimary} size={16} />
      </Pressable>
      <View style={[styles.track, { backgroundColor: colors.surface }]}>
        <View
          style={[
            styles.fill,
            {
              backgroundColor: colors.primary,
              width: `${status.duration > 0 ? Math.min(100, (status.currentTime / status.duration) * 100) : 0}%`,
            },
          ]}
        />
      </View>
      <Text style={[styles.time, { color: colors.onMint }]}>{formatDuration(elapsed || 0)}</Text>
      {onRemove ? (
        <Pressable accessibilityRole="button" accessibilityLabel="Quitar audio" onPress={onRemove} hitSlop={8}>
          <AppIcon name="close" color={colors.onMint} size={18} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: 48,
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  play: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  track: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    overflow: "hidden",
  },
  fill: {
    height: "100%",
  },
  time: {
    fontSize: 13,
    fontWeight: "700",
    minWidth: 36,
  },
});
