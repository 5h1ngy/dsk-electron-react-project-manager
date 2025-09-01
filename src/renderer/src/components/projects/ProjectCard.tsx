import React from 'react';
import styled from 'styled-components';
import { Project } from '../../store/projects/projectsSlice';
import { formatDistanceToNow } from 'date-fns';
import { ProjectOutlined, CalendarOutlined, TagOutlined } from '@ant-design/icons';

interface ProjectCardProps {
  project: Project;
  onClick: () => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, onClick }) => {
  const formattedDate = formatDistanceToNow(new Date(project.updatedAt), { addSuffix: true });
  
  return (
    <CardContainer onClick={onClick}>
      <CardHeader>
        <IconContainer>
          <ProjectOutlined />
        </IconContainer>
        <Title>{project.name}</Title>
      </CardHeader>
      
      <Description>{project.description || 'No description'}</Description>
      
      <MetaData>
        <MetaItem>
          <CalendarOutlined />
          <span>Updated {formattedDate}</span>
        </MetaItem>
      </MetaData>
      
      {project.tags.length > 0 && (
        <TagsContainer>
          {project.tags.map(tag => (
            <TagChip key={tag.id} color={tag.color}>
              <TagOutlined />
              <span>{tag.name}</span>
            </TagChip>
          ))}
        </TagsContainer>
      )}
    </CardContainer>
  );
};

const CardContainer = styled.div`
  background-color: ${({ theme }) => theme.colors.background.secondary};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  padding: ${({ theme }) => theme.spacing.md};
  display: flex;
  flex-direction: column;
  cursor: pointer;
  transition: all ${({ theme }) => theme.transition.fast};
  border: 1px solid ${({ theme }) => theme.colors.border.light};
  height: 100%;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: ${({ theme }) => theme.boxShadow.md};
    border-color: ${({ theme }) => theme.colors.border.medium};
  }
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const IconContainer = styled.div`
  width: 36px;
  height: 36px;
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  background-color: ${({ theme }) => `${theme.colors.accent.primary}20`};
  color: ${({ theme }) => theme.colors.accent.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  margin-right: ${({ theme }) => theme.spacing.sm};
`;

const Title = styled.h3`
  font-size: ${({ theme }) => theme.fontSizes.lg};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  margin: 0;
  color: ${({ theme }) => theme.colors.text.primary};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const Description = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.md};
  color: ${({ theme }) => theme.colors.text.secondary};
  margin: 0 0 ${({ theme }) => theme.spacing.md} 0;
  flex: 1;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
`;

const MetaData = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.md};
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const MetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.text.tertiary};
`;

const TagsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.xs};
`;

const TagChip = styled.div<{ color: string }>`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  padding: 0 ${({ theme }) => theme.spacing.sm};
  height: 24px;
  border-radius: ${({ theme }) => theme.borderRadius.full};
  background-color: ${({ color }) => `${color}15`};
  color: ${({ color }) => color};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  
  span {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;

export default ProjectCard;
