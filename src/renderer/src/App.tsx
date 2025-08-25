import { useEffect } from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from './store';
import { restoreUser } from './store/slices/authSlice';
import { ThemeProvider } from './styles/ThemeProvider';
import styled from 'styled-components';

// Layouts
import { MainLayout, AuthLayout } from './components/layout';

// Pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import ProjectDetailsPage from './pages/projects/ProjectDetailsPage';
import TaskBoardPage from './pages/tasks/TaskBoardPage';
import NotesPage from './pages/notes/NotesPage';
import StatisticsPage from './pages/statistics/StatisticsPage';
import NotFoundPage from './pages/NotFoundPage';

// Auth route protection component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <>{children}</>;
};

const App: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  
  // Try to restore user from localStorage on app start
  useEffect(() => {
    dispatch(restoreUser());
  }, [dispatch]);
  
  return (
    <ThemeProvider>
      <AppContainer>
          <Routes>
            {/* Auth Routes */}
            <Route path="/" element={<AuthLayout />}>
              <Route index element={<Navigate to="/login" replace />} />
              <Route 
                path="login" 
                element={
                  <PublicRoute>
                    <LoginPage />
                  </PublicRoute>
                } 
              />
              <Route 
                path="register" 
                element={
                  <PublicRoute>
                    <RegisterPage />
                  </PublicRoute>
                } 
              />
            </Route>
            
            {/* Protected Routes */}
            <Route 
              path="/" 
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <Outlet />
                  </MainLayout>
                </ProtectedRoute>
              }
            >
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="projects/:projectId" element={<ProjectDetailsPage />} />
              <Route path="projects/:projectId/tasks" element={<TaskBoardPage />} />
              <Route path="notes" element={<NotesPage />} />
              <Route path="notes/:folderId" element={<NotesPage />} />
              <Route path="statistics" element={<StatisticsPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Routes>
      </AppContainer>
    </ThemeProvider>
  );
};

const AppContainer = styled.div`
  height: 100%;
  width: 100%;
`;

export default App;
