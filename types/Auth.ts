export type AuthContext = {
  authToken?: string | null;
  user: User | null;
  setAuthToken: (authToken: string, user?: User) => Promise<void>;
};
export type User = {
  username: string;
};
