import React, { ButtonHTMLAttributes, ReactNode } from 'react';
import styled, { css } from 'styled-components';

export type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'ghost' | 'danger';
export type ButtonSize = 'small' | 'medium' | 'large';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  isLoading?: boolean;
}

const getVariantStyles = (variant: ButtonVariant) => {
  switch (variant) {
    case 'primary':
      return css`
        background-color: ${({ theme }) => theme.colors.primary.main};
        color: ${({ theme }) => theme.colors.text.inverse};
        border: 1px solid ${({ theme }) => theme.colors.primary.main};
        
        &:hover:not(:disabled) {
          background-color: ${({ theme }) => theme.colors.primary.dark};
          border-color: ${({ theme }) => theme.colors.primary.dark};
        }
        
        &:active:not(:disabled) {
          background-color: ${({ theme }) => theme.colors.primary.dark};
          transform: translateY(1px);
        }
      `;
    case 'secondary':
      return css`
        background-color: ${({ theme }) => theme.colors.secondary.main};
        color: ${({ theme }) => theme.colors.text.inverse};
        border: 1px solid ${({ theme }) => theme.colors.secondary.main};
        
        &:hover:not(:disabled) {
          background-color: ${({ theme }) => theme.colors.secondary.dark};
          border-color: ${({ theme }) => theme.colors.secondary.dark};
        }
        
        &:active:not(:disabled) {
          background-color: ${({ theme }) => theme.colors.secondary.dark};
          transform: translateY(1px);
        }
      `;
    case 'tertiary':
      return css`
        background-color: transparent;
        color: ${({ theme }) => theme.colors.primary.main};
        border: 1px solid ${({ theme }) => theme.colors.primary.main};
        
        &:hover:not(:disabled) {
          background-color: ${({ theme }) => `${theme.colors.primary.main}10`};
        }
        
        &:active:not(:disabled) {
          background-color: ${({ theme }) => `${theme.colors.primary.main}20`};
          transform: translateY(1px);
        }
      `;
    case 'ghost':
      return css`
        background-color: transparent;
        color: ${({ theme }) => theme.colors.text.primary};
        border: 1px solid transparent;
        
        &:hover:not(:disabled) {
          background-color: ${({ theme }) => theme.colors.background.tertiary};
        }
        
        &:active:not(:disabled) {
          background-color: ${({ theme }) => theme.colors.background.tertiary};
          transform: translateY(1px);
        }
      `;
    case 'danger':
      return css`
        background-color: ${({ theme }) => theme.colors.status.error};
        color: ${({ theme }) => theme.colors.text.inverse};
        border: 1px solid ${({ theme }) => theme.colors.status.error};
        
        &:hover:not(:disabled) {
          background-color: ${({ theme }) => theme.colors.status.error}e0;
          border-color: ${({ theme }) => theme.colors.status.error}e0;
        }
        
        &:active:not(:disabled) {
          background-color: ${({ theme }) => theme.colors.status.error}c0;
          transform: translateY(1px);
        }
      `;
    default:
      return '';
  }
};

const getSizeStyles = (size: ButtonSize) => {
  switch (size) {
    case 'small':
      return css`
        height: 32px;
        padding: 0 ${({ theme }) => theme.spacing.sm};
        font-size: ${({ theme }) => theme.typography.fontSizes.sm};
      `;
    case 'medium':
      return css`
        height: 40px;
        padding: 0 ${({ theme }) => theme.spacing.md};
        font-size: ${({ theme }) => theme.typography.fontSizes.md};
      `;
    case 'large':
      return css`
        height: 48px;
        padding: 0 ${({ theme }) => theme.spacing.lg};
        font-size: ${({ theme }) => theme.typography.fontSizes.lg};
      `;
    default:
      return '';
  }
};

const StyledButton = styled.button<{
  $variant: ButtonVariant;
  $size: ButtonSize;
  $fullWidth: boolean;
  $hasIcon: boolean;
  $iconPosition: 'left' | 'right';
}>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.xs};
  font-weight: ${({ theme }) => theme.typography.fontWeights.medium};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  cursor: pointer;
  transition: all ${({ theme }) => theme.transition.fast};
  white-space: nowrap;
  outline: none;
  width: ${({ $fullWidth }) => ($fullWidth ? '100%' : 'auto')};
  flex-direction: ${({ $iconPosition }) => ($iconPosition === 'right' ? 'row-reverse' : 'row')};
  
  ${({ $variant }) => getVariantStyles($variant)}
  ${({ $size }) => getSizeStyles($size)}
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  
  &:focus-visible {
    box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.primary.light}80;
  }
`;

const Loader = styled.span`
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: ${({ theme }) => theme.colors.text.inverse};
  animation: spin 0.8s linear infinite;
  margin-right: ${({ theme }) => theme.spacing.xs};
  
  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'medium',
  icon,
  iconPosition = 'left',
  fullWidth = false,
  isLoading = false,
  disabled,
  ...rest
}) => {
  return (
    <StyledButton
      $variant={variant}
      $size={size}
      $fullWidth={fullWidth}
      $hasIcon={!!icon}
      $iconPosition={iconPosition}
      disabled={disabled || isLoading}
      {...rest}
    >
      {isLoading && <Loader />}
      {!isLoading && icon}
      {children}
    </StyledButton>
  );
};

export default Button;
