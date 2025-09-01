import { RootState } from "..";

export const selectFilteredProjects = (state: RootState) => {
    const { projects, filter } = state.projects;

    const filteredProjects = projects.filter(project => {
        // Filter by tags
        if (filter.tags.length > 0) {
            const folderTagIds = project.tags.map(tag => tag.id);
            if (!filter.tags.some(tagId => folderTagIds.includes(tagId))) {
                return false;
            }
        }

        // Filter by search term
        if (filter.searchTerm && filter.searchTerm.trim() !== '') {
            const searchTerm = filter.searchTerm.toLowerCase();
            return project.name.toLowerCase().includes(searchTerm);
        }

        return true;
    });

    return filteredProjects;
};