import React from 'react';
import styled, { keyframes } from 'styled-components';

interface LoaderProps {
  size?: 'small' | 'medium' | 'large';
  text?: string;
}

const Loader: React.FC<LoaderProps> = ({ size = 'medium', text }) => {
  return (
    <LoaderContainer>
      <SpinnerContainer size={size}>
        <Spinner />
      </SpinnerContainer>
      {text && <LoadingText>{text}</LoadingText>}
    </LoaderContainer>
  );
};

const spin = keyframes`
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
`;

const LoaderContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing.xl};
`;

const SpinnerContainer = styled.div<{ size: 'small' | 'medium' | 'large' }>`
  width: ${({ size }) => 
    size === 'small' ? '24px' : size === 'medium' ? '36px' : '48px'};
  height: ${({ size }) => 
    size === 'small' ? '24px' : size === 'medium' ? '36px' : '48px'};
  position: relative;
`;

const Spinner = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  border: 3px solid ${({ theme }) => theme.colors.background.tertiary};
  border-top-color: ${({ theme }) => theme.colors.accent.primary};
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;
`;

const LoadingText = styled.div`
  margin-top: ${({ theme }) => theme.spacing.md};
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.fontSizes.md};
`;

export default Loader;
