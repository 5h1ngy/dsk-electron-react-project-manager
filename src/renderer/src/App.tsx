import { useEffect } from 'react';
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { useDispatch } from 'react-redux';

import { Dispatch } from '@renderer/store';
import { restoreUser } from '@renderer/store/authSlice/asyncThunks';
import { ThemeProvider } from '@renderer/styles/ThemeProvider';
import { routes } from '@renderer/pages/routes';
import { AppContainer } from './App.style';

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