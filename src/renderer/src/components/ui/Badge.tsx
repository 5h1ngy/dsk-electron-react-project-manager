import React, { ReactNode } from 'react';
import styled, { css } from 'styled-components';

export type BadgeVariant = 'default' | 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info';
export type BadgeSize = 'small' | 'medium' | 'large';

export interface BadgeProps {
  children?: ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  dot?: boolean;
  count?: number;
  maxCount?: number;
  showZero?: boolean;
  className?: string;
}

const getVariantStyles = (variant: BadgeVariant) => {
  switch (variant) {
    case 'primary':
      return css`
        background-color: ${({ theme }) => theme.colors.primary.main};
        color: ${({ theme }) => theme.colors.text.inverse};
      `;
    case 'secondary':
      return css`
        background-color: ${({ theme }) => theme.colors.secondary.main};
        color: ${({ theme }) => theme.colors.text.inverse};
      `;
    case 'success':
      return css`
        background-color: ${({ theme }) => theme.colors.status.success};
        color: ${({ theme }) => theme.colors.text.inverse};
      `;
    case 'error':
      return css`
        background-color: ${({ theme }) => theme.colors.status.error};
        color: ${({ theme }) => theme.colors.text.inverse};
      `;
    case 'warning':
      return css`
        background-color: ${({ theme }) => theme.colors.status.warning};
        color: ${({ theme }) => theme.colors.text.inverse};
      `;
    case 'info':
      return css`
        background-color: ${({ theme }) => theme.colors.status.info};
        color: ${({ theme }) => theme.colors.text.inverse};
      `;
    case 'default':
    default:
      return css`
        background-color: ${({ theme }) => theme.colors.background.tertiary};
        color: ${({ theme }) => theme.colors.text.secondary};
      `;
  }
};

const getSizeStyles = (size: BadgeSize) => {
  switch (size) {
    case 'small':
      return css`
        font-size: ${({ theme }) => theme.typography.fontSizes.xs};
        padding: 0 ${({ theme }) => theme.spacing.xs};
        height: 18px;
        min-width: 18px;
      `;
    case 'large':
      return css`
        font-size: ${({ theme }) => theme.typography.fontSizes.sm};
        padding: 0 ${({ theme }) => theme.spacing.sm};
        height: 24px;
        min-width: 24px;
      `;
    case 'medium':
    default:
      return css`
        font-size: ${({ theme }) => theme.typography.fontSizes.xs};
        padding: 0 ${({ theme }) => theme.spacing.sm};
        height: 22px;
        min-width: 22px;
      `;
  }
};

const BadgeWrapper = styled.div`
  position: relative;
  display: inline-flex;
`;

const BadgeContent = styled.span<{
  $variant: BadgeVariant;
  $size: BadgeSize;
  $standalone: boolean;
  $dot: boolean;
}>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: ${({ theme, $dot }) => ($dot ? '50%' : theme.borderRadius.md)};
  font-weight: ${({ theme }) => theme.typography.fontWeights.medium};
  white-space: nowrap;
  transition: all ${({ theme }) => theme.transition.fast};
  
  ${({ $variant }) => getVariantStyles($variant)}
  ${({ $size, $dot }) => ($dot ? getDotSizeStyles($size) : getSizeStyles($size))}
  
  ${({ $standalone }) =>
    $standalone
      ? css`
          position: relative;
        `
      : css`
          position: absolute;
          top: 0;
          right: 0;
          transform: translate(50%, -50%);
          z-index: 1;
        `}
`;

const getDotSizeStyles = (size: BadgeSize) => {
  switch (size) {
    case 'small':
      return css`
        width: 8px;
        height: 8px;
        min-width: 0;
        padding: 0;
      `;
    case 'large':
      return css`
        width: 12px;
        height: 12px;
        min-width: 0;
        padding: 0;
      `;
    case 'medium':
    default:
      return css`
        width: 10px;
        height: 10px;
        min-width: 0;
        padding: 0;
      `;
  }
};

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'medium',
  dot = false,
  count,
  maxCount = 99,
  showZero = false,
  className,
}) => {
  // Determina se visualizzare il badge in base al conteggio
  const showBadge = dot || (count !== undefined && (count > 0 || showZero));
  
  // Formatta il conteggio se necessario
  const formattedCount = count !== undefined ? 
    (count > maxCount ? `${maxCount}+` : count.toString()) : 
    undefined;
  
  // Se non c'è un valore da mostrare e non è un dot, non mostrare il badge
  if (!showBadge) {
    return <>{children}</>;
  }
  
  // Se non ci sono children, mostra solo il badge
  if (!children) {
    return (
      <BadgeContent
        $variant={variant}
        $size={size}
        $standalone={true}
        $dot={dot}
        className={className}
      >
        {dot ? null : formattedCount}
      </BadgeContent>
    );
  }
  
  // Altrimenti, mostra il badge insieme ai children
  return (
    <BadgeWrapper className={className}>
      {children}
      <BadgeContent
        $variant={variant}
        $size={size}
        $standalone={false}
        $dot={dot}
      >
        {dot ? null : formattedCount}
      </BadgeContent>
    </BadgeWrapper>
  );
};

export default Badge;
