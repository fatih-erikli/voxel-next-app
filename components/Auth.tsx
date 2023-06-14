"use client";

import { ReactNode, useMemo, useState } from "react";
import AuthContext from "../context/AuthContext";
import { User } from "@/types/Auth";

export default function Auth({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const authContext: AuthContext = useMemo(() => {
    return {
      user,
      authToken,
      setAuthToken: async (authToken: string, user?: User) => {
        let _authToken;
        let _user;
        if (user) {
          _user = user;
          _authToken = authToken;
        } else {
          let response = await fetch(`/api/auth`, {
            body: JSON.stringify({ authToken }),
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
          });
          let responseJson = await response.json();
          if (response.ok && responseJson.user) {
            _user = responseJson.user;
            _authToken = authToken;
          } else {
            _user = null;
            _authToken = null;
          }
        }
        setUser(_user);
        setAuthToken(_authToken);
      },
    };
  }, [user, authToken]);
  return <AuthContext.Provider value={authContext}>{children}</AuthContext.Provider>;
}
