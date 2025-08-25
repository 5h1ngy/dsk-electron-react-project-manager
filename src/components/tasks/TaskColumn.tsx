import React, { useRef } from 'react';
import styled from 'styled-components';
import { useDrop } from 'react-dnd';
import TaskCard from './TaskCard';
import { Task, TaskStatus } from '../../store/slices/tasksSlice';
import { PlusOutlined } from '@ant-design/icons';

interface TaskColumnProps {
  title: string;
  status: TaskStatus;
  tasks: Task[];
  onTaskClick: (taskId: number) => void;
  onDragEnd: (
    taskId: number, 
    sourceStatus: TaskStatus, 
    destinationStatus: TaskStatus,
    newPosition: number
  ) => void;
  onPositionChange: (taskIds: number[]) => void;
  onAddTask?: () => void;
}

const TaskColumn: React.FC<TaskColumnProps> = ({
  title,
  status,
  tasks,
  onTaskClick,
  onDragEnd,
  onPositionChange,
  onAddTask
}) => {
  const columnRef = useRef<HTMLDivElement>(null);
  
  // Set up drop zone for the column
  const [{ isOver, canDrop }, drop] = useDrop({
    accept: 'TASK',
    drop: (item: { id: number; status: TaskStatus }, monitor) => {
      // Only handle if task is coming from another column
      if (item.status !== status) {
        // Calculate the new position for the task
        // If dropped at the end, use the length of tasks
        // Otherwise, calculate based on drop position
        const clientOffset = monitor.getClientOffset();
        const newPosition = calculateDropPosition(clientOffset);
        
        // Invoke the callback with the new status and position
        onDragEnd(item.id, item.status, status, newPosition);
      }
      return { status };
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  });
  
  // Calculate position in the column based on mouse position
  const calculateDropPosition = (clientOffset: { x: number, y: number } | null): number => {
    if (!columnRef.current || !clientOffset) {
      return tasks.length; // Default to end of list
    }
    
    const columnRect = columnRef.current.getBoundingClientRect();
    const columnTop = columnRect.top;
    const taskCards = columnRef.current.querySelectorAll('.task-card');
    
    // If no cards or mouse is above all cards, position is 0
    if (taskCards.length === 0 || clientOffset.y < columnTop + 60) {
      return 0;
    }
    
    // Find the card that the mouse is over
    for (let i = 0; i < taskCards.length; i++) {
      const card = taskCards[i];
      const cardRect = card.getBoundingClientRect();
      const cardMiddle = cardRect.top + (cardRect.height / 2);
      
      if (clientOffset.y < cardMiddle) {
        return i;
      }
    }
    
    // If mouse is below all cards, position is at the end
    return tasks.length;
  };
  
  // Re-order tasks when they are dragged within the same column
  const handleTaskMove = (dragIndex: number, hoverIndex: number) => {
    // Create a new array with the new order
    const newTasks = [...tasks];
    const draggedTask = newTasks[dragIndex];
    
    // Remove the dragged task from its position
    newTasks.splice(dragIndex, 1);
    
    // Insert the task at the hover position
    newTasks.splice(hoverIndex, 0, draggedTask);
    
    // Extract the task IDs in the new order
    const taskIds = newTasks.map(task => task.id);
    
    // Invoke the callback with the new order
    onPositionChange(taskIds);
  };
  
  // Apply ref to the column
  drop(columnRef);
  
  // Sort tasks by their position
  const sortedTasks = [...tasks].sort((a, b) => a.position - b.position);
  
  return (
    <ColumnContainer 
      ref={columnRef}
      isOver={isOver}
      canDrop={canDrop}
    >
      <ColumnHeader>
        <ColumnTitle>{title}</ColumnTitle>
        <TaskCount>{tasks.length}</TaskCount>
        
        {onAddTask && (
          <AddTaskButton onClick={onAddTask}>
            <PlusOutlined />
          </AddTaskButton>
        )}
      </ColumnHeader>
      
      <TaskList>
        {sortedTasks.map((task, index) => (
          <TaskCard
            key={task.id}
            task={task}
            index={index}
            onClick={() => onTaskClick(task.id)}
            onMove={handleTaskMove}
          />
        ))}
        
        {tasks.length === 0 && (
          <EmptyColumn>
            <EmptyText>No tasks</EmptyText>
          </EmptyColumn>
        )}
      </TaskList>
    </ColumnContainer>
  );
};

const ColumnContainer = styled.div<{ isOver: boolean; canDrop: boolean }>`
  width: 280px;
  min-width: 280px;
  max-height: 100%;
  display: flex;
  flex-direction: column;
  background-color: ${({ theme, isOver, canDrop }) => 
    isOver && canDrop 
      ? `${theme.colors.accent.primary}10` 
      : theme.colors.background.secondary};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  border: 1px solid ${({ theme, isOver, canDrop }) => 
    isOver && canDrop 
      ? theme.colors.accent.primary 
      : theme.colors.border.weak};
  transition: border ${({ theme }) => theme.transition.fast}, 
              background-color ${({ theme }) => theme.transition.fast};
`;

const ColumnHeader = styled.div`
  padding: ${({ theme }) => theme.spacing.md};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.weak};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const ColumnTitle = styled.h3`
  font-size: ${({ theme }) => theme.fontSizes.md};
  font-weight: 600;
  margin: 0;
  flex: 1;
  color: ${({ theme }) => theme.colors.text.primary};
`;

const TaskCount = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.secondary};
  background-color: ${({ theme }) => theme.colors.background.tertiary};
  padding: 2px 8px;
  border-radius: ${({ theme }) => theme.borderRadius.sm};
`;

const AddTaskButton = styled.button`
  background: transparent;
  border: none;
  color: ${({ theme }) => theme.colors.text.secondary};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  
  &:hover {
    color: ${({ theme }) => theme.colors.accent.primary};
    background-color: ${({ theme }) => theme.colors.background.tertiary};
  }
`;

const TaskList = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: ${({ theme }) => theme.spacing.md};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
  
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  
  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.colors.border.medium};
    border-radius: ${({ theme }) => theme.borderRadius.sm};
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: ${({ theme }) => theme.colors.border.strong};
  }
`;

const EmptyColumn = styled.div`
  height: 100%;
  min-height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px dashed ${({ theme }) => theme.colors.border.medium};
  border-radius: ${({ theme }) => theme.borderRadius.md};
`;

const EmptyText = styled.span`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.fontSizes.sm};
`;

export default TaskColumn;
