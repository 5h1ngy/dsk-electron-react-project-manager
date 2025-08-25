import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import styled from 'styled-components';
import { Tabs, Button, Tag, Tooltip, Dropdown } from 'antd';
import {
  ArrowLeftOutlined,
  EditOutlined,
  DeleteOutlined,
  TeamOutlined,
  CalendarOutlined,
  TagOutlined,
  MoreOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
  DashboardOutlined,
} from '@ant-design/icons';
import { format } from 'date-fns';
import { RootState, AppDispatch } from '../../store';
import { fetchProjects, deleteProject } from '../../store/slices/projectsSlice';
import { fetchTasks } from '../../store/slices/tasksSlice';
import ProjectModal from '../../components/projects/ProjectModal';
import PageHeader from '../../components/common/PageHeader';
import Loader from '../../components/common/Loader';

const { TabPane } = Tabs;

const ProjectDetailsPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  
  const { projects, loading: projectsLoading } = useSelector((state: RootState) => state.projects);
  const { tasks, loading: tasksLoading } = useSelector((state: RootState) => state.tasks);
  const { user } = useSelector((state: RootState) => state.auth);
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('overview');
  
  const numericProjectId = projectId ? parseInt(projectId) : 0;
  const project = projects.find(p => p.id === numericProjectId);
  
  useEffect(() => {
    if (user && numericProjectId) {
      // Fetch project details if not already loaded
      dispatch(fetchProjects(user.id));
      
      // Fetch tasks for this project
      dispatch(fetchTasks(numericProjectId));
    }
  }, [dispatch, numericProjectId, user]);
  
  const handleGoBack = () => {
    navigate('/dashboard');
  };
  
  const handleEditProject = () => {
    setIsEditModalOpen(true);
  };
  
  const handleUpdateProject = (data: { name: string; description?: string; tags?: number[] }) => {
    if (project) {
      // Qui implementare la chiamata per aggiornare il progetto
      // Esempio: dispatch(updateProject({ id: project.id, ...data }));
      console.log('Updating project:', { id: project.id, ...data });
      setIsEditModalOpen(false);
    }
  };
  
  const handleDeleteProject = () => {
    if (project && window.confirm('Are you sure you want to delete this project?')) {
      dispatch(deleteProject(project.id)).then(() => {
        navigate('/dashboard');
      });
    }
  };
  
  const handleOpenTaskBoard = () => {
    navigate(`/projects/${numericProjectId}/tasks`);
  };
  
  if (projectsLoading && !project) {
    return <Loader text="Loading project details..." />;
  }
  
  if (!project) {
    return (
      <ErrorContainer>
        <h2>Project not found</h2>
        <p>The requested project could not be found.</p>
        <Button type="primary" onClick={handleGoBack}>
          Go back to Dashboard
        </Button>
      </ErrorContainer>
    );
  }
  
  // Format dates
  const formattedStartDate = project.startDate
    ? format(new Date(project.startDate), 'MMM d, yyyy')
    : 'Not set';
  
  const formattedDueDate = project.dueDate
    ? format(new Date(project.dueDate), 'MMM d, yyyy')
    : 'Not set';
  
  // Calculate project stats
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'DONE').length;
  const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  
  // Dropdown menu for project actions
  const actionMenu = {
    items: [
      {
        key: 'edit',
        label: 'Edit Project',
        icon: <EditOutlined />,
        onClick: handleEditProject,
      },
      {
        key: 'delete',
        label: 'Delete Project',
        icon: <DeleteOutlined />,
        danger: true,
        onClick: handleDeleteProject,
      },
    ],
  };
  
  return (
    <PageContainer>
      <BackButton onClick={handleGoBack}>
        <ArrowLeftOutlined />
        <span>Back to Dashboard</span>
      </BackButton>
      
      <HeaderContainer>
        <PageHeader
          title={project.name}
          description={project.description || 'No description provided'}
          actionButton={{
            label: 'Task Board',
            icon: <DashboardOutlined />,
            onClick: handleOpenTaskBoard,
          }}
        />
        
        <ProjectActions>
          <Button 
            type="primary" 
            icon={<EditOutlined />}
            onClick={handleEditProject}
          >
            Edit Project
          </Button>
          
          <Dropdown menu={actionMenu} trigger={['click']} placement="bottomRight">
            <ActionIconButton>
              <MoreOutlined />
            </ActionIconButton>
          </Dropdown>
        </ProjectActions>
      </HeaderContainer>
      
      {project.tags && project.tags.length > 0 && (
        <TagsContainer>
          <TagOutlined />
          {project.tags.map((tag, index) => (
            <StyledTag key={index} color={tag.color || 'blue'}>
              {tag.name}
            </StyledTag>
          ))}
        </TagsContainer>
      )}
      
      <MetadataContainer>
        <MetadataItem>
          <MetadataIcon>
            <CalendarOutlined />
          </MetadataIcon>
          <MetadataContent>
            <MetadataLabel>Start Date</MetadataLabel>
            <MetadataValue>{formattedStartDate}</MetadataValue>
          </MetadataContent>
        </MetadataItem>
        
        <MetadataItem>
          <MetadataIcon>
            <CalendarOutlined />
          </MetadataIcon>
          <MetadataContent>
            <MetadataLabel>Due Date</MetadataLabel>
            <MetadataValue>{formattedDueDate}</MetadataValue>
          </MetadataContent>
        </MetadataItem>
        
        <MetadataItem>
          <MetadataIcon>
            <ClockCircleOutlined />
          </MetadataIcon>
          <MetadataContent>
            <MetadataLabel>Progress</MetadataLabel>
            <MetadataValue>{progress}%</MetadataValue>
          </MetadataContent>
        </MetadataItem>
        
        <MetadataItem>
          <MetadataIcon>
            <FileTextOutlined />
          </MetadataIcon>
          <MetadataContent>
            <MetadataLabel>Tasks</MetadataLabel>
            <MetadataValue>{completedTasks} / {totalTasks}</MetadataValue>
          </MetadataContent>
        </MetadataItem>
        
        {project.team && (
          <MetadataItem>
            <MetadataIcon>
              <TeamOutlined />
            </MetadataIcon>
            <MetadataContent>
              <MetadataLabel>Team</MetadataLabel>
              <MetadataValue>{project.team}</MetadataValue>
            </MetadataContent>
          </MetadataItem>
        )}
      </MetadataContainer>
      
      <ContentTabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane tab="Overview" key="overview">
          <TabContent>
            <SectionTitle>Project Description</SectionTitle>
            <Description>
              {project.description || 'No description provided.'}
            </Description>
            
            <SectionTitle>Quick Actions</SectionTitle>
            <ActionButtonsContainer>
              <ActionButton onClick={handleOpenTaskBoard}>
                <DashboardOutlined />
                <span>View Task Board</span>
              </ActionButton>
              <ActionButton onClick={() => navigate(`/notes`)}>
                <FileTextOutlined />
                <span>Project Notes</span>
              </ActionButton>
              <ActionButton onClick={() => navigate(`/statistics`)}>
                <DashboardOutlined />
                <span>Statistics</span>
              </ActionButton>
            </ActionButtonsContainer>
          </TabContent>
        </TabPane>
        
        <TabPane tab="Tasks" key="tasks">
          <TabContent>
            <ActionButtonsContainer>
              <Button 
                type="primary" 
                onClick={handleOpenTaskBoard}
              >
                Open Task Board
              </Button>
            </ActionButtonsContainer>
            
            {tasksLoading ? (
              <Loader text="Loading tasks..." />
            ) : (
              <TaskSummary>
                <TaskStatistic>
                  <TaskStatLabel>Total Tasks</TaskStatLabel>
                  <TaskStatValue>{totalTasks}</TaskStatValue>
                </TaskStatistic>
                <TaskStatistic>
                  <TaskStatLabel>Completed</TaskStatLabel>
                  <TaskStatValue>{completedTasks}</TaskStatValue>
                </TaskStatistic>
                <TaskStatistic>
                  <TaskStatLabel>In Progress</TaskStatLabel>
                  <TaskStatValue>{tasks.filter(t => t.status === 'IN_PROGRESS').length}</TaskStatValue>
                </TaskStatistic>
                <TaskStatistic>
                  <TaskStatLabel>To Do</TaskStatLabel>
                  <TaskStatValue>{tasks.filter(t => t.status === 'TODO').length}</TaskStatValue>
                </TaskStatistic>
              </TaskSummary>
            )}
          </TabContent>
        </TabPane>
      </ContentTabs>
      
      {isEditModalOpen && (
        <ProjectModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSubmit={handleUpdateProject}
          title="Edit Project"
          submitLabel="Update Project"
          project={project}
        />
      )}
    </PageContainer>
  );
};

