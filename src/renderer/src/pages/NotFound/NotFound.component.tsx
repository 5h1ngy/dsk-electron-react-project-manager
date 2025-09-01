import React from 'react';
import { HomeOutlined } from '@ant-design/icons';

import {
  Container,
  ErrorCode,
  Title,
  Description,
  HomeLink,
} from './NotFound.style';

const NotFoundPage: React.FC = () => {
  return (
    <Container>
      <ErrorCode>404</ErrorCode>
      <Title>Page Not Found</Title>
      <Description>
        The page you are looking for doesn't exist or has been moved.
      </Description>
      <HomeLink to="/dashboard">
        <HomeOutlined /> Back to Dashboard
      </HomeLink>
    </Container>
  );
};

export default NotFoundPage;
