import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Project } from '../../store/slices/projectsSlice';
import TagSelector from '../common/TagSelector';
import { CloseOutlined } from '@ant-design/icons';

// Project form validation schema
const projectSchema = z.object({
  name: z.string().min(1, 'Project name is required').max(100, 'Project name is too long'),
  description: z.string().optional(),
});

type ProjectFormInputs = z.infer<typeof projectSchema>;

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string; description?: string; tags?: number[] }) => void;
  title: string;
  submitLabel: string;
  project?: Project;
}

const ProjectModal: React.FC<ProjectModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  title,
  submitLabel,
  project,
}) => {
  const [selectedTags, setSelectedTags] = useState<number[]>([]);
  
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProjectFormInputs>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: project?.name || '',
      description: project?.description || '',
    },
  });
  
  // Reset form and selected tags when modal opens or project changes
  useEffect(() => {
    if (isOpen) {
      reset({
        name: project?.name || '',
        description: project?.description || '',
      });
      setSelectedTags(project?.tags.map(tag => tag.id) || []);
    }
  }, [isOpen, project, reset]);
  
  const handleFormSubmit = (data: ProjectFormInputs) => {
    onSubmit({
      ...data,
      tags: selectedTags.length > 0 ? selectedTags : undefined,
    });
  };
  
  if (!isOpen) return null;
  
  return (
    <ModalOverlay>
      <ModalContainer>
        <ModalHeader>
          <ModalTitle>{title}</ModalTitle>
          <CloseButton onClick={onClose}>
            <CloseOutlined />
          </CloseButton>
        </ModalHeader>
        
        <Form onSubmit={handleSubmit(handleFormSubmit)}>
          <FormGroup>
            <Label htmlFor="name">Project Name</Label>
            <Input
              id="name"
              type="text"
              {...register('name')}
              error={!!errors.name}
              placeholder="Enter project name"
              autoFocus
            />
            {errors.name && (
              <FormError>{errors.name.message}</FormError>
            )}
          </FormGroup>
          
          <FormGroup>
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea
              id="description"
              {...register('description')}
              error={!!errors.description}
              placeholder="Enter project description"
              rows={4}
            />
            {errors.description && (
              <FormError>{errors.description.message}</FormError>
            )}
          </FormGroup>
          
          <FormGroup>
            <Label>Tags (optional)</Label>
            <TagSelector
              selectedTags={selectedTags}
              onChange={setSelectedTags}
            />
          </FormGroup>
          
          <ButtonGroup>
            <CancelButton type="button" onClick={onClose}>
              Cancel
            </CancelButton>
            <SubmitButton type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Loading...' : submitLabel}
            </SubmitButton>
          </ButtonGroup>
        </Form>
      </ModalContainer>
    </ModalOverlay>
  );
};

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: ${({ theme }) => theme.spacing.md};
`;

const ModalContainer = styled.div`
  background-color: ${({ theme }) => theme.colors.background.secondary};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  box-shadow: ${({ theme }) => theme.boxShadow.lg};
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
`;

const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${({ theme }) => theme.spacing.lg};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.light};
`;

const ModalTitle = styled.h2`
  margin: 0;
  font-size: ${({ theme }) => theme.fontSizes.xl};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  color: ${({ theme }) => theme.colors.text.primary};
`;

const CloseButton = styled.button`
  background: transparent;
  border: none;
  color: ${({ theme }) => theme.colors.text.secondary};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: ${({ theme }) => theme.borderRadius.full};
  
  &:hover {
    background-color: ${({ theme }) => theme.colors.background.tertiary};
    color: ${({ theme }) => theme.colors.text.primary};
  }
  
  svg {
    font-size: 16px;
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.lg};
  padding: ${({ theme }) => theme.spacing.lg};
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
`;

const Label = styled.label`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const Input = styled.input<{ error?: boolean }>`
  height: 40px;
  padding: 0 ${({ theme }) => theme.spacing.md};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  border: 1px solid ${({ theme, error }) =>
    error ? theme.colors.status.error : theme.colors.border.medium};
  background-color: ${({ theme }) => theme.colors.background.primary};
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.fontSizes.md};
  outline: none;
  transition: border-color ${({ theme }) => theme.transition.fast};
  
  &:focus {
    border-color: ${({ theme, error }) =>
      error ? theme.colors.status.error : theme.colors.accent.primary};
  }
  
  &::placeholder {
    color: ${({ theme }) => theme.colors.text.tertiary};
  }
`;

const Textarea = styled.textarea<{ error?: boolean }>`
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  border: 1px solid ${({ theme, error }) =>
    error ? theme.colors.status.error : theme.colors.border.medium};
  background-color: ${({ theme }) => theme.colors.background.primary};
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.fontSizes.md};
  font-family: inherit;
  outline: none;
  resize: vertical;
  min-height: 100px;
  transition: border-color ${({ theme }) => theme.transition.fast};
  
  &:focus {
    border-color: ${({ theme, error }) =>
      error ? theme.colors.status.error : theme.colors.accent.primary};
  }
  
  &::placeholder {
    color: ${({ theme }) => theme.colors.text.tertiary};
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: ${({ theme }) => theme.spacing.md};
  margin-top: ${({ theme }) => theme.spacing.md};
`;

const Button = styled.button`
  height: 40px;
  padding: 0 ${({ theme }) => theme.spacing.lg};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  font-size: ${({ theme }) => theme.fontSizes.md};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  cursor: pointer;
  transition: all ${({ theme }) => theme.transition.fast};
  
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

const CancelButton = styled(Button)`
  background-color: transparent;
  border: 1px solid ${({ theme }) => theme.colors.border.medium};
  color: ${({ theme }) => theme.colors.text.secondary};
  
  &:hover:not(:disabled) {
    background-color: ${({ theme }) => theme.colors.background.tertiary};
    border-color: ${({ theme }) => theme.colors.border.strong};
  }
`;

const SubmitButton = styled(Button)`
  background-color: ${({ theme }) => theme.colors.accent.primary};
  border: none;
  color: white;
  
  &:hover:not(:disabled) {
    background-color: ${({ theme }) => theme.colors.accent.secondary};
  }
`;

const FormError = styled.span`
  color: ${({ theme }) => theme.colors.status.error};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  margin-top: ${({ theme }) => theme.spacing.xs};
`;

export default ProjectModal;
