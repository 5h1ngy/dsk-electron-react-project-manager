import styled from 'styled-components';

import Input from '@renderer/components/ui/Input';

export const DashboardContainer = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
`;

export const DashboardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

export const HeaderTitle = styled.h1`
  font-size: ${({ theme }) => theme.typography.fontSizes.xxl};
  font-weight: ${({ theme }) => theme.typography.fontWeights.bold};
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0;
`;

export const HeaderActions = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
`;

export const PlusIcon = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSizes.lg};
  font-weight: ${({ theme }) => theme.typography.fontWeights.bold};
`;

export const ToolBar = styled.div`
  display: flex;
  align-items: center;
  padding: ${({ theme }) => theme.spacing.md};
  background-color: ${({ theme }) => theme.colors.background.secondary};
  border-radius: 0 ${({ theme }) => theme.borderRadius.lg} 0 ${({ theme }) => theme.borderRadius.lg};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

export const ViewModeContainer = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.xs};
  margin-right: ${({ theme }) => theme.spacing.md};
`;

export const ViewModeButton = styled.button<{ $active: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  background-color: ${({ theme, $active }) =>
    $active ? theme.colors.primary.main : 'transparent'};
  color: ${({ theme, $active }) =>
    $active ? theme.colors.text.inverse : theme.colors.text.secondary};
  border: none;
  cursor: pointer;
  transition: all ${({ theme }) => theme.transition.fast};
  
  &:hover {
    background-color: ${({ theme, $active }) =>
    $active ? theme.colors.primary.dark : theme.colors.background.tertiary};
  }
  
  span {
    font-size: 18px;
  }
`;

export const SearchContainer = styled.div`
  flex: 1;
  margin-right: ${({ theme }) => theme.spacing.md};
`;

export const StyledInput = styled(Input)`
  margin-bottom: 0;
`;

export const FilterButton = styled.button<{ $active: boolean }>`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  background-color: ${({ theme, $active }) =>
    $active ? theme.colors.primary.main : 'transparent'};
  color: ${({ theme, $active }) =>
    $active ? theme.colors.text.inverse : theme.colors.text.secondary};
  border: none;
  cursor: pointer;
  transition: all ${({ theme }) => theme.transition.fast};
  
  &:hover {
    background-color: ${({ theme, $active }) =>
    $active ? theme.colors.primary.dark : theme.colors.background.tertiary};
  }
  
  span {
    font-size: 18px;
  }
`;

export const BadgeContainer = styled.div`
  position: absolute;
  top: -5px;
  right: -5px;
`;

export const FilterContainer = styled.div`
  padding: ${({ theme }) => theme.spacing.md};
  background-color: ${({ theme }) => theme.colors.background.secondary};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

export const FilterHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

export const FilterTitle = styled.h3`
  font-size: ${({ theme }) => theme.typography.fontSizes.lg};
  font-weight: ${({ theme }) => theme.typography.fontWeights.medium};
  margin: 0;
`;

export const ProjectsContainer = styled.div`
  flex: 1;
  overflow: auto;
`;

export const CardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: ${({ theme }) => theme.spacing.lg};
`;

export const LoadingContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.fontSizes.lg};
`;

export const ErrorMessage = styled.div`
  padding: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.md};
  background-color: ${({ theme }) => theme.colors.status.error}15;
  border-left: 3px solid ${({ theme }) => theme.colors.status.error};
  color: ${({ theme }) => theme.colors.status.error};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
`;

export const EmptyStateContainer = styled.div`
  max-width: 600px;
  margin: 0 auto;
  padding: ${({ theme }) => theme.spacing.xl} 0;
`;

export const EmptyStateContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: ${({ theme }) => theme.spacing.xl};
`;

export const EmptyStateIcon = styled.div`
  font-size: 48px;
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

export const EmptyStateTitle = styled.h3`
  font-size: ${({ theme }) => theme.typography.fontSizes.xl};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
  color: ${({ theme }) => theme.colors.text.primary};
`;

export const EmptyStateDescription = styled.p`
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;
