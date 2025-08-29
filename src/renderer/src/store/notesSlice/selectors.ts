import { RootState } from "..";

export const selectFilteredItems = (state: RootState) => {
    const { folders, files, filter } = state.notes;

    const filteredFolders = folders.filter(folder => {
        // Filter by tags
        if (filter.tags.length > 0) {
            const folderTagIds = folder.tags.map(tag => tag.id);
            if (!filter.tags.some(tagId => folderTagIds.includes(tagId))) {
                return false;
            }
        }

        // Filter by search term
        if (filter.searchTerm && filter.searchTerm.trim() !== '') {
            const searchTerm = filter.searchTerm.toLowerCase();
            return folder.name.toLowerCase().includes(searchTerm);
        }

        return true;
    });

    const filteredFiles = files.filter(file => {
        // Filter by tags
        if (filter.tags.length > 0) {
            const fileTagIds = file.tags.map(tag => tag.id);
            if (!filter.tags.some(tagId => fileTagIds.includes(tagId))) {
                return false;
            }
        }

        // Filter by search term
        if (filter.searchTerm && filter.searchTerm.trim() !== '') {
            const searchTerm = filter.searchTerm.toLowerCase();
            return file.name.toLowerCase().includes(searchTerm);
        }

        return true;
    });

    return { folders: filteredFolders, files: filteredFiles };
};