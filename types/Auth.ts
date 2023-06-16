export type AuthContext = {
  authToken?: string | null;
  user: User | null;
  logout: () => Promise<void>;
  setAuthToken: (authToken: string, user?: User, createBrowserSession?: true) => Promise<void>;
};
export type User = {
  username: string;
};
