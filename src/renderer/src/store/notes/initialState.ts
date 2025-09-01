import { NotesState } from "./types";

const initialState: NotesState = {
  folders: [],
  currentFolder: null,
  files: [],
  notes: [],
  currentNote: null,
  loading: false,
  loadingNotes: false,
  loadingFolders: false,
  error: null,
  breadcrumbs: [],
  filter: {
    tags: [],
    searchTerm: '',
  },
};

export default initialState;