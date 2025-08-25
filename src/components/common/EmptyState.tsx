import React from 'react';
import styled from 'styled-components';
import { InboxOutlined } from '@ant-design/icons';

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  actionLabel?: string;
  actionIcon?: React.ReactNode;
  onAction?: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon,
  actionLabel,
  actionIcon,
  onAction,
}) => {
  return (
    <Container>
      <IconWrapper>
        {icon || <InboxOutlined />}
      </IconWrapper>
      <Title>{title}</Title>
      {description && <Description>{description}</Description>}
      {actionLabel && (
        <ActionButton onClick={onAction}>
          {actionIcon && <ActionIcon>{actionIcon}</ActionIcon>}
          {actionLabel}
        </ActionButton>
      )}
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing.xl} ${({ theme }) => theme.spacing.md};
  text-align: center;
  min-height: 240px;
  background-color: ${({ theme }) => theme.colors.background.secondary};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
`;

const IconWrapper = styled.div`
  font-size: 48px;
  color: ${({ theme }) => theme.colors.text.tertiary};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const Title = styled.h3`
  font-size: ${({ theme }) => theme.fontSizes.lg};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0 0 ${({ theme }) => theme.spacing.sm} 0;
`;

const Description = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.md};
  color: ${({ theme }) => theme.colors.text.secondary};
  margin: 0 0 ${({ theme }) => theme.spacing.lg} 0;
  max-width: 400px;
`;

const ActionButton = styled.button`
  height: 40px;
  padding: 0 ${({ theme }) => theme.spacing.md};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  background-color: ${({ theme }) => theme.colors.accent.primary};
  color: white;
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  cursor: pointer;
  transition: background-color ${({ theme }) => theme.transition.fast};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  
  &:hover {
    background-color: ${({ theme }) => theme.colors.accent.secondary};
  }
`;

const ActionIcon = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
`;

export default EmptyState;
