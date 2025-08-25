import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import styled from 'styled-components';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { RootState, AppDispatch } from '../../store';
import { 
  fetchTasks, 
  updateTask, 
  TaskStatus, 
  selectTasksByStatus,
  setTaskFilter,
  clearTaskFilters,
  reorderTasks
} from '../../store/slices/tasksSlice';
import { 
  fetchProjects, 
  setCurrentProject 
} from '../../store/slices/projectsSlice';

// Components
import TaskColumn from '../../components/tasks/TaskColumn';
import TaskModal from '../../components/tasks/TaskModal';
import PageHeader from '../../components/common/PageHeader';
import TaskFilterBar from '../../components/tasks/TaskFilterBar';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';

// Icons
import { 
  PlusOutlined, 
  ArrowLeftOutlined,
  FilterOutlined,
  CloseCircleOutlined
} from '@ant-design/icons';

const TaskBoardPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  
  const { user } = useSelector((state: RootState) => state.auth);
  const { currentProject } = useSelector((state: RootState) => state.projects);
  const { loading, error, filter } = useSelector((state: RootState) => state.tasks);
  const tasksByStatus = useSelector(selectTasksByStatus);
  
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [currentTaskId, setCurrentTaskId] = useState<number | null>(null);
  
  // Fetch tasks when component mounts
  useEffect(() => {
    if (projectId && parseInt(projectId)) {
      const numericProjectId = parseInt(projectId);
      
      // Fetch project details if not already loaded
      if (!currentProject || currentProject.id !== numericProjectId) {
        if (user) {
          dispatch(fetchProjects(user.id)).then(() => {
            // Once projects are loaded, set current project
            const projectsState = (store.getState() as RootState).projects;
            const project = projectsState.projects.find(p => p.id === numericProjectId);
            if (project) {
              dispatch(setCurrentProject(project));
            } else {
              // Project not found, navigate back to dashboard
              navigate('/dashboard');
            }
          });
        }
      }
      
      // Fetch tasks for this project
      dispatch(fetchTasks(numericProjectId));
    } else {
      // Invalid project ID, navigate back to dashboard
      navigate('/dashboard');
    }
  }, [dispatch, projectId, user, currentProject, navigate]);
  
  const handleCreateTask = () => {
    setCurrentTaskId(null);
    setIsTaskModalOpen(true);
  };
  
  const handleEditTask = (taskId: number) => {
    setCurrentTaskId(taskId);
    setIsTaskModalOpen(true);
  };
  
  const handleDragEnd = (
    taskId: number, 
    sourceStatus: TaskStatus, 
    destinationStatus: TaskStatus,
    newPosition: number
  ) => {
    // Get the task from the source column
    const task = tasksByStatus[sourceStatus].find(t => t.id === taskId);
    
    if (task) {
      // Update the task status and position
      dispatch(updateTask({
        id: taskId,
        status: destinationStatus,
        position: newPosition
      }));
    }
  };
  
  const handleTaskPositionChange = (status: TaskStatus, taskIds: number[]) => {
    // Update the position of each task in the column
    const updatedTasks = taskIds.map((id, index) => {
      const task = tasksByStatus[status].find(t => t.id === id);
      if (task) {
        return {
          ...task,
          position: index
        };
      }
      return null;
    }).filter(Boolean);
    
    if (updatedTasks.length > 0) {
      // Optimistically update the local state
      dispatch(reorderTasks(updatedTasks as any));
      
      // Update each task on the server
      updatedTasks.forEach(task => {
        if (task) {
          dispatch(updateTask({
            id: task.id,
            position: task.position
          }));
        }
      });
    }
  };
  
  const handleGoBack = () => {
    navigate(`/projects/${projectId}`);
  };
  
  const handleFilterToggle = () => {
    setIsFilterVisible(!isFilterVisible);
  };
  
  const handleClearFilters = () => {
    dispatch(clearTaskFilters());
  };
  
  const renderContent = () => {
    if (loading && !tasksByStatus[TaskStatus.TODO].length) {
      return <Loader text="Loading tasks..." />;
    }
    
    if (error) {
      return <ErrorMessage>{error}</ErrorMessage>;
    }
    
    const totalTasks = Object.values(tasksByStatus).reduce(
      (acc, tasks) => acc + tasks.length, 0
    );
    
    if (totalTasks === 0) {
      return (
        <EmptyState 
          title="No tasks found" 
          description={
            filter.tags.length > 0 || filter.status.length > 0 || 
            filter.priority.length > 0 || filter.searchTerm
              ? "Try changing your filters to see more tasks."
              : "Create your first task to get started."
          }
          actionLabel={
            filter.tags.length > 0 || filter.status.length > 0 || 
            filter.priority.length > 0 || filter.searchTerm
              ? "Clear filters"
              : "Create task"
          }
          actionIcon={
            filter.tags.length > 0 || filter.status.length > 0 || 
            filter.priority.length > 0 || filter.searchTerm
              ? <CloseCircleOutlined />
              : <PlusOutlined />
          }
          onAction={
            filter.tags.length > 0 || filter.status.length > 0 || 
            filter.priority.length > 0 || filter.searchTerm
              ? handleClearFilters
              : handleCreateTask
          }
        />
      );
    }
    
    return (
      <BoardContainer>
        <TaskColumn 
          title="To Do" 
          status={TaskStatus.TODO}
          tasks={tasksByStatus[TaskStatus.TODO]}
          onTaskClick={handleEditTask}
          onDragEnd={handleDragEnd}
          onPositionChange={(taskIds) => handleTaskPositionChange(TaskStatus.TODO, taskIds)}
        />
        <TaskColumn 
          title="In Progress" 
          status={TaskStatus.IN_PROGRESS}
          tasks={tasksByStatus[TaskStatus.IN_PROGRESS]}
          onTaskClick={handleEditTask}
          onDragEnd={handleDragEnd}
          onPositionChange={(taskIds) => handleTaskPositionChange(TaskStatus.IN_PROGRESS, taskIds)}
        />
        <TaskColumn 
          title="Review" 
          status={TaskStatus.REVIEW}
          tasks={tasksByStatus[TaskStatus.REVIEW]}
          onTaskClick={handleEditTask}
          onDragEnd={handleDragEnd}
          onPositionChange={(taskIds) => handleTaskPositionChange(TaskStatus.REVIEW, taskIds)}
        />
        <TaskColumn 
          title="Blocked" 
          status={TaskStatus.BLOCKED}
          tasks={tasksByStatus[TaskStatus.BLOCKED]}
          onTaskClick={handleEditTask}
          onDragEnd={handleDragEnd}
          onPositionChange={(taskIds) => handleTaskPositionChange(TaskStatus.BLOCKED, taskIds)}
        />
        <TaskColumn 
          title="Done" 
          status={TaskStatus.DONE}
          tasks={tasksByStatus[TaskStatus.DONE]}
          onTaskClick={handleEditTask}
          onDragEnd={handleDragEnd}
          onPositionChange={(taskIds) => handleTaskPositionChange(TaskStatus.DONE, taskIds)}
        />
      </BoardContainer>
    );
  };
  
  return (
    <DndProvider backend={HTML5Backend}>
      <PageContainer>
        <HeaderContainer>
          <BackButton onClick={handleGoBack}>
            <ArrowLeftOutlined />
            <span>Back to Project</span>
          </BackButton>
          
          <PageHeader 
            title={currentProject ? `${currentProject.name} - Tasks` : 'Tasks'}
            actionButton={{
              label: "Add Task",
              icon: <PlusOutlined />,
              onClick: handleCreateTask,
            }}
          />
          
          <FilterContainer>
            <FilterButton 
              active={isFilterVisible} 
              onClick={handleFilterToggle}
            >
              <FilterOutlined />
              {isFilterVisible ? 'Hide Filters' : 'Show Filters'}
            </FilterButton>
            
            {(filter.tags.length > 0 || filter.status.length > 0 || 
              filter.priority.length > 0 || filter.searchTerm) && (
              <ClearFiltersButton onClick={handleClearFilters}>
                <CloseCircleOutlined /> Clear Filters
              </ClearFiltersButton>
            )}
          </FilterContainer>
        </HeaderContainer>
        
        {isFilterVisible && (
          <TaskFilterBar 
            filters={filter}
            onFilterChange={(filters) => dispatch(setTaskFilter(filters))}
          />
        )}
        
        <ContentContainer>
          {renderContent()}
        </ContentContainer>
        
        {isTaskModalOpen && projectId && (
          <TaskModal 
            isOpen={isTaskModalOpen}
            onClose={() => setIsTaskModalOpen(false)}
            projectId={parseInt(projectId)}
            taskId={currentTaskId}
          />
        )}
      </PageContainer>
    </DndProvider>
  );
};

