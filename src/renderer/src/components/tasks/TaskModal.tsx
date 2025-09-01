import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useDispatch, useSelector } from 'react-redux';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import MDEditor from '@uiw/react-md-editor';
import { 
  Modal,
  Input, 
  Select,
  DatePicker, 
  InputNumber,
  Button,
  message 
} from 'antd';
import { 
  PlusOutlined, 
  DeleteOutlined,
  PaperClipOutlined, 
} from '@ant-design/icons';
import { RootState, AppDispatch } from '../../store';
import {
  Task,
  TaskStatus,
  TaskPriority,
  createTask,
  updateTask,
  deleteTask,
  fetchTasks
} from '../../store/tasks/tasksSlice';
import { fetchUsers } from '../../store/users/usersSlice';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: number;
  taskId: number | null;
}

// Form validation schema
const taskSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  status: z.nativeEnum(TaskStatus),
  priority: z.nativeEnum(TaskPriority),
  dueDate: z.date().optional().nullable(),
  estimatedHours: z.number().min(0).optional().nullable(),
  assigneeId: z.number().optional().nullable(),
  tags: z.array(z.string()).optional()
});

type TaskFormData = z.infer<typeof taskSchema>;

const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  projectId,
  taskId
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const { tasks, loading } = useSelector((state: RootState) => state.tasks);
  const { users } = useSelector((state: RootState) => state.users);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const task = taskId ? tasks.find(t => t.id === taskId) : null;
  const isEditMode = !!task;
  
  // Setup form with validation
  const { control, handleSubmit, reset, setValue, formState: { errors } } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: '',
      description: '',
      status: TaskStatus.TODO,
      priority: TaskPriority.MEDIUM,
      dueDate: null,
      estimatedHours: null,
      assigneeId: null,
      tags: []
    }
  });
  
  // Load users when component mounts
  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);
  
  // Set form values when task changes
  useEffect(() => {
    if (task) {
      reset({
        title: task.title,
        description: task.description || '',
        status: task.status,
        priority: task.priority || TaskPriority.MEDIUM,
        dueDate: task.dueDate ? new Date(task.dueDate) : null,
        estimatedHours: task.estimatedHours || null,
        assigneeId: task.assigneeId || null,
        tags: task.tags || []
      });
      
      // Set attachments if any
      if (task.attachments) {
        // In a real app, we would fetch attachment details from the server
        // For now, we'll just show the count
      }
    } else {
      reset({
        title: '',
        description: '',
        status: TaskStatus.TODO,
        priority: TaskPriority.MEDIUM,
        dueDate: null,
        estimatedHours: null,
        assigneeId: null,
        tags: []
      });
      setAttachments([]);
    }
  }, [task, reset]);
  
  // Handle form submission
  const onSubmit = async (data: TaskFormData) => {
    try {
      if (isEditMode && task) {
        await dispatch(updateTask({
          id: task.id,
          ...data,
          projectId,
          dueDate: data.dueDate ? format(data.dueDate, 'yyyy-MM-dd') : undefined
        })).unwrap();
        
        message.success('Task updated successfully');
      } else {
        await dispatch(createTask({
          ...data,
          projectId,
          dueDate: data.dueDate ? format(data.dueDate, 'yyyy-MM-dd') : undefined
        })).unwrap();
        
        message.success('Task created successfully');
      }
      
      // Upload attachments if any (in a real app)
      if (attachments.length > 0) {
        // Implement attachment upload logic here
      }
      
      // Refresh tasks
      dispatch(fetchTasks(projectId));
      
      // Close modal
      onClose();
    } catch (error) {
      message.error('Failed to save task');
      console.error('Error saving task:', error);
    }
  };
  
  // Handle task deletion
  const handleDelete = async () => {
    if (!task) return;
    
    try {
      setIsDeleting(true);
      await dispatch(deleteTask(task.id)).unwrap();
      
      message.success('Task deleted successfully');
      
      // Refresh tasks
      dispatch(fetchTasks(projectId));
      
      // Close modal
      onClose();
    } catch (error) {
      message.error('Failed to delete task');
      console.error('Error deleting task:', error);
    } finally {
      setIsDeleting(false);
    }
  };
  
  // Handle tag input
  const handleTagChange = (tags: string[]) => {
    setValue('tags', tags);
  };
  
  // Handle attachment upload
  const handleAttachmentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setAttachments(prev => [...prev, ...newFiles]);
    }
  };
  
  // Remove attachment
  const handleRemoveAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };
  
  return (
    <Modal
      title={isEditMode ? 'Edit Task' : 'Create Task'}
      open={isOpen}
      onCancel={onClose}
      width={700}
      footer={null}
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <FormGroup>
          <FormLabel>Title</FormLabel>
          <Controller
            name="title"
            control={control}
            render={({ field }) => (
              <Input 
                {...field} 
                placeholder="Task title" 
                status={errors.title ? 'error' : undefined}
              />
            )}
          />
          {errors.title && <ErrorText>{errors.title.message}</ErrorText>}
        </FormGroup>
        
        <FormRow>
          <FormGroup>
            <FormLabel>Status</FormLabel>
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <Select 
                  {...field} 
                  style={{ width: '100%' }}
                  options={[
                    { value: TaskStatus.TODO, label: 'To Do' },
                    { value: TaskStatus.IN_PROGRESS, label: 'In Progress' },
                    { value: TaskStatus.REVIEW, label: 'Review' },
                    { value: TaskStatus.BLOCKED, label: 'Blocked' },
                    { value: TaskStatus.DONE, label: 'Done' }
                  ]}
                />
              )}
            />
          </FormGroup>
          
          <FormGroup>
            <FormLabel>Priority</FormLabel>
            <Controller
              name="priority"
              control={control}
              render={({ field }) => (
                <Select 
                  {...field} 
                  style={{ width: '100%' }}
                  options={[
                    { value: TaskPriority.LOW, label: 'Low' },
                    { value: TaskPriority.MEDIUM, label: 'Medium' },
                    { value: TaskPriority.HIGH, label: 'High' },
                    { value: TaskPriority.URGENT, label: 'Urgent' }
                  ]}
                />
              )}
            />
          </FormGroup>
        </FormRow>
        
        <FormRow>
          <FormGroup>
            <FormLabel>Due Date</FormLabel>
            <Controller
              name="dueDate"
              control={control}
              render={({ field }) => (
                <DatePicker 
                  style={{ width: '100%' }}
                  value={field.value ? dayjs(field.value) : null} 
                  onChange={(date) => field.onChange(date ? date.toDate() : null)}
                />
              )}
            />
          </FormGroup>
          
          <FormGroup>
            <FormLabel>Estimated Hours</FormLabel>
            <Controller
              name="estimatedHours"
              control={control}
              render={({ field }) => (
                <InputNumber 
                  {...field} 
                  style={{ width: '100%' }}
                  min={0}
                  placeholder="Hours"
                />
              )}
            />
          </FormGroup>
        </FormRow>
        
        <FormRow>
          <FormGroup>
            <FormLabel>Assignee</FormLabel>
            <Controller
              name="assigneeId"
              control={control}
              render={({ field }) => (
                <Select 
                  {...field} 
                  style={{ width: '100%' }}
                  placeholder="Select assignee"
                  allowClear
                  options={users.map(user => ({
                    value: user.id,
                    label: user.name
                  }))}
                />
              )}
            />
          </FormGroup>
          
          <FormGroup>
            <FormLabel>Tags</FormLabel>
            <Controller
              name="tags"
              control={control}
              render={({ field }) => (
                <Select 
                  {...field} 
                  mode="tags"
                  style={{ width: '100%' }}
                  placeholder="Add tags"
                  onChange={handleTagChange}
                />
              )}
            />
          </FormGroup>
        </FormRow>
        
        <FormGroup>
          <FormLabel>Description</FormLabel>
          <Controller
            name="description"
            control={control}
            render={({ field }) => (
              <StyledMDEditor
                value={field.value}
                onChange={value => field.onChange(value)}
                preview="edit"
                height={200}
              />
            )}
          />
        </FormGroup>
        
        <FormGroup>
          <FormLabel>Attachments</FormLabel>
          <AttachmentsContainer>
            {attachments.map((file, index) => (
              <AttachmentItem key={index}>
                <AttachmentIcon>
                  <PaperClipOutlined />
                </AttachmentIcon>
                <AttachmentName>{file.name}</AttachmentName>
                <AttachmentRemove 
                  onClick={() => handleRemoveAttachment(index)}
                >
                  <DeleteOutlined />
                </AttachmentRemove>
              </AttachmentItem>
            ))}
            
            <AttachmentUpload>
              <AttachmentUploadButton>
                <PlusOutlined />
                <span>Add Attachment</span>
                <input 
                  type="file" 
                  onChange={handleAttachmentChange}
                  multiple
                />
              </AttachmentUploadButton>
            </AttachmentUpload>
          </AttachmentsContainer>
        </FormGroup>
        
        <ModalFooter>
          {isEditMode && (
            <DeleteButton 
              danger
              onClick={handleDelete}
              loading={isDeleting}
            >
              Delete
            </DeleteButton>
          )}
          
          <div>
            <CancelButton onClick={onClose}>
              Cancel
            </CancelButton>
            <SubmitButton 
              type="primary" 
              htmlType="submit"
              loading={loading}
            >
              {isEditMode ? 'Save Changes' : 'Create Task'}
            </SubmitButton>
          </div>
        </ModalFooter>
      </form>
    </Modal>
  );
};

