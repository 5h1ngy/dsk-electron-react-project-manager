import { DefaultTheme } from 'styled-components';
import { baseTheme } from './base';

// Light theme con colori soft/panna, evitando il bianco puro
export const lightTheme: DefaultTheme = {
  // Inherit base config
  ...baseTheme,
  
  // Set name
  name: 'light',
  
  // Shadows personalizzati per tema light
  shadows: {
    sm: '0 1px 3px rgba(0, 0, 0, 0.06)',
    md: '0 4px 8px rgba(0, 0, 0, 0.08)',
    lg: '0 8px 16px rgba(0, 0, 0, 0.1)',
  },
  boxShadow: {
    sm: '0 1px 3px rgba(0, 0, 0, 0.06)',
    md: '0 4px 8px rgba(0, 0, 0, 0.08)',
    lg: '0 8px 16px rgba(0, 0, 0, 0.1)',
  },
  
  // Colors per tema light
  colors: {
    primary: {
      light: '#4096ff',
      main: '#1677ff',
      dark: '#0958d9',
    },
    secondary: {
      light: '#7265E6',
      main: '#5B4FC9',
      dark: '#483AA7',
    },
    accent: {
      primary: '#1677ff',
      secondary: '#5B4FC9',
      tertiary: '#13c2c2',
    },
    background: {
      primary: '#f8f8f8',    // Colore principale tipo panna, non bianco puro
      secondary: '#f0f0f0',  // Sfondo secondario più scuro
      tertiary: '#e6e6e6',   // Sfondo terziario ancora più scuro per card
      overlay: 'rgba(255, 255, 255, 0.8)',
    },
    text: {
      primary: '#262626',    // Testo principale quasi nero
      secondary: '#595959',  // Testo secondario grigio medio
      tertiary: '#8c8c8c',   // Testo terziario grigio chiaro
      inverse: '#f8f8f8',    // Testo inverso su sfondo scuro
    },
    border: {
      light: '#f0f0f0',      // Bordo leggero
      medium: '#d9d9d9',     // Bordo medio
      dark: '#bfbfbf',       // Bordo scuro
    },
    status: {
      success: '#52c41a',
      error: '#f5222d',
      warning: '#faad14',
      info: '#1677ff',
    },
  },
};
