import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ThemeProvider as StyledThemeProvider } from 'styled-components';
import { ThemeMode, getTheme, AccentColor } from './theme';
import { DefaultTheme } from 'styled-components';
import { GlobalStyles } from './GlobalStyles';

// Tipo per il contesto del tema

interface ThemeContextType {
  mode: ThemeMode;
  accentColor: AccentColor;
  setMode: (mode: ThemeMode) => void;
  toggleMode: () => void;
  setAccentColor: (color: AccentColor) => void;
  theme: DefaultTheme;
}

// Creazione del contesto
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Hook per usare il tema
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Proprietà del ThemeProvider
interface ThemeProviderProps {
  children: ReactNode;
  defaultMode?: ThemeMode;
}

// Component ThemeProvider
export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  defaultMode = ThemeMode.LIGHT,
}) => {
  // Stato per la modalità corrente del tema
  const [mode, setMode] = useState<ThemeMode>(() => {
    // Recupera la modalità dal localStorage al caricamento
    const savedMode = localStorage.getItem('themeMode') as ThemeMode;
    return savedMode || defaultMode;
  });
  
  // Stato per il colore accentato
  const [accentColor, setAccentColor] = useState<AccentColor>(() => {
    // Recupera il colore accentato dal localStorage
    const savedColor = localStorage.getItem('accentColor') as AccentColor;
    return savedColor || AccentColor.BLUE;
  });

  // Toggle tra dark e light mode
  const toggleMode = () => {
    setMode((prevMode) =>
      prevMode === ThemeMode.LIGHT ? ThemeMode.DARK : ThemeMode.LIGHT
    );
  };

  // Salva la modalità nel localStorage quando cambia e aggiorna l'attributo data-theme del body
  useEffect(() => {
    localStorage.setItem('themeMode', mode);
    document.body.setAttribute('data-theme', mode.toLowerCase());
  }, [mode]);
  
  // Salva il colore accentato nel localStorage quando cambia
  useEffect(() => {
    localStorage.setItem('accentColor', accentColor);
  }, [accentColor]);

  // Ottieni il tema in base alla modalità attuale e al colore accentato
  const theme = getTheme(mode, accentColor);

  return (
    <ThemeContext.Provider value={{ mode, accentColor, setMode, toggleMode, setAccentColor, theme }}>
      <StyledThemeProvider theme={theme}>
        <GlobalStyles />
        {children}
      </StyledThemeProvider>
    </ThemeContext.Provider>
  );
};
