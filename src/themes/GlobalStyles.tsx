import { createGlobalStyle } from 'styled-components';
import { Theme } from './theme';

const GlobalStyles = createGlobalStyle<{ theme: Theme }>`
  body {
    background-color: ${({ theme }) => theme.colors.background.primary};
    color: ${({ theme }) => theme.colors.text.primary};
    transition: background-color ${({ theme }) => theme.transition.normal}, color ${({ theme }) => theme.transition.normal};
  }

  a {
    color: ${({ theme }) => theme.colors.accent.primary};
    text-decoration: none;
    transition: color ${({ theme }) => theme.transition.fast};

    &:hover {
      color: ${({ theme }) => theme.colors.accent.secondary};
    }
  }

  button, input, select, textarea {
    font-family: inherit;
  }

  ::selection {
    background-color: ${({ theme }) => theme.colors.accent.primary};
    color: #ffffff;
  }

  /* Custom scrollbar */
  ::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }

  ::-webkit-scrollbar-track {
    background: ${({ theme }) => theme.colors.background.tertiary};
  }

  ::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.colors.border.medium};
    border-radius: ${({ theme }) => theme.borderRadius.sm};
  }

  ::-webkit-scrollbar-thumb:hover {
    background: ${({ theme }) => theme.colors.border.strong};
  }

  /* Smooth transitions when changing theme */
  *, *::before, *::after {
    transition: background-color 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
  }
`;

export default GlobalStyles;
