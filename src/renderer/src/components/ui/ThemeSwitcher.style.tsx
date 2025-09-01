import styled from 'styled-components';
import { AccentColor } from '../../styles/theme';

export const SwitcherContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
`;

export const SwitcherControls = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
`;

export const SwitchLabel = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSizes.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
`;

export const SwitchButton = styled.button<{ $isActive: boolean }>`
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

export const ModeIcon = styled.span<{ $isLight: boolean }>`
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

export const ColorButton = styled.button<{ $accentColor: AccentColor }>`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: ${({ theme }) => theme.colors.primary.main};
  border: none;
  cursor: pointer;
  transition: all ${({ theme }) => theme.transition.fast};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.text.inverse};
  font-size: 12px;
  
  &:hover {
    opacity: 0.9;
    transform: scale(1.05);
  }
  
  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.primary.light};
  }
`;