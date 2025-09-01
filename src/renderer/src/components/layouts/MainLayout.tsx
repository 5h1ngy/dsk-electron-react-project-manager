import React, { ReactNode, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import ThemeControls from '@renderer/components/ui/ThemeControls';
import { RootState, rootActions } from '@renderer/store';

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

interface MainLayoutProps {
  children: ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);

  const [pageTitle, setPageTitle] = useState('Dashboard');

  const getInitials = (name: string) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  const handleNavigation = (path: string, title: string) => {
    navigate(path);
    setPageTitle(title);
  };

  const handleLogout = () => {
    dispatch(rootActions.authActions.logout());
    navigate('/login');
  };

  const isActivePath = (path: string) => {
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
            onClick={() => handleNavigation('/dashboard', 'Progetti')}
          >
            <NavItemIcon></NavItemIcon>
            Progetti
          </NavItem>
          <NavItem
            $isActive={location.pathname.includes('/tasks')}
            onClick={() => handleNavigation('/dashboard', 'Attività')}
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
            <Avatar>{user?.name ? getInitials(user.name) : 'U'}</Avatar>
            <UserInfo>
              <Username>{user?.name || 'Utente'}</Username>
              <UserRole>Sviluppatore</UserRole>
            </UserInfo>
            <LogoutButton onClick={handleLogout} title="Logout">
              
            </LogoutButton>
          </UserSection>
        </SidebarFooter>
      </Sidebar>

      <MainContent>
        <Header>
          <PageTitle>{pageTitle}</PageTitle>
          <HeaderControls>
            <ThemeControls />
          </HeaderControls>
        </Header>

        {children}
      </MainContent>
    </LayoutContainer>
  );
};

export default MainLayout;
