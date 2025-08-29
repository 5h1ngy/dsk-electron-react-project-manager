import styled from 'styled-components';

export const LayoutContainer = styled.div`
  display: flex;
  width: 100%;
  height: 100vh;
  overflow: hidden;
  background-color: ${({ theme }) => theme.colors.background.secondary};
  padding: ${({ theme }) => theme.spacing.xl};
`;

export const Sidebar = styled.div`
  width: 250px;
  background-color: ${({ theme }) => theme.colors.background.secondary};
  border-right: 1px solid ${({ theme }) => theme.colors.border.light};
  display: flex;
  flex-direction: column;
  transition: width ${({ theme }) => theme.transition.normal};
  overflow-y: auto;
`;

export const SidebarHeader = styled.div`
  padding: ${({ theme }) => `${theme.spacing.md} ${theme.spacing.md}`};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.light};
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

export const Logo = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSizes.lg};
  font-weight: ${({ theme }) => theme.typography.fontWeights.bold};
  color: ${({ theme }) => theme.colors.primary.main};
`;

export const NavSection = styled.div`
  padding: ${({ theme }) => theme.spacing.md};
`;

export const NavSectionTitle = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSizes.xs};
  text-transform: uppercase;
  letter-spacing: 1px;
  color: ${({ theme }) => theme.colors.text.tertiary};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
  padding-left: ${({ theme }) => theme.spacing.xs};
`;

export const NavItem = styled.div<{ $isActive: boolean }>`
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

export const NavItemIcon = styled.span`
  margin-right: ${({ theme }) => theme.spacing.sm};
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
`;

export const SidebarFooter = styled.div`
  margin-top: auto;
  padding: ${({ theme }) => theme.spacing.md};
  border-top: 1px solid ${({ theme }) => theme.colors.border.light};
`;

export const UserSection = styled.div`
  display: flex;
  align-items: center;
`;

export const Avatar = styled.div`
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

export const UserInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

export const Username = styled.div`
  font-weight: ${({ theme }) => theme.typography.fontWeights.medium};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const UserRole = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSizes.xs};
  color: ${({ theme }) => theme.colors.text.tertiary};
`;

export const LogoutButton = styled.button`
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

export const MainContent = styled.div`
  flex: 1;
  overflow: auto;
  padding: ${({ theme }) => theme.spacing.xl};
  background-color: ${({ theme }) => theme.colors.background.primary};
  
  border-radius: ${({ theme }) => theme.borderRadius.lg};
`;

export const Header = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${({ theme }) => `${theme.spacing.md} ${theme.spacing.md}`};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.light};
`;

export const PageTitle = styled.h1`
  font-size: ${({ theme }) => theme.typography.fontSizes.xl};
  font-weight: ${({ theme }) => theme.typography.fontWeights.semibold};
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0;
`;

export const HeaderControls = styled.div`
  display: flex;
  align-items: center;
`;