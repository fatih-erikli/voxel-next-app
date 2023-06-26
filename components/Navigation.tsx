"use client";

import Link from "next/link";
import { PointerEventHandler, useContext, useState } from "react";
import AuthContext from "../context/AuthContext";
import Prompt from "./Prompt";

export default function Navigation({
  title,
  titleEditable,
  onTitleChange,
  stickyHeader,
}: {
  title?: string;
  titleEditable?: boolean;
  onTitleChange?: (title: string) => void;
  stickyHeader?: true;
}) {
  const [showTitleDialogue, setShowTitleDialogue] = useState(false);
  const auth = useContext(AuthContext);
  const onTitleClick: PointerEventHandler<HTMLAnchorElement> = (event) => {
    event.preventDefault();
    setShowTitleDialogue(true);
  };
  const onLogoutClick: PointerEventHandler<HTMLAnchorElement> = (event) => {
    event.preventDefault();
    auth.logout();
  }
  return (
    <header className={stickyHeader ? "navigation navigation--sticky": "navigation"}>
      <nav>
        <Link className={"link"} href={"/"}>
          Home
        </Link>
        {auth.user && (
          <>
            <Link className={"link"} href={"/create"}>
              Create
            </Link>
          </>
        )}
      </nav>
      {title !== undefined && (
        <div className="page-title">
          {(titleEditable && onTitleChange) ? (
            <>
              {showTitleDialogue && (
                <Prompt value={title} onClose={() => setShowTitleDialogue(false)} onChange={onTitleChange} />
              )}
              <a onClick={onTitleClick} className="link" href={"#"}>
                {title}
              </a>
            </>
          ) : (
            title
          )}
        </div>
      )}
      <nav>
        {auth.user ? (
          <>
            <Link className="link" href={`/users/${auth.user.username}`}>
              {auth.user.username}
            </Link>
            <Link className="link" href={`/users/${auth.user.username}`} onClick={onLogoutClick}>
              Logout
            </Link>
          </>
        ) : (
          <>
            <Link className={"link"} href={"/register"}>
              Register
            </Link>
            <Link className={"link"} href={"/login"}>
              Login
            </Link>
          </>
        )}
      </nav>
    </header>
  );
}
