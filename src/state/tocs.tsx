"use client";

/**
 * Estado de TOCs y confirmaciones. `stateRef` es la fuente para las
 * mutaciones: `setState` es asíncrono y dos toques seguidos leerían
 * el mismo snapshot si se usara solo el estado de React.
 * `commit` actualiza la ref, pinta y encola `setItem` de `tocs.data.v1`.
 * El primer render no escribe: `ready` pasa a true recién después de leer.
 * `historyTocId` no se persiste; es el filtro de la tab Historial.
 */

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { deleteStored, materializeAppearance, persistConfirmationMedia } from "@/domain/media";
import {
  createId,
  createWriteQueue,
  parseStoredData,
  STORAGE_KEYS,
  withoutConfirmation,
  withoutConfirmations,
  withoutIds,
  withoutToc,
} from "@/domain/storage";
import type { Confirmation, StoredData, Toc, TocDraft } from "@/domain/types";

const EMPTY: StoredData = { tocs: [], confirmations: [] };

type TocsContextValue = {
  ready: boolean;
  tocs: Toc[];
  confirmations: Confirmation[];
  historyTocId: string | null;
  setHistoryTocId: (tocId: string | null) => void;
  register: (tocId: string) => Confirmation;
  removeConfirmation: (id: string) => void;
  removeConfirmations: (tocId: string | null) => void;
  removeConfirmationsById: (ids: string[]) => void;
  removeToc: (id: string, options?: { records?: boolean }) => void;
  saveDetails: (id: string, details: { note?: string; audioUri?: string; photoUri?: string }) => Promise<void>;
  addToc: (draft: TocDraft) => Promise<void>;
  updateToc: (id: string, draft: TocDraft) => Promise<void>;
};

const TocsContext = createContext<TocsContextValue | null>(null);

export function TocsProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<StoredData>(EMPTY);
  const [ready, setReady] = useState(false);
  const [historyTocId, setHistoryTocId] = useState<string | null>(null);
  const stateRef = useRef(state);
  const enqueue = useRef(createWriteQueue()).current;

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEYS.data);
        const parsed = parseStoredData(raw);
        if (active && parsed) {
          stateRef.current = parsed;
          setState(parsed);
        }
      } catch {
        // No se escribe el estado vacío si la lectura falla.
      } finally {
        if (active) setReady(true);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  /** Aplica una función pura al estado actual y persiste el resultado. */
  const commit = useCallback(
    (recipe: (current: StoredData) => StoredData) => {
      const next = recipe(stateRef.current);
      stateRef.current = next;
      setState(next);
      enqueue(() => AsyncStorage.setItem(STORAGE_KEYS.data, JSON.stringify(next)));
    },
    [enqueue],
  );

  /** Crea una confirmación solo con hora. La nota y los archivos entran después, en `saveDetails`. */
  const register = useCallback(
    (tocId: string) => {
      const confirmation: Confirmation = {
        id: createId(),
        tocId,
        at: new Date().toISOString(),
      };
      commit((current) => ({ ...current, confirmations: [confirmation, ...current.confirmations] }));
      return confirmation;
    },
    [commit],
  );

  const removeConfirmation = useCallback(
    (id: string) => {
      const current = stateRef.current.confirmations.find((item) => item.id === id);
      deleteStored(current?.audioUri);
      deleteStored(current?.photoUri);
      commit((data) => withoutConfirmation(data, id));
    },
    [commit],
  );

  const removeConfirmations = useCallback(
    (tocId: string | null) => {
      for (const confirmation of stateRef.current.confirmations) {
        if (tocId && confirmation.tocId !== tocId) continue;
        deleteStored(confirmation.audioUri);
        deleteStored(confirmation.photoUri);
      }
      commit((data) => withoutConfirmations(data, tocId));
    },
    [commit],
  );

  const removeConfirmationsById = useCallback(
    (ids: string[]) => {
      const drop = new Set(ids);
      for (const confirmation of stateRef.current.confirmations) {
        if (!drop.has(confirmation.id)) continue;
        deleteStored(confirmation.audioUri);
        deleteStored(confirmation.photoUri);
      }
      commit((data) => withoutIds(data, ids));
    },
    [commit],
  );

  /** Borra el TOC. Con `records: true` también saca sus confirmaciones y los archivos. Sin esa opción, la confirmación queda y se le copia el nombre. */
  const removeToc = useCallback(
    (id: string, options?: { records?: boolean }) => {
      const current = stateRef.current;
      const toc = current.tocs.find((item) => item.id === id);
      if (toc?.appearance.kind === "image") deleteStored(toc.appearance.imageUri);
      if (options?.records) {
        for (const confirmation of current.confirmations) {
          if (confirmation.tocId !== id) continue;
          deleteStored(confirmation.audioUri);
          deleteStored(confirmation.photoUri);
        }
      }
      setHistoryTocId((selected) => (selected === id ? null : selected));
      commit((data) => withoutToc(data, id, options));
    },
    [commit],
  );

  /** Copia audio y foto a documentos y escribe la nota en la confirmación existente. No crea otra. */
  const saveDetails = useCallback(
    async (id: string, details: { note?: string; audioUri?: string; photoUri?: string }) => {
      const media = await persistConfirmationMedia(id, details.audioUri, details.photoUri);
      const note = details.note?.trim();
      commit((current) => ({
        ...current,
        confirmations: current.confirmations.map((item) =>
          item.id === id
            ? {
                ...item,
                note: note ? note : undefined,
                audioUri: media.audioUri,
                photoUri: media.photoUri,
              }
            : item,
        ),
      }));
    },
    [commit],
  );

  /** Alta. Primero materializa la imagen de portada y después inserta el TOC. */
  const addToc = useCallback(
    async (draft: TocDraft) => {
      const id = createId();
      const appearance = await materializeAppearance(draft, id);
      const toc: Toc = {
        id,
        name: draft.name.trim(),
        appearance,
        createdAt: new Date().toISOString(),
      };
      commit((current) => ({ ...current, tocs: [toc, ...current.tocs] }));
    },
    [commit],
  );

  /** Edición. Conserva `id` y las confirmaciones. Si cambia la portada, borra el archivo anterior. */
  const updateToc = useCallback(
    async (id: string, draft: TocDraft) => {
      const previous = stateRef.current.tocs.find((toc) => toc.id === id);
      if (!previous) return;
      const appearance = await materializeAppearance(draft, id, previous.appearance);
      commit((current) => ({
        ...current,
        tocs: current.tocs.map((toc) => (toc.id === id ? { ...toc, name: draft.name.trim(), appearance } : toc)),
      }));
    },
    [commit],
  );

  const value = useMemo(
    () => ({
      ready,
      tocs: state.tocs,
      confirmations: state.confirmations,
      historyTocId,
      setHistoryTocId,
      register,
      removeConfirmation,
      removeConfirmations,
      removeConfirmationsById,
      removeToc,
      saveDetails,
      addToc,
      updateToc,
    }),
    [ready, state, historyTocId, register, removeConfirmation, removeConfirmations, removeConfirmationsById, removeToc, saveDetails, addToc, updateToc],
  );

  return <TocsContext.Provider value={value}>{children}</TocsContext.Provider>;
}

export function useTocs() {
  const value = useContext(TocsContext);
  if (!value) throw new Error("useTocs tiene que usarse dentro de TocsProvider");
  return value;
}
