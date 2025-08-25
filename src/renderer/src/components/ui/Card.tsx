import React, { ReactNode } from 'react';
import styled, { css } from 'styled-components';

export type CardVariant = 'default' | 'outlined' | 'elevated';

export interface CardProps {
  children: ReactNode;
  variant?: CardVariant;
  title?: ReactNode;
  footer?: ReactNode;
  padding?: boolean;
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
}

const getVariantStyles = (variant: CardVariant) => {
  switch (variant) {
    case 'outlined':
      return css`
        border: 1px solid ${({ theme }) => theme.colors.border.light};
        background-color: transparent;
      `;
    case 'elevated':
      return css`
        border: none;
        background-color: ${({ theme }) => theme.colors.background.tertiary};
        box-shadow: ${({ theme }) => theme.shadows.md};
      `;
    case 'default':
    default:
      return css`
        border: 1px solid ${({ theme }) => theme.colors.border.light};
        background-color: ${({ theme }) => theme.colors.background.tertiary};
      `;
  }
};

const CardContainer = styled.div<{
  $variant: CardVariant;
  $hoverable: boolean;
  $isClickable: boolean;
}>`
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  overflow: hidden;
  transition: all ${({ theme }) => theme.transition.normal};
  
  ${({ $variant }) => getVariantStyles($variant)}
  
  ${({ $hoverable, $isClickable, theme }) =>
    ($hoverable || $isClickable) &&
    css`
      cursor: ${$isClickable ? 'pointer' : 'default'};
      &:hover {
        transform: translateY(-2px);
        box-shadow: ${theme.shadows.lg};
      }
    `}
`;

const CardHeader = styled.div`
  padding: ${({ theme }) => `${theme.spacing.md} ${theme.spacing.lg}`};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.light};
  font-weight: ${({ theme }) => theme.typography.fontWeights.semibold};
  font-size: ${({ theme }) => theme.typography.fontSizes.lg};
`;

const CardBody = styled.div<{ $hasPadding: boolean }>`
  ${({ $hasPadding, theme }) =>
    $hasPadding &&
    css`
      padding: ${theme.spacing.lg};
    `}
`;

const CardFooter = styled.div`
  padding: ${({ theme }) => `${theme.spacing.md} ${theme.spacing.lg}`};
  border-top: 1px solid ${({ theme }) => theme.colors.border.light};
`;

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  title,
  footer,
  padding = true,
  className,
  onClick,
  hoverable = false,
}) => {
  return (
    <CardContainer
      $variant={variant}
      $hoverable={hoverable}
      $isClickable={!!onClick}
      className={className}
      onClick={onClick}
    >
      {title && <CardHeader>{title}</CardHeader>}
      <CardBody $hasPadding={padding}>{children}</CardBody>
      {footer && <CardFooter>{footer}</CardFooter>}
    </CardContainer>
  );
};

export default Card;
