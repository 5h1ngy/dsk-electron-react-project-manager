import 'styled-components';

declare module 'styled-components' {
  export interface DefaultTheme {
    name: string;
    
    // Proprietà di base
    md: number;
    sm: number;
    lg: number;
    
    // Typography
    typography: {
      fontFamily: string;
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
        regular: number;
        medium: number;
        semibold: number;
        bold: number;
      };
      lineHeights: {
        tight: number;
        normal: number;
        relaxed: number;
      };
    };
    
    // Alias per retrocompatibilità
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
      regular: number;
      medium: number;
      semibold: number;
      bold: number;
    };
    lineHeights: {
      tight: number;
      normal: number;
      relaxed: number;
    };
    
    // Layout & componenti
    spacing: {
      xs: string;
      sm: string;
      md: string;
      lg: string;
      xl: string;
      xxl: string;
    };
    borderRadius: {
      xs: string;
      sm: string;
      md: string;
      lg: string;
      xl: string;
      circle: string;
    };
    shadows: {
      sm: string;
      md: string;
      lg: string;
    };
    boxShadow: {
      sm: string;
      md: string;
      lg: string;
    };
    transition: {
      fast: string;
      normal: string;
      slow: string;
    };
    zIndex: {
      base: number;
      dropdown: number;
      sticky: number;
      fixed: number;
      modal: number;
      popover: number;
      tooltip: number;
    };
    
    // Colors
    colors: {
      primary: {
        light: string;
        main: string;
        dark: string;
      };
      secondary: {
        light: string;
        main: string;
        dark: string;
      };
      accent: {
        primary: string;
        secondary: string;
        tertiary: string;
      };
      background: {
        primary: string;
        secondary: string;
        tertiary: string;
        overlay: string;
      };
      text: {
        primary: string;
        secondary: string;
        tertiary: string;
        inverse: string;
      };
      border: {
        light: string;
        medium: string;
        dark: string;
      };
      status: {
        success: string;
        error: string;
        warning: string;
        info: string;
      };
    };
  }
}
