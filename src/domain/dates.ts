const DAY_MS = 86_400_000;

function capitalize(value: string): string {
  if (!value) return value;
  return value.charAt(0).toLocaleUpperCase("es-AR") + value.slice(1);
}

function startOfLocalDay(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}

/** Días locales entre `now` y `date`. No usa toISOString: en Argentina eso corre el día. */
export function localDayDiff(now: Date, date: Date): number {
  return Math.round((startOfLocalDay(now) - startOfLocalDay(date)) / DAY_MS);
}

export function formatTime(date: Date): string {
  return new Intl.DateTimeFormat("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  })
    .format(date)
    .replace(/\s/g, "");
}

/** Encabezado de historial, por ejemplo "Hoy, 24 de noviembre". */
export function formatDayHeading(date: Date, now: Date = new Date()): string {
  const day = new Intl.DateTimeFormat("es-AR", { day: "numeric", month: "long" }).format(date);
  const diff = localDayDiff(now, date);
  if (diff === 0) return `Hoy, ${day}`;
  if (diff === 1) return `Ayer, ${day}`;
  const weekday = new Intl.DateTimeFormat("es-AR", { weekday: "long" }).format(date);
  return `${capitalize(weekday)}, ${day}`;
}

/** Fecha corta de la tarjeta, por ejemplo "Hoy, 08:42:15". */
export function formatConfirmationStamp(date: Date, now: Date = new Date()): string {
  const time = formatTime(date);
  const diff = localDayDiff(now, date);
  if (diff === 0) return `Hoy, ${time}`;
  if (diff === 1) return `Ayer, ${time}`;
  const weekday = capitalize(new Intl.DateTimeFormat("es-AR", { weekday: "short" }).format(date).replace(".", ""));
  const day = new Intl.DateTimeFormat("es-AR", { day: "numeric", month: "short" }).format(date).replace(".", "");
  return `${weekday} ${day}, ${time}`;
}
