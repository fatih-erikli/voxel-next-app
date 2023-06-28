"use client";
import isUsernameValid from "@/utils/is-username-valid";
import { omit } from "@/utils/omit";
import { ChangeEventHandler, FocusEventHandler, FormEventHandler, useRef, useState } from "react";

export default function RegistationForm() {
  const [formState, setFormState] = useState<RegistrationFormState>({
    username: "",
    password: "",
    passwordConfirmation: "",
    email: "",
  });
  const [validation, setValidation] = useState<RegistrationFormValidation>({});
  const usernameAvailabilityQueryDelay = useRef<ReturnType<typeof setTimeout /*[0]*/> | null>(null);
  const [formSubmissionState, setFormSubmissionState] = useState<"in-progress" | "success" | "failed">();
  const onSubmit: FormEventHandler = async (event) => {
    event.preventDefault();
    if (isFormValid) {
      setFormSubmissionState("in-progress");
      let response = await fetch(`/api/register`, {
        body: JSON.stringify(formState),
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      });

      let responseJson;
      try {
        responseJson = await response.json();
      } catch (e) {
        setFormSubmissionState("failed");
        return;
      }

      if (responseJson) {
        if (responseJson.ok) {
          setFormSubmissionState("success");
        } else {
          setFormSubmissionState("failed");
          setValidation(responseJson.validationResult);
        }
      }
    }
  };
  const onBlurUsername: FocusEventHandler<HTMLInputElement> = (event) => {
    const username = event.target.value;
    if (username) {
      let err;
      if (event.target.validity.tooShort) {
        err = "Minimum 5 letters allowed.";
      } else if (event.target.validity.tooLong) {
        err = "Maximum 20 letters allowed.";
      } else if (event.target.validity.patternMismatch) {
        err = "Only lowercase letters, numbers, and underscore is allowed.";
      }

      if (err) {
        setValidation({
          ...validation,
          username: {
            ok: false,
            err,
          },
        });
      } else {
        setValidation(omit(validation, "username"));
      }
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
    setValidation(omit(validation, "password"));
    setFormState({ ...formState, password: event.target.value });
  };
  const onChangePasswordConfirmation: ChangeEventHandler<HTMLInputElement> = (event) => {
    setValidation(omit(validation, "passwordConfirmation"));
    setFormState({ ...formState, passwordConfirmation: event.target.value });
  };
  const onChangeEmail: ChangeEventHandler<HTMLInputElement> = (event) => {
    setValidation(omit(validation, "email"));
    setFormState({ ...formState, email: event.target.value });
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
          pattern="[a-z0-9_\.]+"
          className="text-field"
          minLength={5}
          maxLength={20}
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
        <input id="username" required className="text-field" onChange={onChangePassword} type={"password"} />
        {validation.password &&
          (validation.password.ok ? (
            <div className="form-field-valid">This is ok</div>
          ) : (
            <div className="form-field-invalid">{validation.password.err}</div>
          ))}
      </div>
      <div className="form-line">
        <label htmlFor="username">Password confirmation</label>
        <input
          id="username"
          required
          className="text-field"
          onChange={onChangePasswordConfirmation}
          type={"password"}
        />
        {validation.passwordConfirmation &&
          (validation.passwordConfirmation.ok ? (
            <div className="form-field-valid">This is ok</div>
          ) : (
            <div className="form-field-invalid">{validation.passwordConfirmation.err}</div>
          ))}
      </div>
      <div className="form-line">
        <label htmlFor="username">Email</label>
        <input id="email" required className="text-field" onChange={onChangeEmail} type={"email"} />
        {validation.email &&
          (validation.email.ok ? (
            <div className="form-field-valid">This is ok</div>
          ) : (
            <div className="form-field-invalid">{validation.email.err}</div>
          ))}
      </div>
      {formSubmissionState === "failed" && <div className="form-line">Something failed.</div>}
      <div>
        <input
          disabled={formSubmissionState === "in-progress"}
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