const PageContainer = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
`;

const HeaderContainer = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const BackButton = styled.button`
  background: transparent;
  border: none;
  color: ${({ theme }) => theme.colors.text.secondary};
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
  
  &:hover {
    color: ${({ theme }) => theme.colors.accent.primary};
    background-color: ${({ theme }) => theme.colors.background.tertiary};
  }
`;

const FilterContainer = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
  margin: ${({ theme }) => theme.spacing.md} 0;
`;

const FilterButton = styled.button<{ active: boolean }>`
  height: 36px;
  padding: 0 ${({ theme }) => theme.spacing.md};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  border: 1px solid ${({ theme, active }) => 
    active ? theme.colors.accent.primary : theme.colors.border.medium};
  background-color: ${({ theme, active }) => 
    active ? `${theme.colors.accent.primary}10` : 'transparent'};
  color: ${({ theme, active }) => 
    active ? theme.colors.accent.primary : theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  cursor: pointer;
  transition: all ${({ theme }) => theme.transition.fast};
  
  &:hover {
    border-color: ${({ theme }) => theme.colors.accent.primary};
    color: ${({ theme }) => theme.colors.accent.primary};
  }
`;

const ClearFiltersButton = styled.button`
  height: 36px;
  padding: 0 ${({ theme }) => theme.spacing.md};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  border: 1px solid ${({ theme }) => theme.colors.status.error};
  background-color: transparent;
  color: ${({ theme }) => theme.colors.status.error};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  cursor: pointer;
  
  &:hover {
    background-color: ${({ theme }) => `${theme.colors.status.error}10`};
  }
`;

const ContentContainer = styled.div`
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

const BoardContainer = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
  height: 100%;
  overflow-x: auto;
  padding-bottom: ${({ theme }) => theme.spacing.md};
  
  &::-webkit-scrollbar {
    height: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: ${({ theme }) => theme.colors.background.tertiary};
    border-radius: ${({ theme }) => theme.borderRadius.sm};
  }
  
  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.colors.border.medium};
    border-radius: ${({ theme }) => theme.borderRadius.sm};
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: ${({ theme }) => theme.colors.border.strong};
  }
`;

const ErrorMessage = styled.div`
  padding: ${({ theme }) => theme.spacing.md};
  background-color: ${({ theme }) => `${theme.colors.status.error}20`};
  color: ${({ theme }) => theme.colors.status.error};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-size: ${({ theme }) => theme.fontSizes.md};
`;

export default TaskBoardPage;
