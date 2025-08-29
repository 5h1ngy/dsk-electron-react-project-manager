import { useEffect, useState } from 'react';
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
} from '../../store/projectsSlice/projectsSlice';
import { ViewMode, setProjectsViewMode } from '../../store/uiSlice/uiSlice';

// Componenti UI
import { Button, Card, Input, Badge } from '../../components/ui';

// Componenti da integrare
import ProjectCard from '../../components/projects/ProjectCard';
import ProjectTable from '../../components/projects/ProjectTable';
import ProjectList from '../../components/projects/ProjectList';
import ProjectModal from '../../components/projects/ProjectModal';
import TagSelector from '../../components/common/TagSelector';

const DashboardPage = () => {
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
      return <LoadingContainer>Caricamento progetti...</LoadingContainer>;
    }
    
    if (error) {
      return <ErrorMessage>{error}</ErrorMessage>;
    }
    
    if (projects.length === 0) {
      return (
        <EmptyStateContainer>
          <Card variant="elevated" padding>
            <EmptyStateContent>
              <EmptyStateIcon></EmptyStateIcon>
              <EmptyStateTitle>
                {filter.tags.length > 0 || filter.searchTerm
                  ? "Nessun progetto trovato"
                  : "Nessun progetto"}
              </EmptyStateTitle>
              <EmptyStateDescription>
                {filter.tags.length > 0 || filter.searchTerm
                  ? "Prova a modificare i filtri per vedere più risultati."
                  : "Crea il tuo primo progetto per iniziare."}
              </EmptyStateDescription>
              <Button
                variant="primary"
                onClick={
                  filter.tags.length > 0 || filter.searchTerm
                    ? handleClearFilters
                    : () => setIsCreateModalOpen(true)
                }
              >
                {filter.tags.length > 0 || filter.searchTerm
                  ? "Cancella filtri"
                  : "Crea progetto"}
              </Button>
            </EmptyStateContent>
          </Card>
        </EmptyStateContainer>
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
      <DashboardHeader>
        <HeaderTitle>Dashboard Progetti</HeaderTitle>
        <HeaderActions>
          <Button
            variant="primary"
            icon={<PlusIcon>+</PlusIcon>}
            onClick={() => setIsCreateModalOpen(true)}
          >
            Nuovo Progetto
          </Button>
        </HeaderActions>
      </DashboardHeader>
      
      <ToolBar>
        <ViewModeContainer>
          <ViewModeButton 
            $active={projectsViewMode === 'card'} 
            onClick={() => handleViewModeChange('card')}
            title="Vista a griglia"
          >
            <span></span>
          </ViewModeButton>
          <ViewModeButton 
            $active={projectsViewMode === 'table'} 
            onClick={() => handleViewModeChange('table')}
            title="Vista tabella"
          >
            <span></span>
          </ViewModeButton>
          <ViewModeButton 
            $active={projectsViewMode === 'list'} 
            onClick={() => handleViewModeChange('list')}
            title="Vista lista"
          >
            <span>≡</span>
          </ViewModeButton>
        </ViewModeContainer>
        
        <SearchContainer>
          <StyledInput
            placeholder="Cerca progetti..."
            value={filter.searchTerm}
            onChange={handleSearchChange}
            rightIcon={<span></span>}
          />
        </SearchContainer>
        
        <FilterButton 
          $active={isFilterVisible} 
          onClick={() => setIsFilterVisible(!isFilterVisible)}
          title={isFilterVisible ? "Nascondi filtri" : "Mostra filtri"}
        >
          <span></span>
          {filter.tags.length > 0 && (
            <BadgeContainer>
              <Badge count={filter.tags.length} variant="primary" size="small" />
            </BadgeContainer>
          )}
        </FilterButton>
      </ToolBar>
      
      {isFilterVisible && (
        <FilterContainer>
          <FilterHeader>
            <FilterTitle>Filtri</FilterTitle>
            {(filter.tags.length > 0 || filter.searchTerm) && (
              <Button
                variant="ghost"
                size="small"
                onClick={handleClearFilters}
              >
                Cancella filtri
              </Button>
            )}
          </FilterHeader>
          <TagSelector
            selectedTags={filter.tags}
            onChange={handleTagsChange}
          />
        </FilterContainer>
      )}
      
      <ProjectsContainer>{renderProjects()}</ProjectsContainer>
      
      {isCreateModalOpen && (
        <ProjectModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSubmit={handleCreateProject}
        />
      )}
    </DashboardContainer>
  );
};

