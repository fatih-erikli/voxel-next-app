'use client';
import { AuthContext } from "@/types/Auth";
import { createContext } from "react";
const AuthContext = createContext<AuthContext>({
  authToken: null,
  user: null,
  addSceneId() {},
  sceneIds: [],
  async logout() {},
  async setAuthToken() {}
});
export default AuthContext;
