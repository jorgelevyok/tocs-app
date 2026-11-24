"use client";

import { useMemo, useState } from "react";
import { Modal, Pressable, SectionList, StyleSheet, Text, View } from "react-native";

import { AppHeader, backToHome } from "@/components/AppHeader";
import { AppIcon } from "@/components/AppIcon";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { HistoryRow } from "@/components/HistoryRow";
import { HistoryIllustration } from "@/components/Illustration";
import { Screen } from "@/components/Screen";
import { groupConfirmations } from "@/domain/history";
import { useAppTheme } from "@/state/theme";
import { useTocs } from "@/state/tocs";

export default function HistoryScreen() {
  const { colors } = useAppTheme();
  const { tocs, confirmations, historyTocId, setHistoryTocId, removeConfirmation, removeConfirmations, removeConfirmationsById } = useTocs();
  const [open, setOpen] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);
  const [confirmDay, setConfirmDay] = useState<{ title: string; ids: string[] } | null>(null);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const selected = tocs.find((toc) => toc.id === historyTocId) ?? null;
  const groups = useMemo(
    () => groupConfirmations(confirmations, selected?.id ?? null),
    [confirmations, selected?.id],
  );
  const sections = useMemo(
    () =>
      groups.map((group) => ({
        title: group.label,
        key: group.key,
        recordIds: group.items.map((item) => item.id),
        data: collapsed[group.key] ? [] : group.items,
      })),
    [groups, collapsed],
  );

  const toggleDay = (key: string) => {
    setCollapsed((current) => ({ ...current, [key]: !current[key] }));
  };
  const hasRecords = groups.some((group) => group.items.length > 0);

  return (
    <Screen testID="history-screen">
      <AppHeader mode="back" title="Historial" onBack={backToHome} />
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        stickySectionHeadersEnabled={false}
        extraData={collapsed}
        contentContainerStyle={styles.content}
        ListHeaderComponent={
          <View style={styles.header}>
            <View style={styles.filterRow}>
              <HistoryIllustration />
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Filtrar TOCs"
                onPress={() => {
                  setConfirmClear(false);
                  setOpen(true);
                }}
                testID="history-filter"
                style={[styles.chip, { backgroundColor: colors.mint }]}
              >
                <Text style={[styles.chipText, { color: colors.onMint }]} numberOfLines={1}>
                  {selected?.name ?? "Todos los TOCs"}
                </Text>
                <AppIcon name="chevron" color={colors.onMint} size={18} />
              </Pressable>
            </View>
            {selected && hasRecords ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Borrar todos los registros de ${selected.name}`}
                onPress={() => setConfirmClear(true)}
                testID="delete-all-records"
                style={({ pressed }) => [styles.clearAll, { opacity: pressed ? 0.7 : 1 }]}
              >
                <AppIcon name="trash" color={colors.danger} size={18} />
                <Text style={[styles.clearAllText, { color: colors.danger }]}>Borrar todos los registros</Text>
              </Pressable>
            ) : null}
          </View>
        }
        renderSectionHeader={({ section }) => {
          const isCollapsed = Boolean(collapsed[section.key]);
          return (
            <View style={[styles.day, { backgroundColor: colors.mint }]}>
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ expanded: !isCollapsed }}
                accessibilityLabel={isCollapsed ? `Mostrar ${section.title}` : `Ocultar ${section.title}`}
                onPress={() => toggleDay(section.key)}
                testID={`history-day-${section.key}`}
                style={styles.dayMain}
              >
                <Text style={[styles.dayText, { color: colors.onMint }]}>{section.title}</Text>
                <View style={{ transform: [{ rotate: isCollapsed ? "0deg" : "180deg" }] }}>
                  <AppIcon name="chevron" color={colors.onMint} size={20} />
                </View>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Borrar registros de ${section.title}`}
                onPress={() => setConfirmDay({ title: section.title, ids: section.recordIds })}
                hitSlop={6}
                testID={`delete-day-${section.key}`}
                style={({ pressed }) => [styles.dayDelete, { opacity: pressed ? 0.6 : 1 }]}
              >
                <AppIcon name="trash" color={colors.danger} size={18} />
              </Pressable>
            </View>
          );
        }}
        renderItem={({ item }) => (
          <HistoryRow
            confirmation={item}
            toc={tocs.find((toc) => toc.id === item.tocId)}
            onDelete={() => removeConfirmation(item.id)}
          />
        )}
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
      {selected ? (
        <ConfirmDialog
          visible={confirmClear}
          title={`¿Desea borrar los registros de "${selected.name}"?`}
          testID="delete-all-records-dialog"
          onClose={() => setConfirmClear(false)}
          actions={[
            {
              label: "Borrar todos los registros",
              onPress: () => {
                setConfirmClear(false);
                removeConfirmations(selected.id);
              },
              testID: "confirm-delete-all-records",
              danger: true,
            },
            { label: "Cancelar", onPress: () => setConfirmClear(false), testID: "cancel-delete-all-records" },
          ]}
        />
      ) : null}
      {confirmDay ? (
        <ConfirmDialog
          visible
          title={`¿Desea borrar los registros de ${confirmDay.title}?`}
          testID="delete-day-dialog"
          onClose={() => setConfirmDay(null)}
          actions={[
            {
              label: "Borrar registros del día",
              onPress: () => {
                removeConfirmationsById(confirmDay.ids);
                setConfirmDay(null);
              },
              testID: "confirm-delete-day",
              danger: true,
            },
            { label: "Cancelar", onPress: () => setConfirmDay(null), testID: "cancel-delete-day" },
          ]}
        />
      ) : null}
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
  header: {
    gap: 4,
    marginBottom: 12,
  },
  filterRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  clearAll: {
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  clearAllText: {
    fontSize: 15,
    fontWeight: "700",
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
    paddingLeft: 14,
    paddingRight: 8,
    paddingVertical: 6,
    marginTop: 8,
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  dayMain: {
    flex: 1,
    minHeight: 36,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  dayDelete: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  dayText: {
    flex: 1,
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
