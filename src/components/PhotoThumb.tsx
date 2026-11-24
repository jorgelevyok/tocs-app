"use client";

import { Image } from "expo-image";
import { useState } from "react";
import { Modal, Pressable, StyleSheet, View } from "react-native";

import { AppIcon } from "@/components/AppIcon";
import { useAppTheme } from "@/state/theme";

type PhotoThumbProps = {
  uri: string;
  onRemove?: () => void;
};

export function PhotoThumb({ uri, onRemove }: PhotoThumbProps) {
  const { colors } = useAppTheme();
  const [open, setOpen] = useState(false);

  return (
    <>
      <View>
        <Pressable accessibilityRole="imagebutton" accessibilityLabel="Ver foto" onPress={() => setOpen(true)}>
          <Image source={{ uri }} style={styles.thumb} contentFit="cover" />
        </Pressable>
        {onRemove ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Quitar foto"
            onPress={onRemove}
            style={[styles.remove, { backgroundColor: colors.surface }]}
          >
            <AppIcon name="close" color={colors.text} size={14} />
          </Pressable>
        ) : null}
      </View>
      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={[styles.lightbox, { backgroundColor: colors.overlay }]} onPress={() => setOpen(false)}>
          <Image source={{ uri }} style={styles.full} contentFit="contain" />
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  thumb: {
    width: "100%",
    height: 150,
    borderRadius: 16,
  },
  remove: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  lightbox: {
    flex: 1,
    justifyContent: "center",
    padding: 16,
  },
  full: {
    width: "100%",
    height: "80%",
  },
});
