import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';

import { RootState, RootDispatch, rootActions, rootSelectors } from '@renderer/store';
import { ViewMode } from '@renderer/store/uiSlice/types';
import TagSelector from '@renderer/components/common/TagSelector';
import { Button, Card, Input, Badge } from '@renderer/components/ui';
import ProjectCard from '@renderer/components/projects/ProjectCard';
import ProjectTable from '@renderer/components/projects/ProjectTable';
import ProjectList from '@renderer/components/projects/ProjectList';
import ProjectModal from '@renderer/components/projects/ProjectModal';

import {
  BadgeContainer, CardGrid, DashboardContainer, DashboardHeader, EmptyStateContainer, EmptyStateContent,
  EmptyStateDescription, EmptyStateIcon, EmptyStateTitle, FilterButton, FilterContainer,
  FilterHeader, FilterTitle, HeaderActions, HeaderTitle, LoadingContainer, ProjectsContainer,
  SearchContainer, StyledInput, ToolBar, ViewModeButton, ViewModeContainer, ErrorMessage, PlusIcon
} from './Dashboard.style';

const DashboardPage = () => {
  const dispatch = useDispatch<RootDispatch>();
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  const { loading, error, filter } = useSelector((state: RootState) => state.projects);
  const { projectsViewMode } = useSelector((state: RootState) => state.ui);
  const projects = useSelector(rootSelectors.projectSelectors.selectFilteredProjects);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isFilterVisible, setIsFilterVisible] = useState(false);

  // Fetch projects on component mount
  useEffect(() => {
    if (user) {
      dispatch(rootActions.projectsActions.fetchProjects(user.id));
    }
  }, [dispatch, user]);

  const handleCreateProject = async (projectData: { name: string; description?: string; tags?: number[] }) => {
    if (user) {
      await dispatch(rootActions.projectsActions.createProject({
        ...projectData,
        userId: user.id,
      }));
      setIsCreateModalOpen(false);
    }
  };

  const handleViewModeChange = (mode: ViewMode) => {
    dispatch(rootActions.uiActions.setProjectsViewMode(mode));
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(rootActions.projectsActions.setSearchFilter(e.target.value));
  };

  const handleTagsChange = (tagIds: number[]) => {
    dispatch(rootActions.projectsActions.setTagFilter(tagIds));
  };

  const handleClearFilters = () => {
    dispatch(rootActions.projectsActions.clearFilters());
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
          title={''}
          submitLabel={''}
        />
      )}
    </DashboardContainer>
  );
};

export default DashboardPage;
