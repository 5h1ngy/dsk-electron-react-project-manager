import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
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
import { RootState, RootDispatch, rootActions } from '@renderer/store';
import ProjectModal from '@renderer/components/projects/ProjectModal';
import PageHeader from '@renderer/components/common/PageHeader';
import Loader from '@renderer/components/common/Loader';

import {
  PageContainer,
  BackButton,
  HeaderContainer,
  ProjectActions,
  TagsContainer,
  StyledTag,
  MetadataContainer,
  MetadataItem,
  MetadataIcon,
  MetadataContent,
  MetadataLabel,
  MetadataValue,
  ContentTabs,
  TabContent,
  SectionTitle,
  Description,
  ActionButtonsContainer,
  ActionButton,
  TaskSummary,
  TaskStatistic,
  TaskStatLabel,
  TaskStatValue,
  ErrorContainer
} from './Projects.style';

const { TabPane } = Tabs;

const ProjectDetailsPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<RootDispatch>();
  
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
      dispatch(rootActions.projectsActions.fetchProjects(user.id));
      
      // Fetch tasks for this project
      dispatch(rootActions.tasksActions.fetchTasks(numericProjectId));
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
      dispatch(rootActions.projectsActions.deleteProject(project.id)).then(() => {
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

export default ProjectDetailsPage;
