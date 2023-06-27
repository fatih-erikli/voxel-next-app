"use client";

import { ReactNode, useEffect, useMemo, useState } from "react";
import AuthContext from "../context/AuthContext";
import { User } from "@/types/Auth";

export default function Auth({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [sceneIds, setSceneIds] = useState<string[]>([]);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const authContext: AuthContext = useMemo(() => {
    return {
      user,
      authToken,
      sceneIds,
      addSceneId: (sceneId: string) => {
        setSceneIds([...sceneIds, sceneId])
      },
      logout: async () => {
        let response = await fetch(`/api/auth/${authToken}`, {
          method: "DELETE",
        });
        if (response.status === 204) {
          sessionStorage.removeItem("auth-token");
          setAuthToken(null);
          setUser(null);
          setSceneIds([]);
        }
      },
      setAuthToken: async (authToken: string, user?: User, sceneIds?: string[]) => {
        let _authToken;
        let _user;
        let _sceneIds;
        if (user) {
          _user = user;
          _authToken = authToken;
          _sceneIds = sceneIds;
        } else {
          let response = await fetch(`/api/auth/${authToken}`, {
            headers: {
              "Content-Type": "application/json",
            },
          });
          let responseJson = await response.json();
          if (response.ok && responseJson.user) {
            _user = responseJson.user;
            _authToken = authToken;
            _sceneIds = responseJson.sceneIds;
          } else {
            _user = null;
            _authToken = null;
          }
        }
        sessionStorage.setItem("auth-token", authToken);
        setUser(_user);
        setAuthToken(_authToken);
        setSceneIds(_sceneIds);
      },
    };
  }, [user, authToken, sceneIds]);
  useEffect(() => {
    if (!authToken) {
      const authTokenStored = sessionStorage.getItem("auth-token");
      if (authTokenStored) {
        authContext.setAuthToken(authTokenStored);
      }
    }
  }, [authToken, authContext]);
  return <AuthContext.Provider value={authContext}>{children}</AuthContext.Provider>;
}
