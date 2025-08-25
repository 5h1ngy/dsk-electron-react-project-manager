import React from 'react';
import styled from 'styled-components';

interface ColorSwatchProps {
  color: string;
  isSelected?: boolean;
  onClick?: () => void;
  title?: string;
}

interface ColorPaletteProps {
  colors: { id: string; color: string; name?: string }[];
  selectedColor?: string;
  onSelectColor: (colorId: string) => void;
  className?: string;
}

const ColorSwatch: React.FC<ColorSwatchProps> = ({ color, isSelected, onClick, title }) => {
  return (
    <SwatchButton
      $color={color}
      $isSelected={isSelected}
      onClick={onClick}
      title={title}
    />
  );
};

export const ColorPalette: React.FC<ColorPaletteProps> = ({
  colors,
  selectedColor,
  onSelectColor,
  className,
}) => {
  return (
    <PaletteContainer className={className}>
      {colors.map((color) => (
        <ColorSwatch
          key={color.id}
          color={color.color}
          isSelected={selectedColor === color.id}
          onClick={() => onSelectColor(color.id)}
          title={color.name}
        />
      ))}
    </PaletteContainer>
  );
};

const PaletteContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
`;

const SwatchButton = styled.button<{ $color: string; $isSelected?: boolean }>`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: ${({ $color }) => $color};
  border: 2px solid ${({ theme, $isSelected }) => $isSelected ? theme.colors.primary.main : 'transparent'};
  cursor: pointer;
  transition: all ${({ theme }) => theme.transition.fast};
  padding: 0;
  outline: none;
  
  &:hover {
    transform: scale(1.1);
    box-shadow: ${({ theme }) => theme.boxShadow.sm};
  }
`;

export default ColorPalette;
