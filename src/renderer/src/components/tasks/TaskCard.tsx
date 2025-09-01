import React, { useRef } from 'react';
import styled from 'styled-components';
import { useDrag, useDrop } from 'react-dnd';
import { Task, TaskPriority } from '../../store/tasks/tasksSlice';
import { format } from 'date-fns';
import { 
  CalendarOutlined,
  TagOutlined,
  ClockCircleOutlined,
  PaperClipOutlined
} from '@ant-design/icons';

interface TaskCardProps {
  task: Task;
  index: number;
  onClick: () => void;
  onMove: (dragIndex: number, hoverIndex: number) => void;
}

interface DragItem {
  index: number;
  id: number;
  status: string;
  type: string;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, index, onClick, onMove }) => {
  const ref = useRef<HTMLDivElement>(null);
  
  // Set up drag hook
  const [{ isDragging }, drag] = useDrag({
    type: 'TASK',
    item: { 
      id: task.id, 
      status: task.status, 
      index
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });
  
  // Set up drop hook for reordering within the same column
  const [, drop] = useDrop({
    accept: 'TASK',
    hover: (item: DragItem, monitor) => {
      if (!ref.current) {
        return;
      }
      
      // Don't replace items with themselves
      if (item.index === index) {
        return;
      }
      
      // Only handle movement within the same column
      if (item.status !== task.status) {
        return;
      }
      
      // Determine rectangle on screen
      const hoverBoundingRect = ref.current.getBoundingClientRect();
      
      // Get vertical middle
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      
      // Determine mouse position
      const clientOffset = monitor.getClientOffset();
      
      // Get pixels to the top
      const hoverClientY = (clientOffset as { y: number }).y - hoverBoundingRect.top;
      
      // Only perform the move when the mouse has crossed half of the items height
      // When dragging downwards, only move when the cursor is below 50%
      // When dragging upwards, only move when the cursor is above 50%
      
      // Dragging downwards
      if (item.index < index && hoverClientY < hoverMiddleY) {
        return;
      }
      
      // Dragging upwards
      if (item.index > index && hoverClientY > hoverMiddleY) {
        return;
      }
      
      // Time to actually perform the action
      onMove(item.index, index);
      
      // Note: we're mutating the monitor item here!
      // Generally it's better to avoid mutations,
      // but it's good here for the sake of performance
      // to avoid expensive index searches.
      item.index = index;
    },
  });
  
  // Apply the drag and drop refs
  drag(drop(ref));
  
  // Render the priority badge
  const renderPriorityBadge = () => {
    const priorityColors = {
      [TaskPriority.LOW]: {
        bg: '#d9f7be',
        text: '#389e0d',
      },
      [TaskPriority.MEDIUM]: {
        bg: '#ffd666',
        text: '#ad6800',
      },
      [TaskPriority.HIGH]: {
        bg: '#ff7875',
        text: '#a8071a',
      },
      [TaskPriority.URGENT]: {
        bg: '#f5222d',
        text: '#ffffff',
      },
    };
    
    const priority = task.priority || TaskPriority.MEDIUM;
    const colors = priorityColors[priority];
    
    return (
      <PriorityBadge 
        bgColor={colors.bg}
        textColor={colors.text}
      >
        {priority.charAt(0).toUpperCase() + priority.slice(1).toLowerCase()}
      </PriorityBadge>
    );
  };
  
  // Format the date
  const formatDate = (date: string) => {
    try {
      return format(new Date(date), 'MMM d');
    } catch (error) {
      return 'Invalid date';
    }
  };
  
  return (
    <CardContainer 
      ref={ref}
      isDragging={isDragging}
      onClick={onClick}
      className="task-card"
    >
      <CardHeader>
        {renderPriorityBadge()}
        <CardTitle>{task.title}</CardTitle>
      </CardHeader>
      
      {task.description && (
        <CardDescription>
          {task.description.length > 100 
            ? `${task.description.slice(0, 100)}...` 
            : task.description}
        </CardDescription>
      )}
      
      <CardMeta>
        {task.dueDate && (
          <MetaItem>
            <CalendarOutlined />
            <span>{formatDate(task.dueDate)}</span>
          </MetaItem>
        )}
        
        {task.estimatedHours && (
          <MetaItem>
            <ClockCircleOutlined />
            <span>{task.estimatedHours}h</span>
          </MetaItem>
        )}
        
        {task.attachments && task.attachments.length > 0 && (
          <MetaItem>
            <PaperClipOutlined />
            <span>{task.attachments.length}</span>
          </MetaItem>
        )}
      </CardMeta>
      
      {task.tags && task.tags.length > 0 && (
        <TagsContainer>
          <TagOutlined />
          <TagsList>
            {task.tags.slice(0, 2).map((tag, index) => (
              <Tag key={index}>{tag}</Tag>
            ))}
            {task.tags.length > 2 && (
              <Tag>+{task.tags.length - 2}</Tag>
            )}
          </TagsList>
        </TagsContainer>
      )}
      
      {task.assignee && (
        <AssigneeContainer>
          <AssigneeAvatar>{task.assignee.name.charAt(0)}</AssigneeAvatar>
          <AssigneeName>{task.assignee.name}</AssigneeName>
        </AssigneeContainer>
      )}
    </CardContainer>
  );
};

const CardContainer = styled.div<{ isDragging: boolean }>`
  background-color: ${({ theme }) => theme.colors.background.primary};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  padding: ${({ theme }) => theme.spacing.md};
  box-shadow: ${({ theme, isDragging }) => 
    isDragging 
      ? '0 8px 16px rgba(0, 0, 0, 0.1)' 
      : '0 1px 3px rgba(0, 0, 0, 0.05)'};
  cursor: pointer;
  opacity: ${({ isDragging }) => (isDragging ? 0.7 : 1)};
  border: 1px solid ${({ theme, isDragging }) => 
    isDragging 
      ? theme.colors.accent.primary 
      : theme.colors.border.weak};
  transition: all 0.2s ease;
  
  &:hover {
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    border-color: ${({ theme }) => theme.colors.border.medium};
  }
`;

const CardHeader = styled.div`
  display: flex;
  align-items: flex-start;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

const PriorityBadge = styled.span<{ bgColor: string; textColor: string }>`
  font-size: ${({ theme }) => theme.fontSizes.xs};
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 12px;
  background-color: ${({ bgColor }) => bgColor};
  color: ${({ textColor }) => textColor};
  flex-shrink: 0;
`;

const CardTitle = styled.h4`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  margin: 0;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
`;

const CardDescription = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: ${({ theme }) => theme.colors.text.secondary};
  margin: ${({ theme }) => theme.spacing.sm} 0;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
`;

const CardMeta = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

const MetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: ${({ theme }) => theme.colors.text.secondary};
  background-color: ${({ theme }) => theme.colors.background.tertiary};
  padding: 2px 8px;
  border-radius: ${({ theme }) => theme.borderRadius.sm};
`;

const TagsContainer = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.fontSizes.xs};
`;

const TagsList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
`;

const Tag = styled.span`
  background-color: ${({ theme }) => theme.colors.background.tertiary};
  color: ${({ theme }) => theme.colors.text.secondary};
  padding: 2px 6px;
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  font-size: ${({ theme }) => theme.fontSizes.xs};
`;

const AssigneeContainer = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  margin-top: ${({ theme }) => theme.spacing.sm};
`;

const AssigneeAvatar = styled.div`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: ${({ theme }) => theme.colors.accent.primary};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: ${({ theme }) => theme.fontSizes.xs};
  font-weight: 600;
`;

const AssigneeName = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: ${({ theme }) => theme.colors.text.secondary};
`;

export default TaskCard;