const PageContainer = styled.div`
  padding: ${({ theme }) => theme.spacing.md};
`;

const BackButton = styled.button`
  background: transparent;
  border: none;
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  color: ${({ theme }) => theme.colors.text.secondary};
  cursor: pointer;
  padding: ${({ theme }) => theme.spacing.xs} 0;
  margin-bottom: ${({ theme }) => theme.spacing.md};
  
  &:hover {
    color: ${({ theme }) => theme.colors.accent.primary};
  }
`;

const HeaderContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const ProjectActions = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
  align-items: center;
`;

const ActionIconButton = styled.button`
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid ${({ theme }) => theme.colors.border.medium};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  background-color: transparent;
  cursor: pointer;
  
  &:hover {
    background-color: ${({ theme }) => theme.colors.background.tertiary};
  }
`;

const TagsContainer = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-bottom: ${({ theme }) => theme.spacing.md};
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const StyledTag = styled(Tag)`
  margin: 0;
`;

const MetadataContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const MetadataItem = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => theme.spacing.md};
  background-color: ${({ theme }) => theme.colors.background.secondary};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  min-width: 150px;
`;

const MetadataIcon = styled.div`
  font-size: 24px;
  color: ${({ theme }) => theme.colors.accent.primary};
`;

const MetadataContent = styled.div`
  display: flex;
  flex-direction: column;
`;

