"use client";

import Link from "next/link";
import { PointerEventHandler, useContext, useState } from "react";
import AuthContext from "../context/AuthContext";
import Prompt from "./Prompt";

export default function Navigation({
  title,
  titleEditable,
  onTitleChange,
}: {
  title?: string;
  titleEditable?: boolean;
  onTitleChange?: (title: string) => void;
}) {
  const [showTitleDialogue, setShowTitleDialogue] = useState(false);
  const auth = useContext(AuthContext);
  const onTitleClick: PointerEventHandler<HTMLAnchorElement> = (event) => {
    event.preventDefault();
    setShowTitleDialogue(true);
  };
  return (
    <header className="navigation">
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
      {title && (
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
