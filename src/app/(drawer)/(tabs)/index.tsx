"use client";

import { useMemo, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";

import { AppHeader } from "@/components/AppHeader";
import { AppIcon } from "@/components/AppIcon";
import { EmptyTocsIllustration } from "@/components/Illustration";
import { PrimaryButton } from "@/components/PrimaryButton";
import { RecordModal } from "@/components/RecordModal";
import { Screen } from "@/components/Screen";
import { TocCard } from "@/components/TocCard";
import { formatConfirmationStamp } from "@/domain/dates";
import { latestConfirmation, sortTocsForHome } from "@/domain/history";
import { navigatePath, pushPath } from "@/lib/navigation";
import { useAppTheme } from "@/state/theme";
import { useTocs } from "@/state/tocs";
import type { Confirmation } from "@/domain/types";

export default function HomeScreen() {
  const { colors } = useAppTheme();
  const { tocs, confirmations, register, removeConfirmation, removeToc, saveDetails, setHistoryTocId } = useTocs();
  const [undoId, setUndoId] = useState<string | null>(null);
  const [pending, setPending] = useState<Confirmation | null>(null);

  const items = useMemo(() => sortTocsForHome(tocs, confirmations), [tocs, confirmations]);
  const pendingToc = pending ? tocs.find((toc) => toc.id === pending.tocId) : undefined;

  const openHistory = (tocId: string) => {
    setHistoryTocId(tocId);
    navigatePath("/historial");
  };

  return (
    <Screen testID="home-screen">
      <AppHeader mode="home" onAdd={() => pushPath("/toc/nuevo")} />
      {items.length === 0 ? (
        <View style={styles.empty}>
          <EmptyTocsIllustration />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>No hay TOCs cargados</Text>
          <PrimaryButton label="Crear mi primer TOC" onPress={() => pushPath("/toc/nuevo")} testID="create-first-toc" />
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          ListHeaderComponent={
            <View style={[styles.hint, { backgroundColor: colors.mint }]}>
              <AppIcon name="clock" color={colors.onMint} size={18} />
              <Text style={[styles.hintText, { color: colors.onMint }]}>Mantené presionado para agregar detalles</Text>
            </View>
          }
          renderItem={({ item }) => {
            const latest = latestConfirmation(confirmations, item.id);
            const subtitle = latest ? formatConfirmationStamp(new Date(latest.at)) : "Sin registros";
            return (
              <TocCard
                name={item.name}
                appearance={item.appearance}
                subtitle={subtitle}
                testID={`toc-card-${item.id}`}
                onRegister={() => {
                  const confirmation = register(item.id);
                  setPending(null);
                  setUndoId(confirmation.id);
                }}
                onRegisterWithDetails={() => {
                  const confirmation = register(item.id);
                  setUndoId(null);
                  setPending(confirmation);
                }}
                onOpenHistory={() => openHistory(item.id)}
              />
            );
          }}
        />
      )}
      {undoId ? (
        <View style={styles.undo} testID="undo-snackbar">
          <AppIcon name="checkCircle" color="#FFFFFF" size={22} />
          <Text style={styles.undoText}>Registro guardado</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Deshacer"
            onPress={() => {
              removeConfirmation(undoId);
              setUndoId(null);
            }}
            testID="undo-action"
          >
            <Text style={styles.undoAction}>Deshacer</Text>
          </Pressable>
        </View>
      ) : null}
      {pending && pendingToc ? (
        <RecordModal
          confirmation={pending}
          tocName={pendingToc.name}
          onClose={() => setPending(null)}
          onSave={async (details) => {
            await saveDetails(pending.id, details);
            setPending(null);
          }}
          onDeleteToc={() => {
            const tocId = pending.tocId;
            removeToc(tocId);
            setPending(null);
            setUndoId((current) => {
              if (!current) return null;
              const confirmation = confirmations.find((item) => item.id === current);
              return confirmation?.tocId === tocId ? null : current;
            });
          }}
        />
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 28,
    gap: 18,
  },
  emptyTitle: {
    fontSize: 28,
    fontWeight: "800",
    textAlign: "center",
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 96,
    gap: 12,
  },
  hint: {
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  hintText: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
  },
  undo: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 16,
    minHeight: 56,
    borderRadius: 18,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#006B5B",
  },
  undoText: {
    flex: 1,
    fontSize: 15,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  undoAction: {
    fontSize: 15,
    fontWeight: "800",
    color: "#DDF1E9",
  },
});
