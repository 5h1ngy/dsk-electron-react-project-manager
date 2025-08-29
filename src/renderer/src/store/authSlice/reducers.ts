import { AuthState } from "./types";

export default {
    logout(state: AuthState) {
        state.user = null;
        state.isAuthenticated = false;
        localStorage.removeItem('user');
    },
    clearError(state: AuthState) {
        state.error = null;
    },
}