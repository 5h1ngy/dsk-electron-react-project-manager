import React from 'react';
import styled from 'styled-components';
import { useTheme } from '../../styles/ThemeProvider';
import { ThemeMode } from '../../styles/theme';

interface ThemeSwitcherProps {
  className?: string;
}

const SwitcherContainer = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const SwitchLabel = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSizes.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const SwitchButton = styled.button<{ $isActive: boolean }>`
  position: relative;
  width: 48px;
  height: 24px;
  border-radius: 12px;
  background-color: ${({ theme, $isActive }) =>
    $isActive ? theme.colors.primary.main : theme.colors.border.medium};
  border: none;
  cursor: pointer;
  transition: all ${({ theme }) => theme.transition.fast};
  padding: 0;
  display: flex;
  align-items: center;
  
  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.primary.main}30;
  }
  
  &::before {
    content: '';
    position: absolute;
    left: ${({ $isActive }) => ($isActive ? '26px' : '4px')};
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background-color: ${({ theme }) => theme.colors.background.primary};
    transition: all ${({ theme }) => theme.transition.fast};
  }
`;

const ModeIcon = styled.span<{ $isLight: boolean }>`
  position: absolute;
  left: ${({ $isLight }) => ($isLight ? '6px' : '28px')};
  top: 6px;
  width: 12px;
  height: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  color: ${({ theme, $isLight }) =>
    $isLight ? theme.colors.text.tertiary : theme.colors.text.inverse};
  z-index: 1;
  
  i {
    font-style: normal;
  }
`;

export const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({ className }) => {
  const { mode, toggleMode } = useTheme();
  const isDarkMode = mode === ThemeMode.DARK;
  
  return (
    <SwitcherContainer className={className}>
      <SwitchLabel>Tema</SwitchLabel>
      <SwitchButton
        $isActive={isDarkMode}
        onClick={toggleMode}
        aria-label={`Passa alla modalità ${isDarkMode ? 'chiara' : 'scura'}`}
      >
        <ModeIcon $isLight={true}>
          <i></i>
        </ModeIcon>
        <ModeIcon $isLight={false}>
          <i></i>
        </ModeIcon>
      </SwitchButton>
    </SwitcherContainer>
  );
};

export default ThemeSwitcher;
