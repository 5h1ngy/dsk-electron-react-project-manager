import styled from 'styled-components';

export const Container = styled.div`
  position: relative;
`;

export const ControlsRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
`;