const FormGroup = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const FormLabel = styled.label`
  display: block;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`;

const ErrorText = styled.p`
  color: ${({ theme }) => theme.colors.status.error};
  font-size: ${({ theme }) => theme.fontSizes.xs};
  margin-top: ${({ theme }) => theme.spacing.xs};
  margin-bottom: 0;
`;

const StyledMDEditor = styled(MDEditor)`
  .w-md-editor-toolbar {
    background-color: ${({ theme }) => theme.colors.background.secondary};
    border-color: ${({ theme }) => theme.colors.border.weak};
  }
  
  .w-md-editor-content {
    background-color: ${({ theme }) => theme.colors.background.primary};
  }
  
  .w-md-editor-text {
    color: ${({ theme }) => theme.colors.text.primary};
  }
  
  .wmde-markdown {
    background-color: ${({ theme }) => theme.colors.background.primary};
  }
`;

const AttachmentsContainer = styled.div`
  border: 1px solid ${({ theme }) => theme.colors.border.weak};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  padding: ${({ theme }) => theme.spacing.sm};
  max-height: 150px;
  overflow-y: auto;
`;

const AttachmentItem = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => theme.spacing.sm};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  background-color: ${({ theme }) => theme.colors.background.secondary};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`;

const AttachmentIcon = styled.div`
  font-size: ${({ theme }) => theme.fontSizes.md};
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const AttachmentName = styled.div`
  flex: 1;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.text.primary};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const AttachmentRemove = styled.button`
  border: none;
  background: none;
  color: ${({ theme }) => theme.colors.text.secondary};
  cursor: pointer;
  
  &:hover {
    color: ${({ theme }) => theme.colors.status.error};
  }
`;

const AttachmentUpload = styled.div`
  margin-top: ${({ theme }) => theme.spacing.sm};
`;

const AttachmentUploadButton = styled.label`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.accent.primary};
  background-color: transparent;
  border: 1px dashed ${({ theme }) => theme.colors.accent.primary};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  padding: ${({ theme }) => theme.spacing.sm};
  cursor: pointer;
  
  &:hover {
    background-color: ${({ theme }) => `${theme.colors.accent.primary}10`};
  }
  
  input {
    display: none;
  }
`;

const ModalFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: ${({ theme }) => theme.spacing.lg};
`;

const DeleteButton = styled(Button)`
  margin-right: auto;
`;

const CancelButton = styled(Button)`
  margin-right: ${({ theme }) => theme.spacing.sm};
`;

const SubmitButton = styled(Button)`
  min-width: 100px;
`;

// Make sure to import dayjs for the DatePicker
import dayjs from 'dayjs';

export default TaskModal;
