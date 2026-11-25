"use client";

/**
 * Edición. El `id` llega por la ruta `/toc/editar/[id]` (`useLocalSearchParams`).
 * Expo puede entregar el param como string o como array; se normaliza al primer valor.
 * `imagePersisted` queda en true si la apariencia ya es una imagen guardada,
 * para que `materializeAppearance` no vuelva a copiar el mismo archivo.
 * Si el id no está en memoria, se muestra el vacío sin crear un TOC nuevo.
 */

import { useLocalSearchParams } from "expo-router";
import { StyleSheet, Text } from "react-native";

import { AppHeader } from "@/components/AppHeader";
import { EditTocIllustration } from "@/components/Illustration";
import { Screen } from "@/components/Screen";
import { TocForm } from "@/components/TocForm";
import { formatConfirmationStamp } from "@/domain/dates";
import { latestConfirmation } from "@/domain/history";
import { goBack } from "@/lib/navigation";
import { useAppTheme } from "@/state/theme";
import { useTocs } from "@/state/tocs";

export default function EditTocScreen() {
  const { colors } = useAppTheme();
  const params = useLocalSearchParams<{ id: string }>();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const { tocs, confirmations, updateToc } = useTocs();
  const toc = tocs.find((item) => item.id === id);
  const latest = toc ? latestConfirmation(confirmations, toc.id) : undefined;
  const subtitle = latest ? formatConfirmationStamp(new Date(latest.at)) : "Sin registros";

  if (!toc) {
    return (
      <Screen edges={["top", "left", "right", "bottom"]}>
        <AppHeader mode="back" title="Editar TOC" accessory={<EditTocIllustration />} />
        <Text style={[styles.missing, { color: colors.text }]}>No se encontró este TOC.</Text>
      </Screen>
    );
  }

  return (
    <Screen edges={["top", "left", "right", "bottom"]} testID="edit-toc-screen">
      <AppHeader mode="back" title="Editar TOC" accessory={<EditTocIllustration />} />
      <TocForm
        initial={{
          name: toc.name,
          appearance: toc.appearance,
          imagePersisted: toc.appearance.kind === "image",
        }}
        subtitle={subtitle}
        submitLabel="Guardar cambios"
        onSubmit={async (draft) => {
          await updateToc(toc.id, draft);
          goBack();
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  missing: {
    padding: 24,
    fontSize: 16,
  },
});
