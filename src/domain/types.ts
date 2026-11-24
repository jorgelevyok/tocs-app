/** Datos que TOCs guarda en el dispositivo. */

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
