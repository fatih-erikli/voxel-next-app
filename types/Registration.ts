type RegistrationFormState = {
  username: string;
  password: string;
  passwordConfirmation: string;
  email: string;
};

type RegistrationFormValidation = {
  [property in keyof RegistrationFormState]?: {ok: boolean; err?: string;}
}
