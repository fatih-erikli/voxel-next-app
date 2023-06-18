"use client";
import { FormEventHandler, useContext, useState } from "react";
import AuthContext from "../context/AuthContext";

type LoginFormState = {
  username: string;
  password: string;
}

export default function LoginForm() {
  const [formState, setFormState] = useState<LoginFormState>({ username: "", password: "" });
  const [formSubmissionState, setFormSubmissionState] = useState<"in-progress" | "success" | "failed">();
  const authContext = useContext(AuthContext);
  const onSubmit: FormEventHandler = async (event) => {
    event.preventDefault();
    setFormSubmissionState("in-progress");
    let response;
    try {
      response = await fetch(`/api/login`, {
        body: JSON.stringify(formState),
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });
    } catch (e) {
      setFormSubmissionState("failed");
      return;
    }
    if (response.status !== 202) {
      setFormSubmissionState("failed");
      return;
    }
    let responseJson = await response.json();
    if (responseJson.authToken) {
      await authContext.setAuthToken(responseJson.authToken, responseJson.user, true);
      setFormSubmissionState("success");
    } else {
      setFormSubmissionState("failed");
    }
  };

  return authContext.user ? (
    <p>Hi {authContext.user.username}</p>
  ) : (
    <form onSubmit={onSubmit} className="form">
      <div className="form-line">
        <label htmlFor="username">Username</label>
        <input
          id={"username"}
          required
          className="text-field"
          onChange={(e) => {
            setFormState({ ...formState, username: e.target.value });
          }}
          type={"text"}
        />
      </div>
      <div className="form-line">
        <label htmlFor="username">Password</label>
        <input
          id={"username"}
          required
          className="text-field"
          onChange={(e) => {
            setFormState({ ...formState, password: e.target.value });
          }}
          type={"password"}
        />
      </div>
      {formSubmissionState === "failed" && <div className="form-line">Something failed.</div>}
      <div>
        <input
          disabled={formSubmissionState === "in-progress"}
          type={"submit"}
          value={formSubmissionState === "in-progress" ? "Wait..." : "Login"}
        />
      </div>
    </form>
  );
}
