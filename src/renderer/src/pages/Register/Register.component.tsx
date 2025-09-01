import React from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useDispatch, useSelector } from 'react-redux';

import { RootState, RootDispatch, rootActions } from '@renderer/store';

import {
  Description,
  ErrorMessage,
  Form,
  FormGroup,
  FormError,
  Input,
  Label,
  RegisterContainer,
  SubmitButton,
  Title,
  LoginLink,
} from './Register.style';

// Registration form validation schema
const registerSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type RegisterFormInputs = z.infer<typeof registerSchema>;

const RegisterPage: React.FC = () => {
  const dispatch = useDispatch<RootDispatch>();
  const { loading, error } = useSelector((state: RootState) => state.auth);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormInputs>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = (data: RegisterFormInputs) => {
    dispatch(rootActions.authActions.clearError());
    const { username, email, password } = data;
    dispatch(rootActions.authActions.register({ username, email, password }));
  };

  return (
    <RegisterContainer>
      <Title>Create Account</Title>
      <Description>Sign up to start managing your projects.</Description>

      {error && <ErrorMessage>{error}</ErrorMessage>}

      <Form onSubmit={handleSubmit(onSubmit)}>
        <FormGroup>
          <Label htmlFor="username">Username</Label>
          <Input
            id="username"
            type="text"
            {...register('username')}
            error={!!errors.username}
            placeholder="Choose a username"
            disabled={loading}
          />
          {errors.username && (
            <FormError>{errors.username.message}</FormError>
          )}
        </FormGroup>

        <FormGroup>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            {...register('email')}
            error={!!errors.email}
            placeholder="Enter your email"
            disabled={loading}
          />
          {errors.email && (
            <FormError>{errors.email.message}</FormError>
          )}
        </FormGroup>

        <FormGroup>
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            {...register('password')}
            error={!!errors.password}
            placeholder="Create a password"
            disabled={loading}
          />
          {errors.password && (
            <FormError>{errors.password.message}</FormError>
          )}
        </FormGroup>

        <FormGroup>
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <Input
            id="confirmPassword"
            type="password"
            {...register('confirmPassword')}
            error={!!errors.confirmPassword}
            placeholder="Confirm your password"
            disabled={loading}
          />
          {errors.confirmPassword && (
            <FormError>{errors.confirmPassword.message}</FormError>
          )}
        </FormGroup>

        <SubmitButton type="submit" disabled={loading}>
          {loading ? 'Creating account...' : 'Create Account'}
        </SubmitButton>
      </Form>

      <LoginLink>
        Already have an account?{' '}
        <Link to="/login">Sign in</Link>
      </LoginLink>
    </RegisterContainer>
  );
};

export default RegisterPage;