const DashboardContainer = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
`;

const DashboardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const HeaderTitle = styled.h1`
  font-size: ${({ theme }) => theme.typography.fontSizes.xxl};
  font-weight: ${({ theme }) => theme.typography.fontWeights.bold};
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0;
`;

const HeaderActions = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const PlusIcon = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSizes.lg};
  font-weight: ${({ theme }) => theme.typography.fontWeights.bold};
`;

const ToolBar = styled.div`
  display: flex;
  align-items: center;
  padding: ${({ theme }) => theme.spacing.md};
  background-color: ${({ theme }) => theme.colors.background.secondary};
  border-radius: 0 ${({ theme }) => theme.borderRadius.lg} 0 ${({ theme }) => theme.borderRadius.lg};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const ViewModeContainer = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.xs};
  margin-right: ${({ theme }) => theme.spacing.md};
`;

const ViewModeButton = styled.button<{ $active: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  background-color: ${({ theme, $active }) => 
    $active ? theme.colors.primary.main : 'transparent'};
  color: ${({ theme, $active }) => 
    $active ? theme.colors.text.inverse : theme.colors.text.secondary};
  border: none;
  cursor: pointer;
  transition: all ${({ theme }) => theme.transition.fast};
  
  &:hover {
    background-color: ${({ theme, $active }) => 
      $active ? theme.colors.primary.dark : theme.colors.background.tertiary};
  }
  
  span {
    font-size: 18px;
  }
`;

const SearchContainer = styled.div`
  flex: 1;
  margin-right: ${({ theme }) => theme.spacing.md};
`;

const StyledInput = styled(Input)`
  margin-bottom: 0;
`;

const FilterButton = styled.button<{ $active: boolean }>`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  background-color: ${({ theme, $active }) => 
    $active ? theme.colors.primary.main : 'transparent'};
  color: ${({ theme, $active }) => 
    $active ? theme.colors.text.inverse : theme.colors.text.secondary};
  border: none;
  cursor: pointer;
  transition: all ${({ theme }) => theme.transition.fast};
  
  &:hover {
    background-color: ${({ theme, $active }) => 
      $active ? theme.colors.primary.dark : theme.colors.background.tertiary};
  }
  
  span {
    font-size: 18px;
  }
`;

const BadgeContainer = styled.div`
  position: absolute;
  top: -5px;
  right: -5px;
`;

const FilterContainer = styled.div`
  padding: ${({ theme }) => theme.spacing.md};
  background-color: ${({ theme }) => theme.colors.background.secondary};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const FilterHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const FilterTitle = styled.h3`
  font-size: ${({ theme }) => theme.typography.fontSizes.lg};
  font-weight: ${({ theme }) => theme.typography.fontWeights.medium};
  margin: 0;
`;

const ProjectsContainer = styled.div`
  flex: 1;
  overflow: auto;
`;

const CardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: ${({ theme }) => theme.spacing.lg};
`;

const LoadingContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.fontSizes.lg};
`;

const ErrorMessage = styled.div`
  padding: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.md};
  background-color: ${({ theme }) => theme.colors.status.error}15;
  border-left: 3px solid ${({ theme }) => theme.colors.status.error};
  color: ${({ theme }) => theme.colors.status.error};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
`;

const EmptyStateContainer = styled.div`
  max-width: 600px;
  margin: 0 auto;
  padding: ${({ theme }) => theme.spacing.xl} 0;
`;

const EmptyStateContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: ${({ theme }) => theme.spacing.xl};
`;

const EmptyStateIcon = styled.div`
  font-size: 48px;
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const EmptyStateTitle = styled.h3`
  font-size: ${({ theme }) => theme.typography.fontSizes.xl};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
  color: ${({ theme }) => theme.colors.text.primary};
`;

const EmptyStateDescription = styled.p`
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

export default DashboardPage;
