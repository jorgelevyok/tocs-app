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
