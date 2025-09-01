import styled from 'styled-components';
import { Select, Card } from 'antd';

export const PageContainer = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  padding-bottom: ${({ theme }) => theme.spacing.lg};
`;

export const FilterContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

export const FilterGroup = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
`;

export const FilterLabel = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
`;

export const StyledSelect = styled(Select)`
  .ant-select-selector {
    border-color: ${({ theme }) => theme.colors.border.medium} !important;
  }
`;

export const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 300px;
`;

export const EmptyContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 300px;
  background-color: ${({ theme }) => theme.colors.background.secondary};
  border-radius: ${({ theme }) => theme.borderRadius.md};
`;

export const StatsCardsContainer = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

export const StatCard = styled(Card)`
  display: flex;
  align-items: center;
  height: 100%;
  
  .ant-card-body {
    display: flex;
    align-items: center;
    padding: ${({ theme }) => theme.spacing.md};
    width: 100%;
  }
`;

export const StatIcon = styled.div<{ color: string }>`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${({ color }) => `${color}20`};
  color: ${({ color }) => color};
  font-size: 24px;
  margin-right: ${({ theme }) => theme.spacing.md};
`;

export const StatContent = styled.div`
  display: flex;
  flex-direction: column;
`;

export const StatValue = styled.div`
  font-size: ${({ theme }) => theme.fontSizes.xl};
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text.primary};
`;

export const StatTitle = styled.div`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
`;

export const ChartsContainer = styled.div`
  margin-top: ${({ theme }) => theme.spacing.lg};
`;

export const ChartCard = styled(Card)`
  height: 100%;
  
  .ant-card-head {
    border-bottom: 1px solid ${({ theme }) => theme.colors.border.weak};
  }
  
  .ant-card-head-title {
    font-size: ${({ theme }) => theme.fontSizes.md};
    font-weight: 600;
  }
  
  .ant-card-body {
    padding: ${({ theme }) => theme.spacing.md};
  }
`;

export const ChartWrapper = styled.div`
  height: 300px;
  position: relative;
`;