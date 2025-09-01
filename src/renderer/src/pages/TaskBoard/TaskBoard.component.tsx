import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

import {
  PlusOutlined,
  ArrowLeftOutlined,
  FilterOutlined,
  CloseCircleOutlined
} from '@ant-design/icons';

import { RootState, RootDispatch, rootActions, rootSelectors } from '@renderer/store';
import TaskColumn from '@renderer/components/tasks/TaskColumn';
import TaskModal from '@renderer/components/tasks/TaskModal';
import PageHeader from '@renderer/components/common/PageHeader';
import TaskFilterBar from '@renderer/components/tasks/TaskFilterBar';
import Loader from '@renderer/components/common/Loader';
import EmptyState from '@renderer/components/common/EmptyState';

import {
  BackButton,
  BoardContainer,
  ClearFiltersButton,
  ContentContainer,
  ErrorMessage,
  FilterButton,
  FilterContainer,
  HeaderContainer,
  PageContainer,
} from "./TaskBoard.style";
import { TaskStatus } from '@renderer/store/tasks/types';

const TaskBoardPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const dispatch = useDispatch<RootDispatch>();
  const navigate = useNavigate();

  const { user } = useSelector((state: RootState) => state.auth);
  const { currentProject } = useSelector((state: RootState) => state.projects);
  const { loading, error, filter } = useSelector((state: RootState) => state.tasks);
  const tasksByStatus = useSelector(rootSelectors.notesSelectors.selectTasksByStatus);

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
          dispatch(rootActions.projectsActions.fetchProjects(user.id)).then(() => {
            // Once projects are loaded, set current project
            const projectsState = (store.getState() as RootState).projects;
            const project = projectsState.projects.find(p => p.id === numericProjectId);
            if (project) {
              dispatch(rootActions.projectsActions.setCurrentProject(project));
            } else {
              // Project not found, navigate back to dashboard
              navigate('/dashboard');
            }
          });
        }
      }

      // Fetch tasks for this project
      dispatch(rootActions.tasksActions.fetchTasks(numericProjectId));
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
      dispatch(rootActions.tasksActions.updateTask({
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
      dispatch(rootActions.tasksActions.reorderTasks(updatedTasks as any));

      // Update each task on the server
      updatedTasks.forEach(task => {
        if (task) {
          dispatch(rootActions.tasksActions.updateTask({
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
    dispatch(rootActions.tasksActions.clearTaskFilters());
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
            onFilterChange={(filters) => dispatch(rootActions.tasksActions.setTaskFilter(filters))}
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

export default TaskBoardPage;
