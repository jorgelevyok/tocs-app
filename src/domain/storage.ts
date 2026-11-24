import { TOC_ICONS, type AppearancePreference, type Confirmation, type StoredData, type Toc, type TocAppearance, type TocIconName } from "./types";

export const STORAGE_KEYS = {
  data: "tocs.data.v1",
  appearance: "tocs.appearance.v1",
} as const;

function isIcon(value: unknown): value is TocIconName {
  return typeof value === "string" && TOC_ICONS.some((icon) => icon === value);
}

function isAppearance(value: unknown): value is TocAppearance {
  if (!value || typeof value !== "object") return false;
  const appearance = value as Partial<TocAppearance>;
  if (appearance.kind === "none") return true;
  if (appearance.kind === "icon") return isIcon(appearance.icon);
  if (appearance.kind === "image") return typeof appearance.imageUri === "string" && appearance.imageUri.length > 0;
  return false;
}

function isToc(value: unknown): value is Toc {
  if (!value || typeof value !== "object") return false;
  const toc = value as Partial<Toc>;
  return (
    typeof toc.id === "string" &&
    toc.id.length > 0 &&
    typeof toc.name === "string" &&
    toc.name.trim().length > 0 &&
    typeof toc.createdAt === "string" &&
    isAppearance(toc.appearance)
  );
}

function optionalText(value: unknown): string | undefined {
  return typeof value === "string" && value.trim().length > 0 ? value : undefined;
}

function isConfirmation(value: unknown): value is Confirmation {
  if (!value || typeof value !== "object") return false;
  const item = value as Partial<Confirmation>;
  if (typeof item.id !== "string" || item.id.length === 0) return false;
  if (typeof item.tocId !== "string" || item.tocId.length === 0) return false;
  if (typeof item.at !== "string" || !Number.isFinite(new Date(item.at).getTime())) return false;
  if (item.note !== undefined && typeof item.note !== "string") return false;
  if (item.audioUri !== undefined && typeof item.audioUri !== "string") return false;
  if (item.photoUri !== undefined && typeof item.photoUri !== "string") return false;
  if (item.tocName !== undefined && typeof item.tocName !== "string") return false;
  return true;
}

function cleanConfirmation(item: Confirmation): Confirmation {
  return {
    id: item.id,
    tocId: item.tocId,
    at: item.at,
    note: optionalText(item.note),
    audioUri: optionalText(item.audioUri),
    photoUri: optionalText(item.photoUri),
    tocName: optionalText(item.tocName),
  };
}

/** Devuelve null si no hay datos o si el JSON no tiene la forma esperada. */
export function parseStoredData(raw: string | null): StoredData | null {
  if (!raw) return null;

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }

  if (!parsed || typeof parsed !== "object") return null;
  const record = parsed as { tocs?: unknown; confirmations?: unknown };
  if (!Array.isArray(record.tocs) || !Array.isArray(record.confirmations)) return null;

  const seenTocs = new Set<string>();
  const tocs = record.tocs.filter((item): item is Toc => {
    if (!isToc(item) || seenTocs.has(item.id)) return false;
    seenTocs.add(item.id);
    return true;
  });

  const seenConfirmations = new Set<string>();
  const confirmations = record.confirmations.flatMap((item) => {
    if (!isConfirmation(item) || seenConfirmations.has(item.id)) return [];
    seenConfirmations.add(item.id);
    return [cleanConfirmation(item)];
  });

  return { tocs, confirmations };
}

export function parseAppearance(raw: string | null): AppearancePreference | null {
  if (raw === "light" || raw === "dark" || raw === "system") return raw;
  return null;
}

export function createId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export function createWriteQueue() {
  let chain: Promise<void> = Promise.resolve();
  return (task: () => Promise<void>) => {
    chain = chain.then(task).catch(() => undefined);
  };
}

export function withoutConfirmation(data: StoredData, id: string): StoredData {
  return {
    ...data,
    confirmations: data.confirmations.filter((item) => item.id !== id),
  };
}

export function withoutToc(data: StoredData, id: string, options?: { records?: boolean }): StoredData {
  const toc = data.tocs.find((item) => item.id === id);
  const tocs = data.tocs.filter((item) => item.id !== id);
  if (options?.records) {
    return {
      tocs,
      confirmations: data.confirmations.filter((item) => item.tocId !== id),
    };
  }
  return {
    tocs,
    confirmations: data.confirmations.map((item) =>
      item.tocId === id ? { ...item, tocName: toc?.name ?? item.tocName } : item,
    ),
  };
}

/** tocId null borra todos los registros. Un id borra solo los de ese TOC. */
export function withoutConfirmations(data: StoredData, tocId: string | null): StoredData {
  return {
    ...data,
    confirmations: tocId ? data.confirmations.filter((item) => item.tocId !== tocId) : [],
  };
}
