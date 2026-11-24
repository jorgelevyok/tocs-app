"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useColorScheme } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { createWriteQueue, parseAppearance, STORAGE_KEYS } from "@/domain/storage";
import type { AppearancePreference } from "@/domain/types";

export type AppColors = {
  background: string;
  surface: string;
  text: string;
  textMuted: string;
  primary: string;
  onPrimary: string;
  mint: string;
  onMint: string;
  border: string;
  danger: string;
  overlay: string;
  tabInactive: string;
  selected: string;
};

export const lightColors: AppColors = {
  background: "#F8F8F5",
  surface: "#FFFFFF",
  text: "#16201E",
  textMuted: "#5E6E69",
  primary: "#006B5B",
  onPrimary: "#FFFFFF",
  mint: "#DDF1E9",
  onMint: "#006B5B",
  border: "#E3E8E4",
  danger: "#8E3B3B",
  overlay: "rgba(22, 32, 30, 0.45)",
  tabInactive: "#7B8C86",
  selected: "#DDF1E9",
};

export const darkColors: AppColors = {
  background: "#111C1A",
  surface: "#1A2825",
  text: "#F4F7F5",
  textMuted: "#A9BBB4",
  primary: "#1F8F78",
  onPrimary: "#FFFFFF",
  mint: "#1A3F36",
  onMint: "#E7F6F1",
  border: "#2C3D38",
  danger: "#F0B4B4",
  overlay: "rgba(0, 0, 0, 0.62)",
  tabInactive: "#8FA39C",
  selected: "#16362F",
};

type ThemeContextValue = {
  ready: boolean;
  preference: AppearancePreference;
  scheme: "light" | "dark";
  colors: AppColors;
  setPreference: (preference: AppearancePreference) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function AppThemeProvider({ children }: { children: ReactNode }) {
  const systemScheme = useColorScheme();
  const [preference, setPreferenceState] = useState<AppearancePreference>("system");
  const [ready, setReady] = useState(false);
  const enqueue = useRef(createWriteQueue()).current;

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEYS.appearance);
        const stored = parseAppearance(raw);
        if (active && stored) setPreferenceState(stored);
      } catch {
        // Si la lectura falla, queda el valor por defecto sin pisar el almacenamiento.
      } finally {
        if (active) setReady(true);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const setPreference = useCallback(
    (next: AppearancePreference) => {
      setPreferenceState(next);
      enqueue(() => AsyncStorage.setItem(STORAGE_KEYS.appearance, next));
    },
    [enqueue],
  );

  const scheme: "light" | "dark" = preference === "system" ? (systemScheme === "dark" ? "dark" : "light") : preference;
  const colors = scheme === "dark" ? darkColors : lightColors;

  const value = useMemo(
    () => ({ ready, preference, scheme, colors, setPreference }),
    [ready, preference, scheme, colors, setPreference],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useAppTheme() {
  const value = useContext(ThemeContext);
  if (!value) throw new Error("useAppTheme tiene que usarse dentro de AppThemeProvider");
  return value;
}
