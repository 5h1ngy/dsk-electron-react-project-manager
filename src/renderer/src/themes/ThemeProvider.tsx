import React, { useEffect } from 'react';
import { ThemeProvider as StyledThemeProvider } from 'styled-components';
import { useSelector, useDispatch } from 'react-redux';
import { createTheme } from './theme';
import { RootState } from '../store';
import { initializeUiFromStorage } from '../store/slices/uiSlice';
import GlobalStyles from './GlobalStyles';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const dispatch = useDispatch();
  const { themeMode, colorPalette } = useSelector((state: RootState) => state.ui);
  
  // Initialize UI state from localStorage on mount
  useEffect(() => {
    dispatch(initializeUiFromStorage());
  }, [dispatch]);
  
  // Create theme based on current settings
  const theme = createTheme(themeMode, colorPalette);
  
  return (
    <StyledThemeProvider theme={theme}>
      <GlobalStyles />
      {children}
    </StyledThemeProvider>
  );
};
