import React from 'react';
import { Outlet } from 'react-router-dom';
import ThemeSwitcher from '@renderer/components/ui/ThemeSwitcher';

import {
  AuthContainer,
  AuthBanner,
  BannerContent,
  BannerTitle,
  BannerDescription,
  FormSection,
  FormContainer,
  Logo,
  ThemeToggle
} from './AuthLayout.style';

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
