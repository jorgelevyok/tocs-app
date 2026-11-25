/**
 * Archivos de la app. AsyncStorage guarda el URI, no el binario.
 * Destinos, todos bajo `Paths.document`:
 * `tocs-covers` imagen de la tarjeta, `tocs-photos` foto de un registro, `tocs-audio` la nota de voz.
 * `persistFile` copia y, si el origen está en `Paths.cache`, lo borra.
 * No borra un URI que ya vive en documentos: sería el archivo definitivo.
 */

import { Directory, File, Paths } from "expo-file-system";

import type { TocAppearance, TocDraft } from "./types";

function extensionOf(uri: string, fallback: string): string {
  const clean = uri.split("?")[0] ?? uri;
  const match = /\.([a-zA-Z0-9]{1,8})$/.exec(clean);
  return (match?.[1] ?? fallback).toLowerCase();
}

function folder(name: string): Directory {
  const directory = new Directory(Paths.document, name);
  if (!directory.exists) directory.create({ intermediates: true, idempotent: true });
  return directory;
}

export function deleteStored(uri: string | undefined): void {
  if (!uri) return;
  try {
    const file = new File(uri);
    if (file.exists) file.delete();
  } catch {
    // Si el archivo ya no está, la referencia se puede descartar igual.
  }
}

function isCacheCopy(uri: string): boolean {
  const cache = Paths.cache.uri;
  const base = cache.endsWith("/") ? cache : `${cache}/`;
  return uri.startsWith(base);
}

export async function persistFile(sourceUri: string, directoryName: string, filename: string): Promise<string> {
  const destination = new File(folder(directoryName), filename);
  if (destination.exists) destination.delete();
  const source = new File(sourceUri);
  await source.copy(destination);
  if (source.uri !== destination.uri && isCacheCopy(source.uri)) deleteStored(source.uri);
  return destination.uri;
}

export async function materializeAppearance(
  draft: TocDraft,
  tocId: string,
  previous?: TocAppearance,
): Promise<TocAppearance> {
  if (draft.appearance.kind !== "image") {
    if (previous?.kind === "image") deleteStored(previous.imageUri);
    return draft.appearance;
  }

  if (draft.imagePersisted) return draft.appearance;

  const extension = extensionOf(draft.appearance.imageUri, "jpg");
  const imageUri = await persistFile(draft.appearance.imageUri, "tocs-covers", `${tocId}.${extension}`);
  if (previous?.kind === "image" && previous.imageUri !== imageUri) deleteStored(previous.imageUri);
  return { kind: "image", imageUri };
}

export async function persistConfirmationMedia(
  confirmationId: string,
  audioSource: string | undefined,
  photoSource: string | undefined,
): Promise<{ audioUri?: string; photoUri?: string }> {
  const audioUri = audioSource
    ? await persistFile(audioSource, "tocs-audio", `${confirmationId}.${extensionOf(audioSource, "m4a")}`)
    : undefined;
  const photoUri = photoSource
    ? await persistFile(photoSource, "tocs-photos", `${confirmationId}.${extensionOf(photoSource, "jpg")}`)
    : undefined;
  return { audioUri, photoUri };
}
