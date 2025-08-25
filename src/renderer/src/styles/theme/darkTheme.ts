import { DefaultTheme } from 'styled-components';
import { baseTheme } from './base';

// Dark theme con colori molto scuri
export const darkTheme: DefaultTheme = {
  // Inherit base config
  ...baseTheme,
  
  // Set name
  name: 'dark',
  
  // Shadows personalizzati per tema dark
  shadows: {
    sm: '0 1px 3px rgba(0, 0, 0, 0.3)',
    md: '0 4px 8px rgba(0, 0, 0, 0.4)',
    lg: '0 8px 16px rgba(0, 0, 0, 0.5)',
  },
  boxShadow: {
    sm: '0 1px 3px rgba(0, 0, 0, 0.3)',
    md: '0 4px 8px rgba(0, 0, 0, 0.4)',
    lg: '0 8px 16px rgba(0, 0, 0, 0.5)',
  },
  
  // Colors per tema dark
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
      primary: '#0a0a0a',    // Nero molto scuro per il background principale
      secondary: '#121212',  // Sfondo secondario, leggermente più chiaro
      tertiary: '#1f1f1f',   // Sfondo terziario per card, elementi in rilievo
      overlay: 'rgba(0, 0, 0, 0.8)',
    },
    text: {
      primary: '#f5f5f5',    // Testo principale quasi bianco
      secondary: '#b0b0b0',  // Testo secondario grigio chiaro
      tertiary: '#737373',   // Testo terziario grigio scuro
      inverse: '#0a0a0a',    // Testo inverso su sfondo chiaro
    },
    border: {
      light: '#2a2a2a',      // Bordo leggero
      medium: '#333333',     // Bordo medio
      dark: '#444444',       // Bordo scuro
    },
    status: {
      success: '#52c41a',
      error: '#f5222d',
      warning: '#faad14',
      info: '#1677ff',
    },
  },
};
