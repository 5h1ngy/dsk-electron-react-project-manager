import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import styled from 'styled-components';
import { RootState, AppDispatch } from '../../store';
import { 
  fetchProjects, 
  createProject, 
  selectFilteredProjects,
  setTagFilter,
  setSearchFilter,
  clearFilters 
} from '../../store/slices/projectsSlice';
import { ViewMode, setProjectsViewMode } from '../../store/slices/uiSlice';

// Icons
import {
  AppstoreOutlined,
  TableOutlined,
  UnorderedListOutlined,
  PlusOutlined,
  SearchOutlined,
  FilterOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons';

// Components
import ProjectCard from '../../components/projects/ProjectCard';
import ProjectTable from '../../components/projects/ProjectTable';
import ProjectList from '../../components/projects/ProjectList';
import ProjectModal from '../../components/projects/ProjectModal';
import PageHeader from '../../components/common/PageHeader';
import TagSelector from '../../components/common/TagSelector';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';

const DashboardPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  const { loading, error, filter } = useSelector((state: RootState) => state.projects);
  const { projectsViewMode } = useSelector((state: RootState) => state.ui);
  const projects = useSelector(selectFilteredProjects);
  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  
  // Fetch projects on component mount
  useEffect(() => {
    if (user) {
      dispatch(fetchProjects(user.id));
    }
  }, [dispatch, user]);
  
  const handleCreateProject = async (projectData: { name: string; description?: string; tags?: number[] }) => {
    if (user) {
      await dispatch(createProject({
        ...projectData,
        userId: user.id,
      }));
      setIsCreateModalOpen(false);
    }
  };
  
  const handleViewModeChange = (mode: ViewMode) => {
    dispatch(setProjectsViewMode(mode));
  };
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setSearchFilter(e.target.value));
  };
  
  const handleTagsChange = (tagIds: number[]) => {
    dispatch(setTagFilter(tagIds));
  };
  
  const handleClearFilters = () => {
    dispatch(clearFilters());
  };
  
  const handleProjectClick = (projectId: number) => {
    navigate(`/projects/${projectId}`);
  };
  
  const renderProjects = () => {
    if (loading) {
      return <Loader />;
    }
    
    if (error) {
      return <ErrorMessage>{error}</ErrorMessage>;
    }
    
    if (projects.length === 0) {
      return (
        <EmptyState 
          title="No projects found" 
          description={
            filter.tags.length > 0 || filter.searchTerm
              ? "Try changing your filters to see more results."
              : "Create your first project to get started."
          }
          actionLabel={
            filter.tags.length > 0 || filter.searchTerm
              ? "Clear filters"
              : "Create project"
          }
          actionIcon={
            filter.tags.length > 0 || filter.searchTerm
              ? <CloseCircleOutlined />
              : <PlusOutlined />
          }
          onAction={
            filter.tags.length > 0 || filter.searchTerm
              ? handleClearFilters
              : () => setIsCreateModalOpen(true)
          }
        />
      );
    }
    
    switch (projectsViewMode) {
      case 'card':
        return (
          <CardGrid>
            {projects.map(project => (
              <ProjectCard 
                key={project.id} 
                project={project} 
                onClick={() => handleProjectClick(project.id)}
              />
            ))}
          </CardGrid>
        );
      case 'table':
        return (
          <ProjectTable 
            projects={projects} 
            onProjectClick={handleProjectClick} 
          />
        );
      case 'list':
        return (
          <ProjectList 
            projects={projects} 
            onProjectClick={handleProjectClick} 
          />
        );
      default:
        return null;
    }
  };
  
  return (
    <DashboardContainer>
      <PageHeader 
        title="Projects Dashboard"
        actionButton={{
          label: "New Project",
          icon: <PlusOutlined />,
          onClick: () => setIsCreateModalOpen(true),
        }}
      />
      
      <ToolBar>
        <ViewModeButtons>
          <ViewModeButton 
            active={projectsViewMode === 'card'} 
            onClick={() => handleViewModeChange('card')}
          >
            <AppstoreOutlined />
          </ViewModeButton>
          <ViewModeButton 
            active={projectsViewMode === 'table'} 
            onClick={() => handleViewModeChange('table')}
          >
            <TableOutlined />
          </ViewModeButton>
          <ViewModeButton 
            active={projectsViewMode === 'list'} 
            onClick={() => handleViewModeChange('list')}
          >
            <UnorderedListOutlined />
          </ViewModeButton>
        </ViewModeButtons>
        
        <SearchContainer>
          <SearchIconWrapper>
            <SearchOutlined />
          </SearchIconWrapper>
          <SearchInput 
            placeholder="Search projects..."
            value={filter.searchTerm}
            onChange={handleSearchChange}
          />
        </SearchContainer>
        
        <FilterButton 
          active={isFilterVisible} 
          onClick={() => setIsFilterVisible(!isFilterVisible)}
        >
          <FilterOutlined />
          {isFilterVisible ? 'Hide Filters' : 'Show Filters'}
        </FilterButton>
      </ToolBar>
      
      {isFilterVisible && (
        <FilterContainer>
          <FilterSection>
            <FilterLabel>Filter by Tags</FilterLabel>
            <TagSelector 
              selectedTags={filter.tags}
              onChange={handleTagsChange}
            />
          </FilterSection>
          
          {(filter.tags.length > 0 || filter.searchTerm) && (
            <ClearFiltersButton onClick={handleClearFilters}>
              <CloseCircleOutlined /> Clear All Filters
            </ClearFiltersButton>
          )}
        </FilterContainer>
      )}
      
      <ContentArea>
        {renderProjects()}
      </ContentArea>
      
      <ProjectModal 
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateProject}
        title="Create New Project"
        submitLabel="Create Project"
      />
    </DashboardContainer>
  );
};

