import React from 'react';
import styled from 'styled-components';
import { AccentColor } from '../../styles/theme';

interface AccentColorPickerProps {
  currentColor: AccentColor;
  onChange: (color: AccentColor) => void;
  className?: string;
}

// Definizione delle etichette dei colori
const COLOR_LABELS: Record<AccentColor, string> = {
  [AccentColor.BLUE]: 'Blu',
  [AccentColor.PURPLE]: 'Viola',
  [AccentColor.GREEN]: 'Verde',
  [AccentColor.ORANGE]: 'Arancione',
  [AccentColor.RED]: 'Rosso',
};

// Definizione dei valori HEX dei colori
const COLOR_VALUES: Record<AccentColor, string> = {
  [AccentColor.BLUE]: '#1677ff',
  [AccentColor.PURPLE]: '#722ed1',
  [AccentColor.GREEN]: '#52c41a',
  [AccentColor.ORANGE]: '#fa8c16',
  [AccentColor.RED]: '#f5222d',
};

export const AccentColorPicker: React.FC<AccentColorPickerProps> = ({
  currentColor,
  onChange,
  className,
}) => {
  return (
    <PickerContainer className={className}>
      <Label>Colore Accento</Label>
      <ColorsGrid>
        {Object.values(AccentColor).map((color) => (
          <ColorSwatch
            key={color}
            $color={COLOR_VALUES[color]}
            $isSelected={currentColor === color}
            onClick={() => onChange(color)}
            title={COLOR_LABELS[color]}
          />
        ))}
      </ColorsGrid>
    </PickerContainer>
  );
};

const PickerContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
  margin-top: ${({ theme }) => theme.spacing.sm};
`;

const Label = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const ColorsGrid = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.xs};
`;

const ColorSwatch = styled.button<{ $color: string; $isSelected: boolean }>`
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background-color: ${({ $color }) => $color};
  border: 2px solid ${({ theme, $isSelected }) => 
    $isSelected ? theme.colors.primary.main : 'transparent'};
  cursor: pointer;
  transition: all ${({ theme }) => theme.transition.fast};
  padding: 0;
  
  &:hover {
    transform: scale(1.1);
    box-shadow: ${({ theme }) => theme.boxShadow.sm};
  }
  
  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.primary.main}30;
  }
`;

export default AccentColorPicker;
