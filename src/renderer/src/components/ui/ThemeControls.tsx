import React from 'react';
import ThemeSwitcher from './ThemeSwitcher';
import { ControlsRow, Container, } from './ThemeControls.style';

interface ThemeControlsProps {
  className?: string;
}

export const ThemeControls: React.FC<ThemeControlsProps> = ({ className }) => (
  <Container className={className}>
    <ControlsRow>
      <ThemeSwitcher />
    </ControlsRow>
  </Container>
);

export default ThemeControls;
