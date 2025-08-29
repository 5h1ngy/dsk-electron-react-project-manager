// #region Types
export interface Tag {
  id: number;
  name: string;
  color: string;
}

export interface Project {
  id: number;
  name: string;
  description: string;
  userId: number;
  tags: Tag[];
  createdAt: string;
  updatedAt: string;
}

export interface ProjectsState {
  projects: Project[];
  currentProject: Project | null;
  loading: boolean;
  error: string | null;
  filter: {
    tags: number[];
    searchTerm: string;
  };
}
// #endregion