const DashboardContainer = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
`;

const ToolBar = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.md};
  flex-wrap: wrap;
`;

const ViewModeButtons = styled.div`
  display: flex;
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  overflow: hidden;
  border: 1px solid ${({ theme }) => theme.colors.border.medium};
`;

const ViewModeButton = styled.button<{ active: boolean }>`
  height: 36px;
  width: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${({ active, theme }) => 
    active ? theme.colors.accent.primary : 'transparent'};
  color: ${({ active, theme }) => 
    active ? 'white' : theme.colors.text.secondary};
  border: none;
  cursor: pointer;
  transition: all ${({ theme }) => theme.transition.fast};
  
  &:hover {
    background-color: ${({ active, theme }) => 
      active ? theme.colors.accent.secondary : theme.colors.background.tertiary};
  }
  
  &:not(:last-child) {
    border-right: 1px solid ${({ theme }) => theme.colors.border.medium};
  }
`;

const SearchContainer = styled.div`
  flex: 1;
  position: relative;
  min-width: 200px;
`;

const SearchIconWrapper = styled.div`
  position: absolute;
  left: ${({ theme }) => theme.spacing.md};
  top: 50%;
  transform: translateY(-50%);
  color: ${({ theme }) => theme.colors.text.tertiary};
`;

const SearchInput = styled.input`
  height: 36px;
  width: 100%;
  padding: 0 ${({ theme }) => theme.spacing.md} 0 ${({ theme }) => theme.spacing.xl};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  border: 1px solid ${({ theme }) => theme.colors.border.medium};
  background-color: ${({ theme }) => theme.colors.background.primary};
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  outline: none;
  
  &:focus {
    border-color: ${({ theme }) => theme.colors.accent.primary};
  }
  
  &::placeholder {
    color: ${({ theme }) => theme.colors.text.tertiary};
  }
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

const FilterContainer = styled.div`
  padding: ${({ theme }) => theme.spacing.md};
  background-color: ${({ theme }) => theme.colors.background.secondary};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  margin-bottom: ${({ theme }) => theme.spacing.md};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
`;

const FilterSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const FilterLabel = styled.div`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const ClearFiltersButton = styled.button`
  align-self: flex-start;
  height: 32px;
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

const ContentArea = styled.div`
  flex: 1;
  overflow: auto;
  padding: ${({ theme }) => theme.spacing.sm} 0;
`;

const CardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: ${({ theme }) => theme.spacing.md};
`;

const ErrorMessage = styled.div`
  padding: ${({ theme }) => theme.spacing.md};
  background-color: ${({ theme }) => `${theme.colors.status.error}20`};
  color: ${({ theme }) => theme.colors.status.error};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-size: ${({ theme }) => theme.fontSizes.md};
`;

export default DashboardPage;
