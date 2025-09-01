import React, { useEffect, createElement } from 'react';
import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import { HashRouter } from 'react-router-dom';

import { ThemeProvider } from '@renderer/styles/ThemeProvider';
import withSlice, { Bind } from '@renderer/hocs/withSlice';
import withPublicRoute from '@renderer/hocs/withPublicRoute';
import withProtectedRoute from '@renderer/hocs/withProtectedRoute';
import AuthLayout from '@renderer/components/layouts/AuthLayout';
import MainLayout from '@renderer/components/layouts/MainLayout';
import loginRoute from '@renderer/pages/Login';
import registerRoute from '@renderer/pages/Register';
import dashboardRoute from '@renderer/pages/Dashboard';
import projectsRoute from '@renderer/pages/Projects';
import tasksRoute from '@renderer/pages/TaskBoard';
import notesRoute from '@renderer/pages/Notes';
import statisticsRoute from '@renderer/pages/Statistics';
import settingsRoute from '@renderer/pages/Settings';
import notFoundRoute from '@renderer/pages/NotFound/NotFound.component';
import { AppContainer } from '@renderer/App.style';

const App: React.FC<Bind> = (props: Bind) => {
  const publicAuthLayout = createElement(withPublicRoute(AuthLayout, { redirect: "/dashboard" }))
  const privateAuthLayout = createElement(withProtectedRoute(MainLayout, { redirect: '/login', children: <Outlet /> }))

  useEffect(() => {
    props.actions.authActions.restoreUser()
  }, []);

  return (
    <ThemeProvider>
      <AppContainer>
        <HashRouter>
          <Routes>
            <Route path="/" element={publicAuthLayout}>
              <Route index element={<Navigate to="/login" replace />} />
              <Route path="login" {...loginRoute} />
              <Route path="register" {...registerRoute} />
            </Route>
            <Route path="/" element={privateAuthLayout}>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" {...dashboardRoute} />
              <Route path="projects/:projectId" {...projectsRoute} />
              <Route path="projects/:projectId/tasks" {...tasksRoute} />
              <Route path="notes" {...notesRoute} />
              <Route path="statistics" {...statisticsRoute} />
              <Route path="settings" {...settingsRoute} />
              <Route path="*" {...notFoundRoute} />
            </Route>
          </Routes>
        </HashRouter>
      </AppContainer>
    </ThemeProvider>
  );
};

export default withSlice(App);