const MetadataLabel = styled.div`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const MetadataValue = styled.div`
  font-size: ${({ theme }) => theme.fontSizes.md};
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
`;

const ContentTabs = styled(Tabs)`
  .ant-tabs-tab {
    padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.lg};
  }
  
  .ant-tabs-tab-active {
    .ant-tabs-tab-btn {
      color: ${({ theme }) => theme.colors.accent.primary} !important;
    }
  }
  
  .ant-tabs-ink-bar {
    background-color: ${({ theme }) => theme.colors.accent.primary};
  }
`;

const TabContent = styled.div`
  padding: ${({ theme }) => theme.spacing.md};
`;

const SectionTitle = styled.h3`
  font-size: ${({ theme }) => theme.fontSizes.lg};
  font-weight: 600;
  margin-bottom: ${({ theme }) => theme.spacing.md};
  color: ${({ theme }) => theme.colors.text.primary};
`;

const Description = styled.p`
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  color: ${({ theme }) => theme.colors.text.secondary};
  white-space: pre-line;
`;

const ActionButtonsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => theme.spacing.md};
  background-color: ${({ theme }) => theme.colors.background.secondary};
  border: 1px solid ${({ theme }) => theme.colors.border.medium};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  color: ${({ theme }) => theme.colors.text.primary};
  cursor: pointer;
  font-size: ${({ theme }) => theme.fontSizes.md};
  transition: all 0.2s ease;
  
  &:hover {
    background-color: ${({ theme }) => theme.colors.background.tertiary};
    border-color: ${({ theme }) => theme.colors.accent.primary};
    color: ${({ theme }) => theme.colors.accent.primary};
  }
`;

const TaskSummary = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.md};
  margin-top: ${({ theme }) => theme.spacing.md};
`;

const TaskStatistic = styled.div`
  padding: ${({ theme }) => theme.spacing.md};
  background-color: ${({ theme }) => theme.colors.background.secondary};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  min-width: 120px;
  flex: 1;
  text-align: center;
`;

const TaskStatLabel = styled.div`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`;

const TaskStatValue = styled.div`
  font-size: ${({ theme }) => theme.fontSizes.xl};
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text.primary};
`;

const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.md};
  height: 60vh;
  text-align: center;
`;

export default ProjectDetailsPage;
