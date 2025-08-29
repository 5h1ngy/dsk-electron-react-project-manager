import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { RootState, Dispatch, actions } from '../../store';
import { Button } from '../../components/ui';

import { Description, ErrorMessage, Form, LoginContainer, SignupLink, StyledInput, StyledLink, Title } from './Login.style';

const loginSchema = z.object({
  username: z.string().min(1, 'Username è obbligatorio'),
  password: z.string().min(1, 'Password è obbligatoria'),
});

type LoginFormInputs = z.infer<typeof loginSchema>;

const LoginPage = () => {
  const dispatch = useDispatch<Dispatch>();
  const { loading, error } = useSelector((state: RootState) => state.auth);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormInputs>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = (data: LoginFormInputs) => {
    dispatch(actions.authActions.clearError());
    dispatch(actions.authActions.login(data));
  };

  useEffect(() => {
    dispatch(actions.authActions.clearError());
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

export default LoginPage;