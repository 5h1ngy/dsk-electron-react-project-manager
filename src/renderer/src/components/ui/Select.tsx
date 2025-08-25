import React, { forwardRef, useEffect, useRef, useState } from 'react';
import styled, { css } from 'styled-components';

export type SelectSize = 'small' | 'medium' | 'large';
export type SelectStatus = 'default' | 'error' | 'success' | 'warning';

export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

export interface SelectProps {
  options: SelectOption[];
  value?: string | number;
  defaultValue?: string | number;
  onChange?: (value: string | number) => void;
  placeholder?: string;
  label?: string;
  helper?: string;
  size?: SelectSize;
  status?: SelectStatus;
  disabled?: boolean;
  fullWidth?: boolean;
  className?: string;
}

const getSizeStyles = (size: SelectSize) => {
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

const getStatusStyles = (status: SelectStatus) => {
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

const SelectContainer = styled.div<{ $fullWidth: boolean }>`
  display: flex;
  flex-direction: column;
  width: ${({ $fullWidth }) => ($fullWidth ? '100%' : 'auto')};
  margin-bottom: ${({ theme }) => theme.spacing.md};
  position: relative;
`;

const SelectLabel = styled.label`
  font-size: ${({ theme }) => theme.typography.fontSizes.sm};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
  color: ${({ theme }) => theme.colors.text.secondary};
  font-weight: ${({ theme }) => theme.typography.fontWeights.medium};
`;

const SelectTrigger = styled.div<{
  $size: SelectSize;
  $status: SelectStatus;
  $isOpen: boolean;
  $disabled: boolean;
}>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  border: 1px solid;
  background-color: ${({ theme }) => theme.colors.background.secondary};
  color: ${({ theme }) => theme.colors.text.primary};
  cursor: ${({ $disabled }) => ($disabled ? 'not-allowed' : 'pointer')};
  user-select: none;
  transition: all ${({ theme }) => theme.transition.fast};
  
  ${({ $size }) => getSizeStyles($size)}
  ${({ $status }) => getStatusStyles($status)}
  
  ${({ $isOpen, theme }) =>
    $isOpen &&
    css`
      border-color: ${theme.colors.primary.main};
      box-shadow: 0 0 0 2px ${theme.colors.primary.main}30;
    `}
  
  ${({ $disabled, theme }) =>
    $disabled &&
    css`
      background-color: ${theme.colors.background.tertiary};
      opacity: 0.7;
    `}
`;

const SelectValue = styled.div<{ $hasValue: boolean }>`
  color: ${({ $hasValue, theme }) =>
    $hasValue ? theme.colors.text.primary : theme.colors.text.tertiary};
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const SelectIcon = styled.div<{ $isOpen: boolean }>`
  margin-left: ${({ theme }) => theme.spacing.sm};
  transition: transform ${({ theme }) => theme.transition.fast};
  transform: ${({ $isOpen }) => ($isOpen ? 'rotate(180deg)' : 'rotate(0)')};
  display: flex;
  align-items: center;
  
  &::after {
    content: '';
    display: block;
    width: 0.6em;
    height: 0.6em;
    border-right: 2px solid currentColor;
    border-bottom: 2px solid currentColor;
    transform: rotate(45deg);
  }
`;

const SelectOptions = styled.div<{
  $size: SelectSize;
  $isOpen: boolean;
}>`
  position: absolute;
  z-index: ${({ theme }) => theme.zIndex.dropdown};
  width: 100%;
  background-color: ${({ theme }) => theme.colors.background.secondary};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  box-shadow: ${({ theme }) => theme.shadows.md};
  margin-top: ${({ theme }) => theme.spacing.xs};
  max-height: 240px;
  overflow-y: auto;
  display: ${({ $isOpen }) => ($isOpen ? 'block' : 'none')};
  border: 1px solid ${({ theme }) => theme.colors.border.medium};
`;

const SelectOption = styled.div<{
  $isSelected: boolean;
  $isDisabled: boolean;
  $size: SelectSize;
}>`
  padding: ${({ theme, $size }) =>
    $size === 'large'
      ? `${theme.spacing.sm} ${theme.spacing.lg}`
      : $size === 'medium'
      ? `${theme.spacing.xs} ${theme.spacing.md}`
      : `${theme.spacing.xs} ${theme.spacing.sm}`};
  cursor: ${({ $isDisabled }) => ($isDisabled ? 'not-allowed' : 'pointer')};
  transition: background-color ${({ theme }) => theme.transition.fast};
  opacity: ${({ $isDisabled }) => ($isDisabled ? 0.5 : 1)};
  
  ${({ $isSelected, theme }) =>
    $isSelected
      ? css`
          background-color: ${theme.colors.primary.main}20;
          color: ${theme.colors.primary.main};
          font-weight: ${theme.typography.fontWeights.medium};
        `
      : css`
          &:hover:not(:disabled) {
            background-color: ${theme.colors.background.tertiary};
          }
        `}
`;

const HelperText = styled.span<{ $status: SelectStatus }>`
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

export const Select = forwardRef<HTMLDivElement, SelectProps>(
  (
    {
      options,
      value,
      defaultValue,
      onChange,
      placeholder = 'Seleziona un\'opzione',
      label,
      helper,
      size = 'medium',
      status = 'default',
      disabled = false,
      fullWidth = true,
      className,
    },
    ref
  ) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedValue, setSelectedValue] = useState<string | number | undefined>(
      value !== undefined ? value : defaultValue
    );
    const containerRef = useRef<HTMLDivElement>(null);
    
    // Gestisce i click esterni per chiudere il dropdown
    useEffect(() => {
      const handleOutsideClick = (event: MouseEvent) => {
        if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
          setIsOpen(false);
        }
      };
      
      document.addEventListener('mousedown', handleOutsideClick);
      return () => {
        document.removeEventListener('mousedown', handleOutsideClick);
      };
    }, []);
    
    // Aggiorna lo stato locale quando cambia il value esterno
    useEffect(() => {
      if (value !== undefined) {
        setSelectedValue(value);
      }
    }, [value]);
    
    const handleToggle = () => {
      if (!disabled) {
        setIsOpen(!isOpen);
      }
    };
    
    const handleOptionSelect = (option: SelectOption) => {
      if (option.disabled) return;
      
      setSelectedValue(option.value);
      onChange && onChange(option.value);
      setIsOpen(false);
    };
    
    const getSelectedLabel = () => {
      const selected = options.find(option => option.value === selectedValue);
      return selected ? selected.label : placeholder;
    };
    
    return (
      <SelectContainer ref={containerRef} $fullWidth={fullWidth} className={className}>
        {label && <SelectLabel>{label}</SelectLabel>}
        <SelectTrigger
          ref={ref}
          $size={size}
          $status={status}
          $isOpen={isOpen}
          $disabled={disabled}
          onClick={handleToggle}
        >
          <SelectValue $hasValue={selectedValue !== undefined}>
            {getSelectedLabel()}
          </SelectValue>
          <SelectIcon $isOpen={isOpen} />
        </SelectTrigger>
        
        <SelectOptions $size={size} $isOpen={isOpen}>
          {options.map(option => (
            <SelectOption
              key={option.value}
              $isSelected={selectedValue === option.value}
              $isDisabled={!!option.disabled}
              $size={size}
              onClick={() => handleOptionSelect(option)}
            >
              {option.label}
            </SelectOption>
          ))}
        </SelectOptions>
        
        {helper && <HelperText $status={status}>{helper}</HelperText>}
      </SelectContainer>
    );
  }
);

Select.displayName = 'Select';

export default Select;
