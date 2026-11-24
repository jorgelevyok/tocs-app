import assert from "node:assert/strict";
import test from "node:test";

import { formatConfirmationStamp, formatDayHeading, formatTime } from "./dates";
import { groupConfirmations, latestConfirmation } from "./history";
import type { Confirmation } from "./types";

const now = new Date(2026, 10, 24, 12, 0, 0);

function confirmation(partial: Partial<Confirmation> & Pick<Confirmation, "id" | "at">): Confirmation {
  return { tocId: "gas", ...partial };
}

test("la hora local se muestra en 24 horas", () => {
  assert.equal(formatTime(new Date(2026, 10, 24, 8, 42)), "08:42");
});

test("hoy y ayer usan el calendario local", () => {
  assert.equal(formatDayHeading(new Date(2026, 10, 24, 8, 42), now), "Hoy, 24 de noviembre");
  assert.equal(formatDayHeading(new Date(2026, 10, 23, 21, 10), now), "Ayer, 23 de noviembre");
  assert.match(formatDayHeading(new Date(2026, 10, 22, 9, 15), now), /22 de noviembre/);
  assert.equal(formatConfirmationStamp(new Date(2026, 10, 24, 8, 36), now), "Hoy, 08:36");
});

test("dos confirmaciones del mismo TOC el mismo día quedan separadas y la más nueva va primero", () => {
  const items = [
    confirmation({ id: "a", at: new Date(2026, 10, 24, 8, 20).toISOString() }),
    confirmation({ id: "b", at: new Date(2026, 10, 24, 8, 42).toISOString() }),
    confirmation({ id: "c", tocId: "puerta", at: new Date(2026, 10, 23, 21, 10).toISOString() }),
  ];
  const groups = groupConfirmations(items, null, now);
  assert.equal(groups.length, 2);
  assert.equal(groups[0]?.label, "Hoy, 24 de noviembre");
  assert.deepEqual(
    groups[0]?.items.map((item) => item.id),
    ["b", "a"],
  );
  assert.deepEqual(
    groups[1]?.items.map((item) => item.id),
    ["c"],
  );
  assert.equal(latestConfirmation(items, "gas")?.id, "b");
});

test("el filtro deja solo el TOC elegido", () => {
  const items = [
    confirmation({ id: "a", at: new Date(2026, 10, 24, 8, 42).toISOString() }),
    confirmation({ id: "c", tocId: "puerta", at: new Date(2026, 10, 24, 8, 36).toISOString() }),
  ];
  const groups = groupConfirmations(items, "puerta", now);
  assert.equal(groups[0]?.items.length, 1);
  assert.equal(groups[0]?.items[0]?.id, "c");
});
