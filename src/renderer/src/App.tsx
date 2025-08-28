import { useEffect } from 'react';
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { useDispatch } from 'react-redux';
import styled from 'styled-components';

import { Dispatch } from '@renderer/store';
import { restoreUser } from '@renderer/store/slices/authSlice';
import { ThemeProvider } from '@renderer/styles/ThemeProvider';
import { routes } from '@renderer/pages/routes';

const AppContainer = styled.div`
  height: 100%;
  width: 100%;
`;

const App: React.FC = () => {
  const dispatch = useDispatch<Dispatch>();

  useEffect(() => {
    dispatch(restoreUser());
  }, [dispatch]);

  return (
    <ThemeProvider>
      <AppContainer>
        <RouterProvider router={createBrowserRouter(routes)} />
      </AppContainer>
    </ThemeProvider>
  );
};

export default App;