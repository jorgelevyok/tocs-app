/**
 * Atajos sobre el router de Expo. Los paths se castean a `Href`
 * porque las rutas tipadas no aceptan un string armado en runtime.
 *
 * `push` apila una pantalla (Nuevo y Editar). `navigate` cambia de tab
 * sin duplicar la ruta si ya está en el historial. `goBack` vuelve al
 * Stack anterior y, si no hay historial, cae en Inicio.
 */

import { router, type Href } from "expo-router";

function asHref(path: string): Href {
  return path as Href;
}

export function pushPath(path: string) {
  router.push(asHref(path));
}

export function navigatePath(path: string) {
  router.navigate(asHref(path));
}

export function goBack() {
  if (router.canGoBack()) router.back();
  else navigatePath("/");
}
