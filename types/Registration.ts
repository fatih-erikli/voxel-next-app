type RegistrationFormState = {
  username: string;
  password: string;
};
type RegistrationFormValidation = {
  [property in keyof RegistrationFormState]?: { ok: boolean; err?: string };
};
