import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { logout } from '../store/slices/authSlice';
import { toggleSidebar } from '../store/slices/uiSlice';
import styled from 'styled-components';

// Icons import
import {
  HomeOutlined,
  ProjectOutlined,
  FileTextOutlined,
  BarChartOutlined,
  SettingOutlined,
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  LogoutOutlined,
  UserOutlined,
} from '@ant-design/icons';

const MainLayout: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector((state: RootState) => state.auth);
  const { sidebarCollapsed } = useSelector((state: RootState) => state.ui);
  
  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };
  
  const handleToggleSidebar = () => {
    dispatch(toggleSidebar());
  };
  
  // Check if path is active
  const isActive = (path: string) => {
    return location.pathname.startsWith(path);
  };
  
  return (
    <LayoutContainer>
      <Sidebar collapsed={sidebarCollapsed}>
        <SidebarHeader>
          <Logo collapsed={sidebarCollapsed}>
            {sidebarCollapsed ? 'PM' : 'Project Manager'}
          </Logo>
          <CollapseButton onClick={handleToggleSidebar}>
            {sidebarCollapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          </CollapseButton>
        </SidebarHeader>
        
        <NavMenu>
          <NavItem 
            active={isActive('/dashboard')} 
            onClick={() => navigate('/dashboard')}
          >
            <NavIcon><HomeOutlined /></NavIcon>
            {!sidebarCollapsed && <NavText>Dashboard</NavText>}
          </NavItem>
          
          <NavItem 
            active={isActive('/projects')} 
            onClick={() => navigate('/dashboard')}
          >
            <NavIcon><ProjectOutlined /></NavIcon>
            {!sidebarCollapsed && <NavText>Projects</NavText>}
          </NavItem>
          
          <NavItem 
            active={isActive('/notes')} 
            onClick={() => navigate('/notes')}
          >
            <NavIcon><FileTextOutlined /></NavIcon>
            {!sidebarCollapsed && <NavText>Notes</NavText>}
          </NavItem>
          
          <NavItem 
            active={isActive('/statistics')} 
            onClick={() => navigate('/statistics')}
          >
            <NavIcon><BarChartOutlined /></NavIcon>
            {!sidebarCollapsed && <NavText>Statistics</NavText>}
          </NavItem>
          
          <NavItem 
            active={isActive('/settings')} 
            onClick={() => navigate('/settings')}
          >
            <NavIcon><SettingOutlined /></NavIcon>
            {!sidebarCollapsed && <NavText>Settings</NavText>}
          </NavItem>
        </NavMenu>
        
        <SidebarFooter>
          <UserProfile collapsed={sidebarCollapsed}>
            <UserAvatar>
              <UserOutlined />
            </UserAvatar>
            {!sidebarCollapsed && (
              <UserInfo>
                <UserName>{user?.username}</UserName>
              </UserInfo>
            )}
          </UserProfile>
          
          <LogoutButton onClick={handleLogout}>
            <LogoutOutlined />
            {!sidebarCollapsed && <span>Logout</span>}
          </LogoutButton>
        </SidebarFooter>
      </Sidebar>
      
      <MainContent>
        <Outlet />
      </MainContent>
    </LayoutContainer>
  );
};

const LayoutContainer = styled.div`
  display: flex;
  height: 100%;
  width: 100%;
`;

const Sidebar = styled.div<{ collapsed: boolean }>`
  width: ${({ collapsed }) => (collapsed ? '80px' : '240px')};
  height: 100%;
  background-color: ${({ theme }) => theme.colors.background.secondary};
  border-right: 1px solid ${({ theme }) => theme.colors.border.light};
  display: flex;
  flex-direction: column;
  transition: width ${({ theme }) => theme.transition.normal};
  overflow: hidden;
`;

const MainContent = styled.main`
  flex: 1;
  height: 100%;
  overflow: auto;
  padding: ${({ theme }) => theme.spacing.md};
`;

const SidebarHeader = styled.div`
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 ${({ theme }) => theme.spacing.md};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.light};
`;

const Logo = styled.div<{ collapsed: boolean }>`
  font-size: ${({ collapsed, theme }) => 
    collapsed ? theme.fontSizes.md : theme.fontSizes.lg};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  color: ${({ theme }) => theme.colors.accent.primary};
  white-space: nowrap;
`;

const CollapseButton = styled.button`
  background: transparent;
  border: none;
  color: ${({ theme }) => theme.colors.text.secondary};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: ${({ theme }) => theme.borderRadius.full};
  
  &:hover {
    background-color: ${({ theme }) => theme.colors.background.tertiary};
    color: ${({ theme }) => theme.colors.text.primary};
  }
  
  svg {
    font-size: 16px;
  }
`;

const NavMenu = styled.nav`
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: ${({ theme }) => theme.spacing.md} 0;
  overflow-y: auto;
`;

const NavItem = styled.div<{ active: boolean }>`
  display: flex;
  align-items: center;
  height: 48px;
  padding: 0 ${({ theme }) => theme.spacing.md};
  cursor: pointer;
  color: ${({ active, theme }) => 
    active ? theme.colors.accent.primary : theme.colors.text.primary};
  background-color: ${({ active, theme }) => 
    active ? `${theme.colors.accent.primary}10` : 'transparent'};
  border-left: 3px solid ${({ active, theme }) => 
    active ? theme.colors.accent.primary : 'transparent'};
  
  &:hover {
    background-color: ${({ theme, active }) => 
      active ? `${theme.colors.accent.primary}10` : theme.colors.background.tertiary};
  }
`;

const NavIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  font-size: 18px;
`;

const NavText = styled.span`
  margin-left: ${({ theme }) => theme.spacing.sm};
  white-space: nowrap;
`;

const SidebarFooter = styled.div`
  padding: ${({ theme }) => theme.spacing.md};
  border-top: 1px solid ${({ theme }) => theme.colors.border.light};
`;

const UserProfile = styled.div<{ collapsed: boolean }>`
  display: flex;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const UserAvatar = styled.div`
  width: 36px;
  height: 36px;
  border-radius: ${({ theme }) => theme.borderRadius.full};
  background-color: ${({ theme }) => theme.colors.accent.primary};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
`;

const UserInfo = styled.div`
  margin-left: ${({ theme }) => theme.spacing.sm};
  overflow: hidden;
`;

const UserName = styled.div`
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
`;

const LogoutButton = styled.button`
  width: 100%;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: transparent;
  border: 1px solid ${({ theme }) => theme.colors.border.medium};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  color: ${({ theme }) => theme.colors.text.primary};
  cursor: pointer;
  
  &:hover {
    background-color: ${({ theme }) => theme.colors.background.tertiary};
    border-color: ${({ theme }) => theme.colors.border.strong};
  }
  
  span {
    margin-left: ${({ theme }) => theme.spacing.sm};
  }
`;

export default MainLayout;
