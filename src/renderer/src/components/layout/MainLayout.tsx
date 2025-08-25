import React, { ReactNode, useState } from 'react';
import styled from 'styled-components';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import ThemeControls from '../ui/ThemeControls';
import { logout } from '../../store/slices/authSlice';
import { RootState } from '../../store';

interface MainLayoutProps {
  children: ReactNode;
}

const LayoutContainer = styled.div`
  display: flex;
  width: 100%;
  height: 100vh;
  overflow: hidden;
`;

const Sidebar = styled.div`
  width: 250px;
  background-color: ${({ theme }) => theme.colors.background.secondary};
  border-right: 1px solid ${({ theme }) => theme.colors.border.light};
  display: flex;
  flex-direction: column;
  transition: width ${({ theme }) => theme.transition.normal};
  overflow-y: auto;
`;

const SidebarHeader = styled.div`
  padding: ${({ theme }) => `${theme.spacing.md} ${theme.spacing.md}`};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.light};
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const Logo = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSizes.lg};
  font-weight: ${({ theme }) => theme.typography.fontWeights.bold};
  color: ${({ theme }) => theme.colors.primary.main};
`;

const NavSection = styled.div`
  padding: ${({ theme }) => theme.spacing.md};
`;

const NavSectionTitle = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSizes.xs};
  text-transform: uppercase;
  letter-spacing: 1px;
  color: ${({ theme }) => theme.colors.text.tertiary};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
  padding-left: ${({ theme }) => theme.spacing.xs};
`;

const NavItem = styled.div<{ $isActive: boolean }>`
  display: flex;
  align-items: center;
  padding: ${({ theme }) => `${theme.spacing.sm} ${theme.spacing.md}`};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  cursor: pointer;
  transition: all ${({ theme }) => theme.transition.fast};
  background-color: ${({ theme, $isActive }) =>
    $isActive ? theme.colors.primary.main + '20' : 'transparent'};
  color: ${({ theme, $isActive }) =>
    $isActive ? theme.colors.primary.main : theme.colors.text.primary};
  font-weight: ${({ theme, $isActive }) =>
    $isActive ? theme.typography.fontWeights.medium : theme.typography.fontWeights.regular};
  
  &:hover {
    background-color: ${({ theme, $isActive }) =>
      $isActive ? theme.colors.primary.main + '30' : theme.colors.background.tertiary};
  }
`;

const NavItemIcon = styled.span`
  margin-right: ${({ theme }) => theme.spacing.sm};
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
`;

const SidebarFooter = styled.div`
  margin-top: auto;
  padding: ${({ theme }) => theme.spacing.md};
  border-top: 1px solid ${({ theme }) => theme.colors.border.light};
`;

const UserSection = styled.div`
  display: flex;
  align-items: center;
`;

const Avatar = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: ${({ theme }) => theme.colors.primary.main};
  color: ${({ theme }) => theme.colors.text.inverse};
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: ${({ theme }) => theme.typography.fontWeights.medium};
  margin-right: ${({ theme }) => theme.spacing.sm};
`;

const UserInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const Username = styled.div`
  font-weight: ${({ theme }) => theme.typography.fontWeights.medium};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const UserRole = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSizes.xs};
  color: ${({ theme }) => theme.colors.text.tertiary};
`;

const LogoutButton = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.text.tertiary};
  cursor: pointer;
  padding: ${({ theme }) => theme.spacing.xs};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  margin-left: ${({ theme }) => theme.spacing.sm};
  
  &:hover {
    color: ${({ theme }) => theme.colors.status.error};
    background-color: ${({ theme }) => theme.colors.background.tertiary};
  }
`;

const MainContent = styled.div`
  flex: 1;
  overflow: auto;
  padding: ${({ theme }) => theme.spacing.xl};
  background-color: ${({ theme }) => theme.colors.background.primary};
`;

const Header = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${({ theme }) => `${theme.spacing.md} ${theme.spacing.md}`};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.light};
`;

const PageTitle = styled.h1`
  font-size: ${({ theme }) => theme.typography.fontSizes.xl};
  font-weight: ${({ theme }) => theme.typography.fontWeights.semibold};
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0;
`;

const HeaderControls = styled.div`
  display: flex;
  align-items: center;
`;

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
    dispatch(logout());
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
