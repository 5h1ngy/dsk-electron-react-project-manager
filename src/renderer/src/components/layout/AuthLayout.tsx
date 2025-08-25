import React from 'react';
import { Outlet } from 'react-router-dom';
import styled from 'styled-components';
import { ThemeSwitcher } from '../ui';

const AuthContainer = styled.div`
  display: flex;
  width: 100%;
  height: 100vh;
  overflow: hidden;
`;

const AuthBanner = styled.div`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.primary.main};
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: ${({ theme }) => theme.spacing.xxl};
  color: ${({ theme }) => theme.colors.text.inverse};
  
  @media (max-width: 768px) {
    display: none;
  }
`;

const BannerContent = styled.div`
  max-width: 500px;
  text-align: center;
`;

const BannerTitle = styled.h1`
  font-size: 2.5rem;
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const BannerDescription = styled.p`
  font-size: ${({ theme }) => theme.typography.fontSizes.lg};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  line-height: 1.6;
`;

const FormSection = styled.div`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.background.primary};
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: ${({ theme }) => theme.spacing.xxl};
  position: relative;
`;

const FormContainer = styled.div`
  width: 100%;
  max-width: 420px;
`;

const Logo = styled.div`
  position: absolute;
  top: ${({ theme }) => theme.spacing.lg};
  left: ${({ theme }) => theme.spacing.lg};
  font-size: ${({ theme }) => theme.typography.fontSizes.xl};
  font-weight: ${({ theme }) => theme.typography.fontWeights.bold};
  color: ${({ theme }) => theme.colors.primary.main};
`;

const ThemeToggle = styled.div`
  position: absolute;
  top: ${({ theme }) => theme.spacing.lg};
  right: ${({ theme }) => theme.spacing.lg};
`;

const AuthLayout: React.FC = () => {
  return (
    <AuthContainer>
      <AuthBanner>
        <BannerContent>
          <BannerTitle>Project Manager</BannerTitle>
          <BannerDescription>
            Organizza i tuoi progetti, gestisci le attività e tieni traccia dei progressi con il nostro strumento completo di gestione progetti.
          </BannerDescription>
        </BannerContent>
      </AuthBanner>
      
      <FormSection>
        <Logo>PM App</Logo>
        <ThemeToggle>
          <ThemeSwitcher />
        </ThemeToggle>
        
        <FormContainer>
          <Outlet />
        </FormContainer>
      </FormSection>
    </AuthContainer>
  );
};

export default AuthLayout;
