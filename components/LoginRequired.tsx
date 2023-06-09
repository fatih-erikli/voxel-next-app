"use client";

import { ReactNode, useContext } from "react";
import AuthContext from "../context/AuthContext";
import Navigation from "./Navigation";

export default function LoginRequired({ children }: { children: ReactNode }) {
  const auth = useContext(AuthContext);
  return auth.user ? (
    children
  ) : (
    <>
      <Navigation />
      <div className="main">Please login.</div>
    </>
  );
}
