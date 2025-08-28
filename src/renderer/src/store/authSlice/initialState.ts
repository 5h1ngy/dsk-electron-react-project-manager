import { AuthState } from "./types";

const initialState: AuthState = {
  user: null,
  loading: false,
  error: null,
  initialized: false,
  isAuthenticated: false
};

export default initialState;