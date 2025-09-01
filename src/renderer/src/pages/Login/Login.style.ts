import styled from 'styled-components';
import { Link } from 'react-router-dom';

import { Input } from '@renderer/components/ui/Input';

export const LoginContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

export const Title = styled.h2`
  font-size: ${({ theme }) => theme.typography.fontSizes.xxl};
  font-weight: ${({ theme }) => theme.typography.fontWeights.bold};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
  color: ${({ theme }) => theme.colors.text.primary};
`;

export const Description = styled.p`
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

export const Form = styled.form`
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
`;

export const ErrorMessage = styled.div`
  padding: ${({ theme }) => theme.spacing.sm};
  margin-bottom: ${({ theme }) => theme.spacing.md};
  background-color: ${({ theme }) => theme.colors.status.error}15;
  border-left: 3px solid ${({ theme }) => theme.colors.status.error};
  color: ${({ theme }) => theme.colors.status.error};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
`;

export const SignupLink = styled.div`
  text-align: center;
  margin-top: ${({ theme }) => theme.spacing.md};
  color: ${({ theme }) => theme.colors.text.secondary};
`;

export const StyledLink = styled(Link)`
  color: ${({ theme }) => theme.colors.primary.main};
  text-decoration: none;
  font-weight: ${({ theme }) => theme.typography.fontWeights.medium};
  
  &:hover {
    text-decoration: underline;
  }
`;

// Sovrascrivi lo stile del componente Input per adattarlo alla pagina di login
export const StyledInput = styled(Input)`
  margin-bottom: 0;
`;