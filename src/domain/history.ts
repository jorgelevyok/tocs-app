/**
 * Consultas puras sobre confirmaciones. No leen almacenamiento.
 * El orden de Inicio usa la confirmación más nueva; si no hay, `createdAt`.
 * El historial agrupa por clave `año-mes-día` local, de la más nueva a la más vieja.
 * `tocId` null deja todos los TOCs; un id filtra antes de agrupar.
 */

import { formatDayHeading } from "./dates";
import type { Confirmation, Toc } from "./types";

export type HistoryGroup = {
  key: string;
  label: string;
  items: Confirmation[];
};

/** La confirmación de mayor `at` para un TOC. La comparación es lexicográfica sobre ISO. */
export function latestConfirmation(confirmations: Confirmation[], tocId: string): Confirmation | undefined {
  return confirmations.reduce<Confirmation | undefined>((latest, item) => {
    if (item.tocId !== tocId) return latest;
    if (!latest || item.at > latest.at) return item;
    return latest;
  }, undefined);
}

/** Copia ordenada. No muta el array que viene del estado. */
export function sortTocsForHome(tocs: Toc[], confirmations: Confirmation[]): Toc[] {
  return tocs.slice().sort((a, b) => {
    const aTime = latestConfirmation(confirmations, a.id)?.at ?? "";
    const bTime = latestConfirmation(confirmations, b.id)?.at ?? "";
    if (aTime !== bTime) return aTime < bTime ? 1 : -1;
    return a.createdAt < b.createdAt ? 1 : -1;
  });
}

/** Confirmaciones del más reciente al más antiguo, agrupadas por día local. */
export function groupConfirmations(
  confirmations: Confirmation[],
  tocId: string | null,
  now: Date = new Date(),
): HistoryGroup[] {
  const filtered = confirmations
    .filter((item) => (tocId ? item.tocId === tocId : true))
    .slice()
    .sort((a, b) => (a.at < b.at ? 1 : a.at > b.at ? -1 : a.id < b.id ? 1 : -1));

  const groups: HistoryGroup[] = [];
  for (const item of filtered) {
    const date = new Date(item.at);
    const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
    const current = groups[groups.length - 1];
    if (!current || current.key !== key) {
      groups.push({ key, label: formatDayHeading(date, now), items: [item] });
    } else {
      current.items.push(item);
    }
  }
  return groups;
}
