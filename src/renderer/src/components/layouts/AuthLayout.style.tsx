import styled from 'styled-components';

export const AuthContainer = styled.div`
  display: flex;
  width: 100%;
  height: 100vh;
  overflow: hidden;
`;

export const AuthBanner = styled.div`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.primary.main};
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: ${({ theme }) => theme.spacing.xxl};
  color: ${({ theme }) => theme.colors.text.inverse};
  
  @media (max-width: 768px) {
    display: none;
  }
`;

export const BannerContent = styled.div`
  max-width: 500px;
  text-align: center;
`;

export const BannerTitle = styled.h1`
  font-size: 2.5rem;
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

export const BannerDescription = styled.p`
  font-size: ${({ theme }) => theme.typography.fontSizes.lg};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  line-height: 1.6;
`;

export const FormSection = styled.div`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.background.primary};
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: ${({ theme }) => theme.spacing.xxl};
  position: relative;
`;

export const FormContainer = styled.div`
  width: 100%;
  max-width: 420px;
`;

export const Logo = styled.div`
  position: absolute;
  top: ${({ theme }) => theme.spacing.lg};
  left: ${({ theme }) => theme.spacing.lg};
  font-size: ${({ theme }) => theme.typography.fontSizes.xl};
  font-weight: ${({ theme }) => theme.typography.fontWeights.bold};
  color: ${({ theme }) => theme.colors.primary.main};
`;

export const ThemeToggle = styled.div`
  position: absolute;
  top: ${({ theme }) => theme.spacing.lg};
  right: ${({ theme }) => theme.spacing.lg};
`;
