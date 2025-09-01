import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@renderer/store';
import PageHeader from '@renderer/components/common/PageHeader';
import ThemeControls from '@renderer/components/ui/ThemeControls';

import {
  SettingControl,
  SettingsContainer,
  Section,
  SectionTitle,
  SettingsCard,
  SettingItem,
  SettingLabel,
  SettingValue,
} from './Settings.style';

const SettingsPage: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  
  return (
    <SettingsContainer>
      <PageHeader
        title="Impostazioni"
        subtitle="Personalizza l'applicazione in base alle tue preferenze"
      />
      
      <Section>
        <SectionTitle>Aspetto</SectionTitle>
        <SettingsCard>
          <SettingItem>
            <SettingLabel>Tema e colori</SettingLabel>
            <SettingControl>
              <ThemeControls />
            </SettingControl>
          </SettingItem>
        </SettingsCard>
      </Section>
      
      <Section>
        <SectionTitle>Account</SectionTitle>
        <SettingsCard>
          <SettingItem>
            <SettingLabel>Nome utente</SettingLabel>
            <SettingValue>{user?.name || 'Non impostato'}</SettingValue>
          </SettingItem>
          <SettingItem>
            <SettingLabel>Email</SettingLabel>
            <SettingValue>{user?.email || 'Non impostato'}</SettingValue>
          </SettingItem>
        </SettingsCard>
      </Section>
      
      <Section>
        <SectionTitle>Informazioni</SectionTitle>
        <SettingsCard>
          <SettingItem>
            <SettingLabel>Versione</SettingLabel>
            <SettingValue>1.0.0</SettingValue>
          </SettingItem>
        </SettingsCard>
      </Section>
    </SettingsContainer>
  );
};

export default SettingsPage;
