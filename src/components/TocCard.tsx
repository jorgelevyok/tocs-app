"use client";

import { useRef } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { AppIcon } from "@/components/AppIcon";
import { TocVisual } from "@/components/TocVisual";
import type { TocAppearance } from "@/domain/types";
import { useAppTheme } from "@/state/theme";

type TocCardProps = {
  name: string;
  appearance: TocAppearance;
  subtitle: string;
  onRegister?: () => void;
  onRegisterWithDetails?: () => void;
  onOpenHistory?: () => void;
  testID?: string;
};

export function TocCard({
  name,
  appearance,
  subtitle,
  onRegister,
  onRegisterWithDetails,
  onOpenHistory,
  testID,
}: TocCardProps) {
  const { colors } = useAppTheme();
  const skipPress = useRef(false);
  const interactive = Boolean(onRegister);

  const body = (
    <>
      <TocVisual appearance={appearance} size={52} />
      <View style={styles.copy}>
        <Text style={[styles.name, { color: colors.text }]} numberOfLines={2}>
          {name}
        </Text>
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>{subtitle}</Text>
      </View>
    </>
  );

  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      {interactive ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${name}. ${subtitle}`}
          accessibilityHint="Tocá para registrar. Mantené presionado para agregar detalles."
          testID={testID}
          delayLongPress={450}
          onPressIn={() => {
            skipPress.current = false;
          }}
          onLongPress={() => {
            skipPress.current = true;
            onRegisterWithDetails?.();
          }}
          onPress={() => {
            if (skipPress.current) return;
            onRegister?.();
          }}
          style={({ pressed }) => [styles.main, pressed && styles.pressed]}
        >
          {body}
        </Pressable>
      ) : (
        <View style={styles.main}>{body}</View>
      )}
      {onOpenHistory ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Ver historial de ${name}`}
          testID={testID ? `${testID}-history` : undefined}
          onPress={onOpenHistory}
          style={({ pressed }) => [styles.clock, { borderColor: colors.primary, opacity: pressed ? 0.7 : 1 }]}
        >
          <AppIcon name="clock" color={colors.primary} size={20} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 22,
    paddingVertical: 12,
    paddingLeft: 12,
    paddingRight: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  main: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  pressed: {
    opacity: 0.75,
  },
  copy: {
    flex: 1,
    gap: 2,
  },
  name: {
    fontSize: 16,
    fontWeight: "700",
  },
  subtitle: {
    fontSize: 13,
  },
  clock: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
});
