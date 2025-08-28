import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import styled from 'styled-components';
import { useDispatch, useSelector } from 'react-redux';
import { login, clearError } from '../../store/slices/authSlice';
import { RootState, AppDispatch } from '../../store';
import { Button, Input } from '../../components/ui';

// Login form validation schema
const loginSchema = z.object({
  username: z.string().min(1, 'Username è obbligatorio'),
  password: z.string().min(1, 'Password è obbligatoria'),
});

type LoginFormInputs = z.infer<typeof loginSchema>;

const LoginPage = () => {
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
  
  // Reset error on mount
  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);
  
  return (
    <LoginContainer>
      <Title>Accedi</Title>
      <Description>Bentornato! Accedi al tuo account.</Description>
      
      {error && <ErrorMessage>{error}</ErrorMessage>}
      
      <Form onSubmit={handleSubmit(onSubmit)}>
        <StyledInput
          label="Username"
          status={errors.username ? 'error' : 'default'}
          helper={errors.username?.message}
          fullWidth
          placeholder="Inserisci il tuo username"
          disabled={loading}
          {...register('username')}
        />
        
        <StyledInput
          label="Password"
          type="password"
          status={errors.password ? 'error' : 'default'}
          helper={errors.password?.message}
          fullWidth
          placeholder="Inserisci la tua password"
          disabled={loading}
          {...register('password')}
        />
        
        <Button 
          type="submit" 
          disabled={loading}
          fullWidth
          size="large"
        >
          {loading ? 'Accesso in corso...' : 'Accedi'}
        </Button>
      </Form>
      
      <SignupLink>
        Non hai un account?{' '}
        <StyledLink to="/register">Registrati</StyledLink>
      </SignupLink>
    </LoginContainer>
  );
};

const LoginContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const Title = styled.h2`
  font-size: ${({ theme }) => theme.typography.fontSizes.xxl};
  font-weight: ${({ theme }) => theme.typography.fontWeights.bold};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
  color: ${({ theme }) => theme.colors.text.primary};
`;

const Description = styled.p`
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const Form = styled.form`
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
`;

const ErrorMessage = styled.div`
  padding: ${({ theme }) => theme.spacing.sm};
  margin-bottom: ${({ theme }) => theme.spacing.md};
  background-color: ${({ theme }) => theme.colors.status.error}15;
  border-left: 3px solid ${({ theme }) => theme.colors.status.error};
  color: ${({ theme }) => theme.colors.status.error};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
`;

const SignupLink = styled.div`
  text-align: center;
  margin-top: ${({ theme }) => theme.spacing.md};
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const StyledLink = styled(Link)`
  color: ${({ theme }) => theme.colors.primary.main};
  text-decoration: none;
  font-weight: ${({ theme }) => theme.typography.fontWeights.medium};
  
  &:hover {
    text-decoration: underline;
  }
`;

// Sovrascrivi lo stile del componente Input per adattarlo alla pagina di login
const StyledInput = styled(Input)`
  margin-bottom: 0;
`;

export default LoginPage;
