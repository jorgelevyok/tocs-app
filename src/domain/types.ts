/**
 * Modelo persistido. Un TOC es la plantilla (nombre + apariencia).
 * Una Confirmation es un registro con hora. La foto de la tarjeta
 * (`appearance.imageUri`) y la foto de un registro (`photoUri`) son archivos distintos.
 * `tocName` se copia al borrar el TOC para que el historial siga mostrando el nombre.
 * `imagePersisted` marca que el URI ya está en documentos y no hay que volver a copiarlo.
 */

export const TOC_ICONS = ["flame", "lock", "home", "water", "leaf", "check"] as const;

export type TocIconName = (typeof TOC_ICONS)[number];

/** La imagen de la tarjeta no es la foto de una confirmación. */
export type TocAppearance =
  | { kind: "icon"; icon: TocIconName }
  | { kind: "image"; imageUri: string }
  | { kind: "none" };

export type Toc = {
  id: string;
  name: string;
  appearance: TocAppearance;
  createdAt: string;
};

export type Confirmation = {
  id: string;
  tocId: string;
  /** Nombre guardado para que el historial siga legible si el TOC ya no existe. */
  tocName?: string;
  /** Instante local guardado como ISO. El día se calcula con el calendario del dispositivo. */
  at: string;
  note?: string;
  audioUri?: string;
  photoUri?: string;
};

export type StoredData = {
  tocs: Toc[];
  confirmations: Confirmation[];
};

export type AppearancePreference = "light" | "dark" | "system";

export type TocDraft = {
  name: string;
  appearance: TocAppearance;
  /** True cuando la imagen ya vive en el directorio de documentos. */
  imagePersisted?: boolean;
};
