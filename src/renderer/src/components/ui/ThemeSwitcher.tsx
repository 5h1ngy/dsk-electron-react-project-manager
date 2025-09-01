import React, { useState } from 'react';
import { SettingOutlined } from '@ant-design/icons';

import { useTheme } from '@renderer/styles/ThemeProvider';
import { ThemeMode, AccentColor } from '@renderer/styles/theme';

import AccentColorPicker from './AccentColorPicker';
import { SwitcherContainer, ColorButton, ModeIcon, SwitchButton, SwitchLabel, SwitcherControls } from './ThemeSwitcher.style';

interface ThemeSwitcherProps {
  className?: string;
}

export const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({ className }) => {
  const { mode, accentColor, toggleMode, setAccentColor } = useTheme();
  const isDarkMode = mode === ThemeMode.DARK;
  const [showColorPicker, setShowColorPicker] = useState(false);

  const toggleColorPicker = () => {
    setShowColorPicker(!showColorPicker);
  };

  const handleColorChange = (color: AccentColor) => {
    setAccentColor(color);
  };

  return (
    <SwitcherContainer className={className}>
      <SwitcherControls>
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

        <ColorButton
          onClick={toggleColorPicker}
          title="Cambia colore accento"
          $accentColor={accentColor}
        >
          <SettingOutlined />
        </ColorButton>
      </SwitcherControls>

      {showColorPicker && (
        <AccentColorPicker
          currentColor={accentColor}
          onChange={handleColorChange}
        />
      )}
    </SwitcherContainer>
  );
};

export default ThemeSwitcher;
