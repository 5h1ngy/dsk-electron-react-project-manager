import React, { ReactNode, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

import withSlice, { Bind } from '@renderer/hocs/withSlice';
import ThemeControls from '@renderer/components/ui/ThemeControls';

import {
  LayoutContainer,
  Sidebar,
  SidebarHeader,
  Logo,
  NavSection,
  NavSectionTitle,
  NavItem,
  NavItemIcon,
  MainContent,
  Header,
  PageTitle,
  HeaderControls,
  SidebarFooter,
  UserSection,
  Avatar,
  UserInfo,
  Username,
  UserRole,
  LogoutButton
} from './MainLayout.style';

function getInitials(name: string) {
  return name ? name.split(' ').map((n) => n[0]).join('').toUpperCase() : 'U';
}

interface MainLayoutProps extends Bind {
  children: ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ actions, state, children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const [pageTitle, setPageTitle] = useState('Dashboard');

  function handleNavigation(path: string, title: string) {
    navigate(path);
    setPageTitle(title);
  };

  function isActivePath(path: string) {
    return location.pathname === path;
  };

  return (
    <LayoutContainer>

      <Sidebar>
        <SidebarHeader>
          <Logo>PM App</Logo>
        </SidebarHeader>

        <NavSection>
          <NavSectionTitle>Menu</NavSectionTitle>
          <NavItem
            $isActive={isActivePath('/dashboard')}
            onClick={() => handleNavigation('/dashboard', 'Dashboard')}
          >
            <NavItemIcon></NavItemIcon>
            Dashboard
          </NavItem>
          <NavItem
            $isActive={location.pathname.includes('/projects')}
            onClick={() => handleNavigation('/projects', 'Progetti')}
          >
            <NavItemIcon></NavItemIcon>
            Progetti
          </NavItem>
          <NavItem
            $isActive={location.pathname.includes('/tasks')}
            onClick={() => handleNavigation('/tasks', 'Attività')}
          >
            <NavItemIcon></NavItemIcon>
            Attività
          </NavItem>
          <NavItem
            $isActive={location.pathname.startsWith('/notes')}
            onClick={() => handleNavigation('/notes', 'Note')}
          >
            <NavItemIcon></NavItemIcon>
            Note
          </NavItem>
        </NavSection>

        <NavSection>
          <NavSectionTitle>Impostazioni</NavSectionTitle>
          <NavItem
            $isActive={isActivePath('/settings')}
            onClick={() => handleNavigation('/settings', 'Impostazioni')}
          >
            <NavItemIcon></NavItemIcon>
            Impostazioni
          </NavItem>
        </NavSection>

        <SidebarFooter>
          <UserSection>
            <Avatar>
              {state.auth.user?.name ? getInitials(state.auth.user?.name) : 'U'}
            </Avatar>

            <UserInfo>
              <Username>
                {state.auth.user?.name || 'Utente'}
              </Username>
              <UserRole>
                Sviluppatore
              </UserRole>
            </UserInfo>

            <LogoutButton
              title="Logout"
              onClick={() => {
                actions.authActions.logout();
                navigate('/login');
              }}>
              
            </LogoutButton>

          </UserSection>
        </SidebarFooter>
      </Sidebar>

      <MainContent>
        <Header>
          <PageTitle>
            {pageTitle}
          </PageTitle>
          <HeaderControls>
            <ThemeControls />
          </HeaderControls>
        </Header>

        {children}
      </MainContent>
    </LayoutContainer>
  );
};

export default withSlice(MainLayout);
