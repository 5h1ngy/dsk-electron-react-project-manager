import React from 'react';
import styled from 'styled-components';
import { Project } from '../../store/projects/projectsSlice';
import { formatDistanceToNow } from 'date-fns';
import { ProjectOutlined, CalendarOutlined, TagOutlined, RightOutlined } from '@ant-design/icons';

interface ProjectListProps {
  projects: Project[];
  onProjectClick: (projectId: number) => void;
}

const ProjectList: React.FC<ProjectListProps> = ({ projects, onProjectClick }) => {
  return (
    <ListContainer>
      {projects.map(project => (
        <ListItem key={project.id} onClick={() => onProjectClick(project.id)}>
          <LeftSection>
            <IconContainer>
              <ProjectOutlined />
            </IconContainer>
            <ContentContainer>
              <Title>{project.name}</Title>
              <Description>{project.description || 'No description'}</Description>
              
              <MetaData>
                <MetaItem>
                  <CalendarOutlined />
                  <span>Updated {formatDistanceToNow(new Date(project.updatedAt), { addSuffix: true })}</span>
                </MetaItem>
                
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
              </MetaData>
            </ContentContainer>
          </LeftSection>
          
          <ArrowIcon>
            <RightOutlined />
          </ArrowIcon>
        </ListItem>
      ))}
    </ListContainer>
  );
};

const ListContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
`;

const ListItem = styled.div`
  background-color: ${({ theme }) => theme.colors.background.secondary};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  padding: ${({ theme }) => theme.spacing.md};
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  transition: all ${({ theme }) => theme.transition.fast};
  border: 1px solid ${({ theme }) => theme.colors.border.light};
  
  &:hover {
    background-color: ${({ theme }) => theme.colors.background.tertiary};
    border-color: ${({ theme }) => theme.colors.border.medium};
  }
`;

const LeftSection = styled.div`
  display: flex;
  align-items: flex-start;
  flex: 1;
  overflow: hidden;
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
  margin-right: ${({ theme }) => theme.spacing.md};
  flex-shrink: 0;
`;

const ContentContainer = styled.div`
  flex: 1;
  overflow: hidden;
`;

const Title = styled.h3`
  font-size: ${({ theme }) => theme.fontSizes.lg};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  margin: 0 0 ${({ theme }) => theme.spacing.xs} 0;
  color: ${({ theme }) => theme.colors.text.primary};
`;

const Description = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.md};
  color: ${({ theme }) => theme.colors.text.secondary};
  margin: 0 0 ${({ theme }) => theme.spacing.sm} 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const MetaData = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.md};
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
  height: 22px;
  border-radius: ${({ theme }) => theme.borderRadius.full};
  background-color: ${({ color }) => `${color}15`};
  color: ${({ color }) => color};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  
  span {
    white-space: nowrap;
  }
`;

const ArrowIcon = styled.div`
  color: ${({ theme }) => theme.colors.text.tertiary};
  font-size: 14px;
  margin-left: ${({ theme }) => theme.spacing.md};
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  flex-shrink: 0;
`;

export default ProjectList;
