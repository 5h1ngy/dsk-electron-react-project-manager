import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { SettingOutlined, CheckOutlined } from '@ant-design/icons';
import ColorPalette from './ColorPalette';
import ThemeSwitcher from './ThemeSwitcher';

// Definiamo i colori disponibili
const ACCENT_COLORS = [
  { id: 'blue', color: '#1677ff', name: 'Blu' },
  { id: 'purple', color: '#722ed1', name: 'Viola' },
  { id: 'green', color: '#52c41a', name: 'Verde' },
  { id: 'orange', color: '#fa8c16', name: 'Arancione' },
  { id: 'pink', color: '#eb2f96', name: 'Rosa' },
  { id: 'red', color: '#f5222d', name: 'Rosso' },
  { id: 'cyan', color: '#13c2c2', name: 'Ciano' },
  { id: 'gold', color: '#faad14', name: 'Oro' },
];

interface ThemeControlsProps {
  className?: string;
}

export const ThemeControls: React.FC<ThemeControlsProps> = ({ className }) => {
  const [showAccentColors, setShowAccentColors] = useState(false);
  const [accentColor, setAccentColor] = useState(() => {
    // Recupera il colore accentato dal localStorage o usa il default blue
    return localStorage.getItem('accentColor') || 'blue';
  });

  // Salva il colore accentato nel localStorage e applica la variabile CSS
  useEffect(() => {
    localStorage.setItem('accentColor', accentColor);
    // Imposta la variabile CSS per il colore accentato
    const selectedColor = ACCENT_COLORS.find(c => c.id === accentColor)?.color || '#1677ff';
    document.documentElement.style.setProperty('--accent-color', selectedColor);
  }, [accentColor]);

  const handleColorChange = (colorId: string) => {
    setAccentColor(colorId);
  };

  return (
    <Container className={className}>
      <ControlsRow>
        <ThemeSwitcher />
        <ColorButton 
          onClick={() => setShowAccentColors(!showAccentColors)}
          title="Cambia colore accento"
          $accentColor={accentColor}
        >
          <SettingOutlined />
        </ColorButton>
      </ControlsRow>
      
      {showAccentColors && (
        <PaletteWrapper>
          <PaletteHeader>
            <PaletteTitle>Colore Accento</PaletteTitle>
            <CloseButton onClick={() => setShowAccentColors(false)}>
              <CheckOutlined />
            </CloseButton>
          </PaletteHeader>
          <ColorPalette
            colors={ACCENT_COLORS}
            selectedColor={accentColor}
            onSelectColor={handleColorChange}
          />
        </PaletteWrapper>
      )}
    </Container>
  );
};

const Container = styled.div`
  position: relative;
`;

const ControlsRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const ColorButton = styled.button<{ $accentColor: string }>`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: ${({ $accentColor }) => {
    const color = ACCENT_COLORS.find(c => c.id === $accentColor)?.color || '#1677ff';
    return color;
  }};
  border: none;
  cursor: pointer;
  transition: all ${({ theme }) => theme.transition.fast};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
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

const PaletteWrapper = styled.div`
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: ${({ theme }) => theme.spacing.sm};
  background: ${({ theme }) => theme.colors.background.secondary};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  padding: ${({ theme }) => theme.spacing.sm};
  width: 200px;
  box-shadow: ${({ theme }) => theme.boxShadow.md};
  z-index: ${({ theme }) => theme.zIndex.dropdown};
  border: 1px solid ${({ theme }) => theme.colors.border.light};
`;

const PaletteHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`;

const PaletteTitle = styled.div`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.text.tertiary};
  padding: 2px;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    color: ${({ theme }) => theme.colors.primary.main};
  }
`;

export default ThemeControls;
