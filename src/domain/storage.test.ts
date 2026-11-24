import assert from "node:assert/strict";
import test from "node:test";

import { parseAppearance, parseStoredData, withoutConfirmation, withoutConfirmations, withoutToc } from "./storage";
import type { StoredData } from "./types";

const stored: StoredData = {
  tocs: [
    {
      id: "gas",
      name: "Cerré la llave de gas",
      appearance: { kind: "icon", icon: "flame" },
      createdAt: "2026-11-24T11:00:00.000Z",
    },
    {
      id: "puerta",
      name: "Cerré la puerta",
      appearance: { kind: "image", imageUri: "file:///covers/puerta.jpg" },
      createdAt: "2026-11-24T11:01:00.000Z",
    },
  ],
  confirmations: [
    {
      id: "c1",
      tocId: "gas",
      at: "2026-11-24T11:42:00.000Z",
      note: "Antes de salir",
      photoUri: "file:///photos/c1.jpg",
    },
  ],
};

test("lee TOCs, confirmaciones y apariencia", () => {
  const parsed = parseStoredData(JSON.stringify(stored));
  assert.equal(parsed?.tocs[1]?.appearance.kind, "image");
  assert.equal(parsed?.confirmations[0]?.photoUri, "file:///photos/c1.jpg");
  assert.equal(parseAppearance("dark"), "dark");
  assert.equal(parseAppearance("azul"), null);
});

test("un JSON inválido no se convierte en una lista vacía", () => {
  assert.equal(parseStoredData(null), null);
  assert.equal(parseStoredData("{"), null);
  assert.equal(parseStoredData(JSON.stringify({ tocs: "no" })), null);
});

test("deshacer quita solo la confirmación indicada", () => {
  const next = withoutConfirmation(
    {
      ...stored,
      confirmations: [
        ...stored.confirmations,
        { id: "c2", tocId: "gas", at: "2026-11-24T11:50:00.000Z" },
      ],
    },
    "c2",
  );
  assert.deepEqual(
    next.confirmations.map((item) => item.id),
    ["c1"],
  );
  assert.equal(next.tocs.length, 2);
});

test("borrar solo el TOC conserva sus registros con el nombre", () => {
  const next = withoutToc(stored, "gas");
  assert.deepEqual(
    next.tocs.map((toc) => toc.id),
    ["puerta"],
  );
  assert.equal(next.confirmations.length, 1);
  assert.equal(next.confirmations[0]?.tocName, "Cerré la llave de gas");
});

test("borrar un TOC y sus registros quita ambos", () => {
  const next = withoutToc(stored, "gas", { records: true });
  assert.deepEqual(
    next.tocs.map((toc) => toc.id),
    ["puerta"],
  );
  assert.equal(next.confirmations.length, 0);
});

test("borrar registros puede ser todos o solo los de un TOC", () => {
  const onlyGas = withoutConfirmations(stored, "gas");
  assert.equal(onlyGas.confirmations.length, 0);
  assert.equal(onlyGas.tocs.length, 2);
  assert.equal(withoutConfirmations(stored, null).confirmations.length, 0);
});
