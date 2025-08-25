import { DefaultTheme } from 'styled-components';
import { lightTheme } from './lightTheme';
import { darkTheme } from './darkTheme';

// Definizione di tutte le palette di colori disponibili
export enum ThemeMode {
  LIGHT = 'light',
  DARK = 'dark',
}

// Mappa dei temi disponibili
export const themes: Record<ThemeMode, DefaultTheme> = {
  [ThemeMode.LIGHT]: lightTheme,
  [ThemeMode.DARK]: darkTheme,
};

// Funzione per ottenere un tema in base alla modalità
export const getTheme = (mode: ThemeMode): DefaultTheme => {
  return themes[mode] || themes[ThemeMode.LIGHT];
};

export * from './base';
export * from './lightTheme';
export * from './darkTheme';
