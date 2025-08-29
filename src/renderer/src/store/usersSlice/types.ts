// #region Types
export interface User {
  id: number;
  username: string;
  email: string;
  fullName?: string;
  avatar?: string;
  role?: string;
}

export interface UsersState {
  users: User[];
  loading: boolean;
  error: string | null;
}
// #endregion
