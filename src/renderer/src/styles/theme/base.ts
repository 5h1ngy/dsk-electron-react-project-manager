import { DefaultTheme } from 'styled-components';

export const baseTheme: DefaultTheme = {
  // Compat properties
  md: 8,
  sm: 4,
  lg: 16,
  
  name: 'base',
  
  // Typography doppia versione
  typography: {
    fontFamily: "'Inter', 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
    fontSizes: {
      xs: '0.75rem',
      sm: '0.875rem',
      md: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      xxl: '1.5rem',
    },
    fontWeights: {
      light: 300,
      regular: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
    lineHeights: {
      tight: 1.25,
      normal: 1.5,
      relaxed: 1.75,
    }
  },
  
  // Legacy access per retrocompatibilità
  fontSizes: {
    xs: '0.75rem',
    sm: '0.875rem',
    md: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    xxl: '1.5rem',
  },
  fontWeights: {
    light: 300,
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  lineHeights: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
  },
  
  // Layout
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    xxl: '3rem',
  },
  borderRadius: {
    xs: '2px',
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    circle: '50%',
  },
  
  // Shadows
  shadows: {
    sm: '0 1px 3px rgba(0, 0, 0, 0.1)',
    md: '0 4px 8px rgba(0, 0, 0, 0.12)',
    lg: '0 8px 16px rgba(0, 0, 0, 0.14)',
  },
  boxShadow: {
    sm: '0 1px 3px rgba(0, 0, 0, 0.1)',
    md: '0 4px 8px rgba(0, 0, 0, 0.12)',
    lg: '0 8px 16px rgba(0, 0, 0, 0.14)',
  },
  
  // Transitions
  transition: {
    fast: '0.15s ease-in-out',
    normal: '0.25s ease-in-out',
    slow: '0.35s ease-in-out',
  },
  
  // Z-index
  zIndex: {
    base: 0,
    dropdown: 100,
    sticky: 200,
    fixed: 300,
    modal: 400,
    popover: 500,
    tooltip: 600,
  },
  
  // Colori placeholder (saranno sovrascritti nei temi specifici)
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
      primary: '#ffffff',
      secondary: '#f5f5f5',
      tertiary: '#e6e6e6',
      overlay: 'rgba(0, 0, 0, 0.5)',
    },
    text: {
      primary: '#000000',
      secondary: '#444444',
      tertiary: '#666666',
      inverse: '#ffffff',
    },
    border: {
      light: '#e6e6e6',
      medium: '#d9d9d9',
      dark: '#bfbfbf',
    },
    status: {
      success: '#52c41a',
      error: '#f5222d',
      warning: '#faad14',
      info: '#1677ff',
    },
  },
};
