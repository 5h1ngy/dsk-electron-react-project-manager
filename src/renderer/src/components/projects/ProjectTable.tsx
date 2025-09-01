import React from 'react';
import styled from 'styled-components';
import { Project } from '../../store/projects/projectsSlice';
import { format } from 'date-fns';
import { TagOutlined } from '@ant-design/icons';

interface ProjectTableProps {
  projects: Project[];
  onProjectClick: (projectId: number) => void;
}

const ProjectTable: React.FC<ProjectTableProps> = ({ projects, onProjectClick }) => {
  return (
    <TableContainer>
      <thead>
        <TableHeader>
          <TableHeaderCell width="30%">Name</TableHeaderCell>
          <TableHeaderCell width="40%">Description</TableHeaderCell>
          <TableHeaderCell width="15%">Updated</TableHeaderCell>
          <TableHeaderCell width="15%">Tags</TableHeaderCell>
        </TableHeader>
      </thead>
      <tbody>
        {projects.map(project => (
          <TableRow key={project.id} onClick={() => onProjectClick(project.id)}>
            <TableCell>
              <ProjectName>{project.name}</ProjectName>
            </TableCell>
            <TableCell>
              <Description>{project.description || 'No description'}</Description>
            </TableCell>
            <TableCell>
              <DateText>{format(new Date(project.updatedAt), 'MMM d, yyyy')}</DateText>
            </TableCell>
            <TableCell>
              <TagsContainer>
                {project.tags.slice(0, 2).map(tag => (
                  <TagChip key={tag.id} color={tag.color}>
                    <TagOutlined />
                    <span>{tag.name}</span>
                  </TagChip>
                ))}
                {project.tags.length > 2 && (
                  <MoreTagsChip>+{project.tags.length - 2}</MoreTagsChip>
                )}
              </TagsContainer>
            </TableCell>
          </TableRow>
        ))}
      </tbody>
    </TableContainer>
  );
};

const TableContainer = styled.table`
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  overflow: hidden;
  background-color: ${({ theme }) => theme.colors.background.secondary};
  box-shadow: ${({ theme }) => theme.boxShadow.sm};
`;

const TableHeader = styled.tr`
  background-color: ${({ theme }) => theme.colors.background.tertiary};
`;

const TableHeaderCell = styled.th<{ width?: string }>`
  padding: ${({ theme }) => theme.spacing.md};
  text-align: left;
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  width: ${({ width }) => width || 'auto'};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.light};
`;

const TableRow = styled.tr`
  cursor: pointer;
  transition: background-color ${({ theme }) => theme.transition.fast};
  
  &:hover {
    background-color: ${({ theme }) => theme.colors.background.tertiary};
  }
  
  &:not(:last-child) td {
    border-bottom: 1px solid ${({ theme }) => theme.colors.border.light};
  }
`;

const TableCell = styled.td`
  padding: ${({ theme }) => theme.spacing.md};
  vertical-align: middle;
`;

const ProjectName = styled.div`
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  color: ${({ theme }) => theme.colors.text.primary};
`;

const Description = styled.div`
  color: ${({ theme }) => theme.colors.text.secondary};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 300px;
`;

const DateText = styled.div`
  color: ${({ theme }) => theme.colors.text.tertiary};
  font-size: ${({ theme }) => theme.fontSizes.sm};
`;

const TagsContainer = styled.div`
  display: flex;
  align-items: center;
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
  white-space: nowrap;
  
  span {
    max-width: 80px;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;

const MoreTagsChip = styled.div`
  height: 24px;
  padding: 0 ${({ theme }) => theme.spacing.sm};
  border-radius: ${({ theme }) => theme.borderRadius.full};
  background-color: ${({ theme }) => theme.colors.background.tertiary};
  color: ${({ theme }) => theme.colors.text.tertiary};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  display: flex;
  align-items: center;
  justify-content: center;
`;

export default ProjectTable;
