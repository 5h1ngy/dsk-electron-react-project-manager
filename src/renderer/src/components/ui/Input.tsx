import React, { InputHTMLAttributes, ReactNode, forwardRef } from 'react';
import styled, { css } from 'styled-components';

export type InputSize = 'small' | 'medium' | 'large';
export type InputStatus = 'default' | 'error' | 'success' | 'warning';

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  helper?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  size?: InputSize;
  status?: InputStatus;
  fullWidth?: boolean;
}

const getSizeStyles = (size: InputSize) => {
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

const getStatusStyles = (status: InputStatus) => {
  switch (status) {
    case 'error':
      return css`
        border-color: ${({ theme }) => theme.colors.status.error};
        &:focus {
          border-color: ${({ theme }) => theme.colors.status.error};
          box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.status.error}30;
        }
      `;
    case 'success':
      return css`
        border-color: ${({ theme }) => theme.colors.status.success};
        &:focus {
          border-color: ${({ theme }) => theme.colors.status.success};
          box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.status.success}30;
        }
      `;
    case 'warning':
      return css`
        border-color: ${({ theme }) => theme.colors.status.warning};
        &:focus {
          border-color: ${({ theme }) => theme.colors.status.warning};
          box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.status.warning}30;
        }
      `;
    case 'default':
    default:
      return css`
        border-color: ${({ theme }) => theme.colors.border.medium};
        &:focus {
          border-color: ${({ theme }) => theme.colors.primary.main};
          box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.primary.main}30;
        }
      `;
  }
};

const InputContainer = styled.div<{ $fullWidth: boolean }>`
  display: flex;
  flex-direction: column;
  width: ${({ $fullWidth }) => ($fullWidth ? '100%' : 'auto')};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const InputLabel = styled.label`
  font-size: ${({ theme }) => theme.typography.fontSizes.sm};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
  color: ${({ theme }) => theme.colors.text.secondary};
  font-weight: ${({ theme }) => theme.typography.fontWeights.medium};
`;

const InputWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const StyledInput = styled.input<{
  $size: InputSize;
  $status: InputStatus;
  $hasLeftIcon: boolean;
  $hasRightIcon: boolean;
}>`
  width: 100%;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  border: 1px solid;
  outline: none;
  background-color: ${({ theme }) => theme.colors.background.secondary};
  color: ${({ theme }) => theme.colors.text.primary};
  transition: all ${({ theme }) => theme.transition.fast};
  
  ${({ $size }) => getSizeStyles($size)}
  ${({ $status }) => getStatusStyles($status)}
  
  padding-left: ${({ $hasLeftIcon, theme, $size }) =>
    $hasLeftIcon ? ($size === 'large' ? '3rem' : $size === 'medium' ? '2.5rem' : '2rem') : ''};
  
  padding-right: ${({ $hasRightIcon, theme, $size }) =>
    $hasRightIcon ? ($size === 'large' ? '3rem' : $size === 'medium' ? '2.5rem' : '2rem') : ''};
  
  &::placeholder {
    color: ${({ theme }) => theme.colors.text.tertiary};
  }
  
  &:disabled {
    background-color: ${({ theme }) => theme.colors.background.tertiary};
    cursor: not-allowed;
    opacity: 0.7;
  }
`;

const LeftIconWrapper = styled.div<{ $size: InputSize }>`
  position: absolute;
  left: ${({ theme, $size }) => ($size === 'large' ? theme.spacing.md : theme.spacing.sm)};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.text.tertiary};
`;

const RightIconWrapper = styled.div<{ $size: InputSize }>`
  position: absolute;
  right: ${({ theme, $size }) => ($size === 'large' ? theme.spacing.md : theme.spacing.sm)};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.text.tertiary};
`;

const HelperText = styled.span<{ $status: InputStatus }>`
  font-size: ${({ theme }) => theme.typography.fontSizes.sm};
  margin-top: ${({ theme }) => theme.spacing.xs};
  
  color: ${({ theme, $status }) => {
    switch ($status) {
      case 'error':
        return theme.colors.status.error;
      case 'success':
        return theme.colors.status.success;
      case 'warning':
        return theme.colors.status.warning;
      case 'default':
      default:
        return theme.colors.text.tertiary;
    }
  }};
`;

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      helper,
      leftIcon,
      rightIcon,
      size = 'medium',
      status = 'default',
      fullWidth = true,
      ...rest
    },
    ref
  ) => {
    return (
      <InputContainer $fullWidth={fullWidth}>
        {label && <InputLabel>{label}</InputLabel>}
        <InputWrapper>
          {leftIcon && <LeftIconWrapper $size={size}>{leftIcon}</LeftIconWrapper>}
          <StyledInput
            ref={ref}
            $size={size}
            $status={status}
            $hasLeftIcon={!!leftIcon}
            $hasRightIcon={!!rightIcon}
            {...rest}
          />
          {rightIcon && <RightIconWrapper $size={size}>{rightIcon}</RightIconWrapper>}
        </InputWrapper>
        {helper && <HelperText $status={status}>{helper}</HelperText>}
      </InputContainer>
    );
  }
);

Input.displayName = 'Input';

export default Input;
