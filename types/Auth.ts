export type AuthContext = {
  authToken?: string | null;
  user: User | null;
  sceneIds: string[];
  logout: () => Promise<void>;
  setAuthToken: (authToken: string, user?: User, sceneIds?: string[]) => Promise<void>;
  addSceneId: (sceneId: string) => void;
};
export type User = {
  username: string;
};
