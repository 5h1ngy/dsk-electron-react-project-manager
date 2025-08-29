import { useEffect } from 'react';
import { Navigate, Route, RouterProvider, Routes, createBrowserRouter } from "react-router-dom";
import { useDispatch } from 'react-redux';
import { HashRouter } from 'react-router-dom';

import { RootDispatch } from '@renderer/store';
import { restoreUser } from '@renderer/store/authSlice/asyncThunks';
import { ThemeProvider } from '@renderer/styles/ThemeProvider';
import { routes } from '@renderer/pages/routes';
import { AppContainer } from './App.style';
import PublicRoute from './hocs/PublicRoute';
import AuthLayout from './components/layouts/AuthLayout';
import LoginPage, { route } from './pages/LoginPage';

const App: React.FC = () => {
  const dispatch = useDispatch<RootDispatch>();

  useEffect(() => {
    dispatch(restoreUser());
  }, [dispatch]);

  return (
    <ThemeProvider>
      <AppContainer>
        <HashRouter>
          {/* <RouterProvider router={createBrowserRouter(routes)} /> */}
          <Routes>
            <Route path="/" element={<PublicRoute children={<AuthLayout />} />}>
              <Route index element={<Navigate to="/login" replace />} />
              <Route path="login" loader={route.loader} action={route.action} element={route.element} />
            </Route>
          </Routes>
        </HashRouter>
      </AppContainer>
    </ThemeProvider>
  );
};

export default App;