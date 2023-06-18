type RegistrationFormState = {
  username: string;
  password: string;
  email: string;
};

type RegistrationFormValidation = {
  [property in keyof RegistrationFormState]?: {ok: boolean; err?: string;}
}
