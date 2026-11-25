"use client";

/**
 * Diálogo modal de confirmación. Cubre la pantalla con el tamaño físico
 * (`Dimensions.get("screen")`) porque el overlay del `Modal` transparente
 * no hereda el alto de la ventana segura. `onRequestClose` es el atrás de Android.
 * La ilustración por defecto es la de borrar.
 */

import { StatusBar } from "expo-status-bar";
import { Dimensions, Modal, Pressable, StyleSheet, Text, View } from "react-native";

import { DeleteIllustration } from "@/components/Illustration";
import { useAppTheme } from "@/state/theme";

type ConfirmAction = {
  label: string;
  onPress: () => void;
  testID: string;
  danger?: boolean;
  accessibilityLabel?: string;
};

type ConfirmDialogProps = {
  visible: boolean;
  title: string;
  testID: string;
  onClose: () => void;
  actions: ConfirmAction[];
};

export function ConfirmDialog({ visible, title, testID, onClose, actions }: ConfirmDialogProps) {
  const { colors } = useAppTheme();
  const screen = Dimensions.get("screen");

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      navigationBarTranslucent
      presentationStyle="overFullScreen"
      onRequestClose={onClose}
    >
      {visible ? <StatusBar hidden /> : null}
      <View style={[styles.overlay, { width: screen.width, height: screen.height }]}>
        <Pressable accessibilityLabel="Cancelar" style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={[styles.card, { backgroundColor: colors.surface }]} testID={testID}>
          <DeleteIllustration />
          <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
          {actions.map((action) => (
            <Pressable
              key={action.testID}
              accessibilityRole="button"
              accessibilityLabel={action.accessibilityLabel ?? action.label}
              onPress={action.onPress}
              testID={action.testID}
              style={({ pressed }) => [styles.choice, { borderColor: colors.border, opacity: pressed ? 0.7 : 1 }]}
            >
              <Text style={[styles.choiceLabel, { color: action.danger ? colors.danger : colors.text }]}>{action.label}</Text>
            </Pressable>
          ))}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    backgroundColor: "rgba(22, 32, 30, 0.55)",
    justifyContent: "center",
    padding: 24,
  },
  card: {
    borderRadius: 24,
    padding: 20,
    alignItems: "center",
    gap: 12,
    zIndex: 21,
    elevation: 21,
  },
  title: {
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
