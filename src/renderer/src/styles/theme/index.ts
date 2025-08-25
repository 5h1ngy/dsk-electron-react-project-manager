import { DefaultTheme } from 'styled-components';
import { lightTheme } from './lightTheme';
import { darkTheme } from './darkTheme';
import { deepMerge } from '../../utils/object';

// Definizione di tutte le palette di colori disponibili
export enum ThemeMode {
  LIGHT = 'light',
  DARK = 'dark',
}

// Definizione dei colori accentati disponibili
export enum AccentColor {
  BLUE = 'blue',
  PURPLE = 'purple',
  GREEN = 'green',
  ORANGE = 'orange',
  RED = 'red'
}

// Mappa dei colori accentati
export const accentColors = {
  [AccentColor.BLUE]: {
    primary: {
      light: '#4096ff',
      main: '#1677ff',
      dark: '#0958d9',
    },
    accent: {
      primary: '#1677ff',
      secondary: '#5B4FC9',
      tertiary: '#13c2c2',
    }
  },
  [AccentColor.PURPLE]: {
    primary: {
      light: '#9254de',
      main: '#722ed1',
      dark: '#531dab',
    },
    accent: {
      primary: '#722ed1',
      secondary: '#eb2f96',
      tertiary: '#13c2c2',
    }
  },
  [AccentColor.GREEN]: {
    primary: {
      light: '#73d13d',
      main: '#52c41a',
      dark: '#389e0d',
    },
    accent: {
      primary: '#52c41a',
      secondary: '#fadb14',
      tertiary: '#1677ff',
    }
  },
  [AccentColor.ORANGE]: {
    primary: {
      light: '#ffa940',
      main: '#fa8c16',
      dark: '#d46b08',
    },
    accent: {
      primary: '#fa8c16',
      secondary: '#fa541c',
      tertiary: '#13c2c2',
    }
  },
  [AccentColor.RED]: {
    primary: {
      light: '#ff7875',
      main: '#f5222d',
      dark: '#cf1322',
    },
    accent: {
      primary: '#f5222d',
      secondary: '#722ed1',
      tertiary: '#fadb14',
    }
  },
}

// Mappa dei temi disponibili
export const themes: Record<ThemeMode, DefaultTheme> = {
  [ThemeMode.LIGHT]: lightTheme,
  [ThemeMode.DARK]: darkTheme,
};

// Funzione per ottenere un tema in base alla modalità e al colore accentato
export const getTheme = (mode: ThemeMode, accent: AccentColor = AccentColor.BLUE): DefaultTheme => {
  const baseTheme = themes[mode] || themes[ThemeMode.LIGHT];
  const accentTheme = accentColors[accent] || accentColors[AccentColor.BLUE];
  
  // Unisci il tema base con il colore accentato ma mantieni gli altri colori del tema base
  return deepMerge({}, baseTheme, { 
    colors: { 
      primary: accentTheme.primary,
      accent: accentTheme.accent
    } 
  });
};

export * from './base';
export * from './lightTheme';
export * from './darkTheme';
