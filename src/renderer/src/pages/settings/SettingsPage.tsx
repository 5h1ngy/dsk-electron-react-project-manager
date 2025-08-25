import React from 'react';
import styled from 'styled-components';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import PageHeader from '../../components/common/PageHeader';
import ThemeControls from '../../components/ui/ThemeControls';

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

const SettingsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.lg};
`;

const Section = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const SectionTitle = styled.h2`
  font-size: ${({ theme }) => theme.typography.fontSizes.md};
  font-weight: ${({ theme }) => theme.typography.fontWeights.semibold};
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const SettingsCard = styled.div`
  background-color: ${({ theme }) => theme.colors.background.secondary};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing.lg};
  border: 1px solid ${({ theme }) => theme.colors.border.light};
`;

const SettingItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${({ theme }) => `${theme.spacing.sm} 0`};
  
  &:not(:last-child) {
    border-bottom: 1px solid ${({ theme }) => theme.colors.border.light};
  }
`;

const SettingLabel = styled.div`
  font-weight: ${({ theme }) => theme.typography.fontWeights.medium};
`;

const SettingValue = styled.div`
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const SettingControl = styled.div`
  display: flex;
  align-items: center;
`;

export default SettingsPage;
