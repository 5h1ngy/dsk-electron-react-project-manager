import { ColorPalette, ThemeMode } from '../store/slices/uiSlice';

// Base theme colors
interface ThemeColors {
  // Background colors
  background: {
    primary: string;
    secondary: string;
    tertiary: string;
  };
  // Text colors
  text: {
    primary: string;
    secondary: string;
    tertiary: string;
    inverse: string;
  };
  // Border colors
  border: {
    light: string;
    medium: string;
    strong: string;
  };
  // Status colors
  status: {
    success: string;
    warning: string;
    error: string;
    info: string;
  };
  // Accent colors based on theme
  accent: {
    primary: string;
    secondary: string;
    light: string;
    dark: string;
  };
  // Task status colors
  task: {
    todo: string;
    inProgress: string;
    review: string;
    blocked: string;
    done: string;
  };
  // Task priority colors
  priority: {
    low: string;
    medium: string;
    high: string;
    critical: string;
  };
}

// Theme definition
export interface Theme {
  mode: ThemeMode;
  colors: ThemeColors;
  colorPalette: ColorPalette;
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  borderRadius: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
    full: string;
  };
  boxShadow: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  transition: {
    fast: string;
    normal: string;
    slow: string;
  };
  fontSizes: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    xxl: string;
  };
  fontWeights: {
    light: number;
    normal: number;
    medium: number;
    bold: number;
  };
}

// Color palette definitions
const colorPalettes: Record<ColorPalette, { primary: string; secondary: string; light: string; dark: string }> = {
  blue: {
    primary: '#1890ff',
    secondary: '#096dd9',
    light: '#e6f7ff',
    dark: '#003a8c',
  },
  green: {
    primary: '#52c41a',
    secondary: '#389e0d',
    light: '#f6ffed',
    dark: '#135200',
  },
  purple: {
    primary: '#722ed1',
    secondary: '#531dab',
    light: '#f9f0ff',
    dark: '#22075e',
  },
  orange: {
    primary: '#fa8c16',
    secondary: '#d46b08',
    light: '#fff7e6',
    dark: '#873800',
  },
  red: {
    primary: '#f5222d',
    secondary: '#cf1322',
    light: '#fff1f0',
    dark: '#820014',
  },
};

// Dark theme
const darkTheme: ThemeColors = {
  background: {
    primary: '#141414',
    secondary: '#1f1f1f',
    tertiary: '#2b2b2b',
  },
  text: {
    primary: 'rgba(255, 255, 255, 0.85)',
    secondary: 'rgba(255, 255, 255, 0.65)',
    tertiary: 'rgba(255, 255, 255, 0.45)',
    inverse: '#000000',
  },
  border: {
    light: 'rgba(255, 255, 255, 0.08)',
    medium: 'rgba(255, 255, 255, 0.15)',
    strong: 'rgba(255, 255, 255, 0.23)',
  },
  status: {
    success: '#52c41a',
    warning: '#faad14',
    error: '#ff4d4f',
    info: '#1890ff',
  },
  accent: {
    primary: '#1890ff', // Will be overridden by palette
    secondary: '#096dd9', // Will be overridden by palette
    light: '#e6f7ff', // Will be overridden by palette
    dark: '#003a8c', // Will be overridden by palette
  },
  task: {
    todo: '#1890ff',
    inProgress: '#faad14',
    review: '#722ed1',
    blocked: '#ff4d4f',
    done: '#52c41a',
  },
  priority: {
    low: '#52c41a',
    medium: '#1890ff',
    high: '#faad14',
    critical: '#ff4d4f',
  },
};

// Light theme
const lightTheme: ThemeColors = {
  background: {
    primary: '#f9f5f0', // Cream/panna soft tone
    secondary: '#f5f0e8', 
    tertiary: '#eeebe5',
  },
  text: {
    primary: 'rgba(0, 0, 0, 0.85)',
    secondary: 'rgba(0, 0, 0, 0.65)',
    tertiary: 'rgba(0, 0, 0, 0.45)',
    inverse: '#ffffff',
  },
  border: {
    light: 'rgba(0, 0, 0, 0.06)',
    medium: 'rgba(0, 0, 0, 0.12)',
    strong: 'rgba(0, 0, 0, 0.2)',
  },
  status: {
    success: '#52c41a',
    warning: '#faad14',
    error: '#ff4d4f',
    info: '#1890ff',
  },
  accent: {
    primary: '#1890ff', // Will be overridden by palette
    secondary: '#096dd9', // Will be overridden by palette
    light: '#e6f7ff', // Will be overridden by palette
    dark: '#003a8c', // Will be overridden by palette
  },
  task: {
    todo: '#1890ff',
    inProgress: '#faad14',
    review: '#722ed1',
    blocked: '#ff4d4f',
    done: '#52c41a',
  },
  priority: {
    low: '#52c41a',
    medium: '#1890ff',
    high: '#faad14',
    critical: '#ff4d4f',
  },
};

// Create theme based on mode and palette
export const createTheme = (mode: ThemeMode, colorPalette: ColorPalette): Theme => {
  const palette = colorPalettes[colorPalette];
  const baseColors = mode === 'dark' ? darkTheme : lightTheme;
  
  return {
    mode,
    colorPalette,
    colors: {
      ...baseColors,
      accent: {
        primary: palette.primary,
        secondary: palette.secondary,
        light: palette.light,
        dark: palette.dark,
      },
    },
    spacing: {
      xs: '4px',
      sm: '8px',
      md: '16px',
      lg: '24px',
      xl: '32px',
    },
    borderRadius: {
      sm: '2px',
      md: '4px',
      lg: '8px',
      xl: '16px',
      full: '9999px',
    },
    boxShadow: {
      sm: mode === 'dark' 
        ? '0 1px 2px rgba(0, 0, 0, 0.5)'
        : '0 1px 2px rgba(0, 0, 0, 0.05)',
      md: mode === 'dark'
        ? '0 3px 6px rgba(0, 0, 0, 0.6)'
        : '0 3px 6px rgba(0, 0, 0, 0.1)',
      lg: mode === 'dark'
        ? '0 5px 15px rgba(0, 0, 0, 0.7)'
        : '0 5px 15px rgba(0, 0, 0, 0.15)',
      xl: mode === 'dark'
        ? '0 10px 24px rgba(0, 0, 0, 0.8)'
        : '0 10px 24px rgba(0, 0, 0, 0.2)',
    },
    transition: {
      fast: '0.1s ease',
      normal: '0.2s ease',
      slow: '0.3s ease',
    },
    fontSizes: {
      xs: '12px',
      sm: '14px',
      md: '16px',
      lg: '18px',
      xl: '20px',
      xxl: '24px',
    },
    fontWeights: {
      light: 300,
      normal: 400,
      medium: 500,
      bold: 700,
    },
  };
};
