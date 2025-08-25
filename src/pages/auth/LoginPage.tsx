import React from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import styled from 'styled-components';
import { useDispatch, useSelector } from 'react-redux';
import { login, clearError } from '../../store/slices/authSlice';
import { RootState, AppDispatch } from '../../store';

// Login form validation schema
const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormInputs = z.infer<typeof loginSchema>;

const LoginPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { loading, error } = useSelector((state: RootState) => state.auth);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormInputs>({
    resolver: zodResolver(loginSchema),
  });
  
  const onSubmit = (data: LoginFormInputs) => {
    dispatch(clearError());
    dispatch(login(data));
  };
  
  return (
    <LoginContainer>
      <Title>Sign In</Title>
      <Description>Welcome back! Please sign in to your account.</Description>
      
      {error && <ErrorMessage>{error}</ErrorMessage>}
      
      <Form onSubmit={handleSubmit(onSubmit)}>
        <FormGroup>
          <Label htmlFor="username">Username</Label>
          <Input
            id="username"
            type="text"
            {...register('username')}
            error={!!errors.username}
            placeholder="Enter your username"
            disabled={loading}
          />
          {errors.username && (
            <FormError>{errors.username.message}</FormError>
          )}
        </FormGroup>
        
        <FormGroup>
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            {...register('password')}
            error={!!errors.password}
            placeholder="Enter your password"
            disabled={loading}
          />
          {errors.password && (
            <FormError>{errors.password.message}</FormError>
          )}
        </FormGroup>
        
        <SubmitButton type="submit" disabled={loading}>
          {loading ? 'Signing in...' : 'Sign In'}
        </SubmitButton>
      </Form>
      
      <SignupLink>
        Don't have an account?{' '}
        <Link to="/register">Sign up</Link>
      </SignupLink>
    </LoginContainer>
  );
};

const LoginContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const Title = styled.h2`
  font-size: ${({ theme }) => theme.fontSizes.xxl};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
  color: ${({ theme }) => theme.colors.text.primary};
`;

const Description = styled.p`
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
`;

const Label = styled.label`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const Input = styled.input<{ error?: boolean }>`
  height: 40px;
  padding: 0 ${({ theme }) => theme.spacing.md};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  border: 1px solid ${({ theme, error }) =>
    error ? theme.colors.status.error : theme.colors.border.medium};
  background-color: ${({ theme }) => theme.colors.background.primary};
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.fontSizes.md};
  outline: none;
  transition: border-color ${({ theme }) => theme.transition.fast};
  
  &:focus {
    border-color: ${({ theme, error }) =>
      error ? theme.colors.status.error : theme.colors.accent.primary};
  }
  
  &::placeholder {
    color: ${({ theme }) => theme.colors.text.tertiary};
  }
  
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

const FormError = styled.span`
  color: ${({ theme }) => theme.colors.status.error};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  margin-top: ${({ theme }) => theme.spacing.xs};
`;

const SubmitButton = styled.button`
  height: 44px;
  background-color: ${({ theme }) => theme.colors.accent.primary};
  color: white;
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  font-size: ${({ theme }) => theme.fontSizes.md};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  cursor: pointer;
  transition: background-color ${({ theme }) => theme.transition.fast};
  margin-top: ${({ theme }) => theme.spacing.sm};
  
  &:hover:not(:disabled) {
    background-color: ${({ theme }) => theme.colors.accent.secondary};
  }
  
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.div`
  padding: ${({ theme }) => theme.spacing.sm};
  background-color: ${({ theme }) => `${theme.colors.status.error}20`};
  color: ${({ theme }) => theme.colors.status.error};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  margin-bottom: ${({ theme }) => theme.spacing.md};
  font-size: ${({ theme }) => theme.fontSizes.sm};
`;

const SignupLink = styled.div`
  text-align: center;
  margin-top: ${({ theme }) => theme.spacing.lg};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
  
  a {
    color: ${({ theme }) => theme.colors.accent.primary};
    text-decoration: none;
    font-weight: ${({ theme }) => theme.fontWeights.medium};
    
    &:hover {
      text-decoration: underline;
    }
  }
`;

export default LoginPage;
