export type AuthContext = {
  authToken?: string;
  user: User | null; /*
  not undefined because we set it as null when the user logs out,
  re-setting a variable with undefined sound strange so I chose null.
  */
  setAuthToken: (authToken: string, user?: User) => Promise<void>;
};
export type User = {
  username: string;
};
