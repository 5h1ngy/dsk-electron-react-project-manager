import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ThemeProvider as StyledThemeProvider } from 'styled-components';
import { ThemeMode, getTheme } from './theme';
import { GlobalStyles } from './GlobalStyles';

// Tipo per il contesto del tema
interface ThemeContextType {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  toggleMode: () => void;
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

  // Toggle tra dark e light mode
  const toggleMode = () => {
    setMode((prevMode) =>
      prevMode === ThemeMode.LIGHT ? ThemeMode.DARK : ThemeMode.LIGHT
    );
  };

  // Salva la modalità nel localStorage quando cambia
  useEffect(() => {
    localStorage.setItem('themeMode', mode);
  }, [mode]);

  // Ottieni il tema in base alla modalità attuale
  const theme = getTheme(mode);

  return (
    <ThemeContext.Provider value={{ mode, setMode, toggleMode }}>
      <StyledThemeProvider theme={theme}>
        <GlobalStyles />
        {children}
      </StyledThemeProvider>
    </ThemeContext.Provider>
  );
};
