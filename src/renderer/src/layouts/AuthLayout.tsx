import React, { useState } from 'react';
import { Outlet, Link } from 'react-router-dom';
import styled from 'styled-components';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { setThemeMode, ThemeMode } from '../store/slices/uiSlice';

// Icons
import {
  ImportOutlined,
  ExportOutlined,
  MoonOutlined,
  SunOutlined,
} from '@ant-design/icons';

const AuthLayout: React.FC = () => {
  const dispatch = useDispatch();
  const { themeMode } = useSelector((state: RootState) => state.ui);
  const [isImporting, setIsImporting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  
  const toggleTheme = () => {
    const newTheme: ThemeMode = themeMode === 'light' ? 'dark' : 'light';
    dispatch(setThemeMode(newTheme));
  };
  
  const handleImportDatabase = async () => {
    try {
      setIsImporting(true);
      setStatusMessage('Importing database...');
      
      const result = await window.api.importDatabase();
      
      if (result.success) {
        setStatusMessage('Database imported successfully. Please log in.');
      } else {
        setStatusMessage(`Import failed: ${result.message}`);
      }
    } catch (error) {
      setStatusMessage('Error during import. Please try again.');
      console.error('Import error:', error);
    } finally {
      setIsImporting(false);
    }
  };
  
  const handleExportDatabase = async () => {
    try {
      setIsExporting(true);
      setStatusMessage('Exporting database...');
      
      const result = await window.api.exportDatabase();
      
      if (result.success) {
        setStatusMessage('Database exported successfully.');
      } else {
        setStatusMessage(`Export failed: ${result.message}`);
      }
    } catch (error) {
      setStatusMessage('Error during export. Please try again.');
      console.error('Export error:', error);
    } finally {
      setIsExporting(false);
    }
  };
  
  return (
    <AuthContainer>
      <AuthPanel>
        <Header>
          <Logo>Project Manager</Logo>
          <ThemeToggle onClick={toggleTheme}>
            {themeMode === 'light' ? <MoonOutlined /> : <SunOutlined />}
          </ThemeToggle>
        </Header>
        
        <ContentArea>
          <Outlet />
        </ContentArea>
        
        <Footer>
          <DatabaseActions>
            <ActionButton 
              onClick={handleImportDatabase}
              disabled={isImporting || isExporting}
            >
              <ImportOutlined /> Import Database
            </ActionButton>
            <ActionButton 
              onClick={handleExportDatabase}
              disabled={isImporting || isExporting}
            >
              <ExportOutlined /> Export Database
            </ActionButton>
          </DatabaseActions>
          
          {statusMessage && (
            <StatusMessage>
              {statusMessage}
            </StatusMessage>
          )}
        </Footer>
      </AuthPanel>
    </AuthContainer>
  );
};

const AuthContainer = styled.div`
  height: 100%;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${({ theme }) => theme.colors.background.primary};
  padding: ${({ theme }) => theme.spacing.md};
`;

const AuthPanel = styled.div`
  width: 100%;
  max-width: 400px;
  background-color: ${({ theme }) => theme.colors.background.secondary};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  box-shadow: ${({ theme }) => theme.boxShadow.lg};
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const Header = styled.header`
  padding: ${({ theme }) => theme.spacing.lg};
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.light};
`;

const Logo = styled.h1`
  font-size: ${({ theme }) => theme.fontSizes.xl};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  color: ${({ theme }) => theme.colors.accent.primary};
  margin: 0;
`;

const ThemeToggle = styled.button`
  background: transparent;
  border: none;
  color: ${({ theme }) => theme.colors.text.secondary};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: ${({ theme }) => theme.borderRadius.full};
  
  &:hover {
    background-color: ${({ theme }) => theme.colors.background.tertiary};
    color: ${({ theme }) => theme.colors.text.primary};
  }
  
  svg {
    font-size: 20px;
  }
`;

const ContentArea = styled.main`
  padding: ${({ theme }) => theme.spacing.lg};
  flex: 1;
`;

const Footer = styled.footer`
  padding: ${({ theme }) => theme.spacing.lg};
  border-top: 1px solid ${({ theme }) => theme.colors.border.light};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
`;

const DatabaseActions = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
`;

const ActionButton = styled.button`
  flex: 1;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.sm};
  background-color: transparent;
  border: 1px solid ${({ theme }) => theme.colors.border.medium};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  color: ${({ theme }) => theme.colors.text.primary};
  cursor: pointer;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  
  &:hover:not(:disabled) {
    background-color: ${({ theme }) => theme.colors.background.tertiary};
    border-color: ${({ theme }) => theme.colors.border.strong};
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const StatusMessage = styled.div`
  padding: ${({ theme }) => theme.spacing.sm};
  text-align: center;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
`;

export default AuthLayout;
