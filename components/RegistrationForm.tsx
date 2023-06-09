"use client";
import isUsernameValid from "@/utils/is-username-valid";
import { omit } from "@/utils/omit";
import { ChangeEventHandler, FocusEventHandler, FormEventHandler, useRef, useState } from "react";

export default function RegistationForm() {
  const [formState, setFormState] = useState<RegistrationFormState>({ username: "", password: "" });
  const [validation, setValidation] = useState<RegistrationFormValidation>({});
  const usernameAvailabilityQueryDelay = useRef<ReturnType<typeof setTimeout /*[0]*/> | null>(null);
  const [formSubmissionState, setFormSubmissionState] = useState<"in-progress" | "success" | "failed">();
  const onSubmit: FormEventHandler = async (event) => {
    setFormSubmissionState("in-progress");
    event.preventDefault();
    let response = await fetch(`/api/register`, {
      body: JSON.stringify(formState),
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      setFormSubmissionState("failed");
      return;
    }
    let responseJson = await response.json();
    if (responseJson.ok) {
      setFormSubmissionState("success");
    } else {
      setValidation(responseJson.validationResult);
    }
  };
  const onBlurUsername: FocusEventHandler<HTMLInputElement> = (event) => {
    if (isUsernameValid(event.target.value)) {
      setValidation(omit(validation, "username"));
    } else {
      setValidation({ ...validation, username: { ok: false, err: "Username is not valid" } });
    }
  };
  const onChangeUsername: ChangeEventHandler<HTMLInputElement> = (event) => {
    setValidation(omit(validation, "username"));
    setFormState({ ...formState, username: event.target.value });
    if (usernameAvailabilityQueryDelay.current) {
      clearTimeout(usernameAvailabilityQueryDelay.current);
    }
    usernameAvailabilityQueryDelay.current = setTimeout(async () => {
      if (isUsernameValid(event.target.value)) {
        let response = await fetch(`/api/username-availability?username=${event.target.value}`);
        let responseJson = await response.json();
        if (responseJson.ok) {
          setValidation({ ...validation, username: { ok: true } });
        } else {
          setValidation({ ...validation, username: { ok: false, err: "Username has already taken." } });
        }
      }
    }, 1000);
  };
  const onChangePassword: ChangeEventHandler<HTMLInputElement> = (event) => {
    setFormState({ ...formState, password: event.target.value });
  };
  const isFormValid =
    (!validation.username || validation.username.ok) && (!validation.password || validation.password.ok);
  return formSubmissionState === "success" ? (
    <p className="success">Registration successful.</p>
  ) : (
    <form onSubmit={onSubmit} className="form">
      <div className="form-line">
        <label htmlFor="username">Username</label>
        <input
          id={"username"}
          required
          className="text-field"
          onBlur={onBlurUsername}
          onChange={onChangeUsername}
          type={"text"}
        />
        {validation.username &&
          (validation.username.ok ? (
            <div className="form-field-valid">{formState.username} is ok</div>
          ) : (
            <div className="form-field-invalid">{validation.username.err}</div>
          ))}
      </div>
      <div className="form-line">
        <label htmlFor="username">Password</label>
        <input id={"username"} required className="text-field" onChange={onChangePassword} type={"password"} />
        {validation.password &&
          (validation.password.ok ? (
            <div className="form-field-valid">This is ok</div>
          ) : (
            <div className="form-field-invalid">{validation.password.err}</div>
          ))}
      </div>
      <div className="form-line">We do not ask for an email. <br /> Please use a generated password in your browser and keep them in browsers credentials manager.</div>
      {formSubmissionState === "failed" && <div className="form-line">Something failed.</div>}
      <div>
        <input
          disabled={!isFormValid || formSubmissionState === "in-progress"}
          type={"submit"}
          value={formSubmissionState === "in-progress" ? "Wait..." : "Continue"}
        />
      </div>
    </form>
  );
}
/*
Notes
- [0] I am not sure about this one in JS but the TS integration of vscode is ok with that.

Incomplete parts
- Password validation
*/
