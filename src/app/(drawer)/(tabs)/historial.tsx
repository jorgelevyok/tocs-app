"use client";

import { useMemo, useState } from "react";
import { Modal, Pressable, SectionList, StyleSheet, Text, View } from "react-native";

import { AppHeader, backToHome } from "@/components/AppHeader";
import { AppIcon } from "@/components/AppIcon";
import { HistoryRow } from "@/components/HistoryRow";
import { Illustration } from "@/components/Illustration";
import { Screen } from "@/components/Screen";
import { groupConfirmations } from "@/domain/history";
import { pushPath } from "@/lib/navigation";
import { useAppTheme } from "@/state/theme";
import { useTocs } from "@/state/tocs";

export default function HistoryScreen() {
  const { colors } = useAppTheme();
  const { tocs, confirmations, historyTocId, setHistoryTocId } = useTocs();
  const [open, setOpen] = useState(false);
  const selected = tocs.find((toc) => toc.id === historyTocId) ?? null;
  const groups = useMemo(
    () => groupConfirmations(confirmations, selected?.id ?? null),
    [confirmations, selected?.id],
  );
  const sections = useMemo(
    () => groups.map((group) => ({ title: group.label, key: group.key, data: group.items })),
    [groups],
  );

  return (
    <Screen testID="history-screen">
      <AppHeader
        mode="back"
        title="Historial"
        onBack={backToHome}
        right={
          selected
            ? { label: `Editar ${selected.name}`, onPress: () => pushPath(`/toc/editar/${selected.id}`), testID: "edit-toc" }
            : undefined
        }
      />
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        stickySectionHeadersEnabled={false}
        contentContainerStyle={styles.content}
        ListHeaderComponent={
          <View style={styles.filterRow}>
            <Illustration width={72} height={72} />
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Filtrar TOCs"
              onPress={() => setOpen(true)}
              testID="history-filter"
              style={[styles.chip, { backgroundColor: colors.mint }]}
            >
              <Text style={[styles.chipText, { color: colors.onMint }]} numberOfLines={1}>
                {selected?.name ?? "Todos los TOCs"}
              </Text>
              <AppIcon name="chevron" color={colors.onMint} size={18} />
            </Pressable>
          </View>
        }
        renderSectionHeader={({ section }) => (
          <View style={[styles.day, { backgroundColor: colors.mint }]}>
            <Text style={[styles.dayText, { color: colors.onMint }]}>{section.title}</Text>
          </View>
        )}
        renderItem={({ item }) => <HistoryRow confirmation={item} toc={tocs.find((toc) => toc.id === item.tocId)} />}
        ListEmptyComponent={
          <Text style={[styles.empty, { color: colors.textMuted }]}>
            {selected ? "Este TOC todavía no tiene registros." : "Todavía no hay registros."}
          </Text>
        }
      />
      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <View style={[styles.backdrop, { backgroundColor: colors.overlay }]}>
          <Pressable accessibilityLabel="Cerrar filtro" style={StyleSheet.absoluteFill} onPress={() => setOpen(false)} />
          <View style={[styles.menu, { backgroundColor: colors.surface }]}>
            <FilterOption
              label="Todos los TOCs"
              selected={!selected}
              onPress={() => {
                setHistoryTocId(null);
                setOpen(false);
              }}
            />
            {tocs.map((toc) => (
              <FilterOption
                key={toc.id}
                label={toc.name}
                selected={selected?.id === toc.id}
                onPress={() => {
                  setHistoryTocId(toc.id);
                  setOpen(false);
                }}
              />
            ))}
          </View>
        </View>
      </Modal>
    </Screen>
  );
}

function FilterOption({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  const { colors } = useAppTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={[styles.option, { backgroundColor: selected ? colors.mint : "transparent" }]}
    >
      <Text style={[styles.optionText, { color: colors.text }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    gap: 8,
  },
  filterRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 12,
  },
  chip: {
    flex: 1,
    minHeight: 48,
    borderRadius: 24,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  chipText: {
    flex: 1,
    fontSize: 15,
    fontWeight: "700",
  },
  day: {
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginTop: 8,
    marginBottom: 8,
  },
  dayText: {
    fontSize: 16,
    fontWeight: "800",
  },
  empty: {
    fontSize: 16,
    textAlign: "center",
    marginTop: 32,
  },
  backdrop: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
  },
  menu: {
    borderRadius: 20,
    padding: 8,
    gap: 4,
  },
  option: {
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  optionText: {
    fontSize: 16,
    fontWeight: "700",
  },
});
