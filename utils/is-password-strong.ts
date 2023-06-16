export default function isPasswordStrong(password: string) {
  // https://stackoverflow.com/a/17103418/17805504
  return /(?=^.{6,}$)(?=.*[0-9])(?=.*[A-Z])(?=.*[a-z])(?=.*[^A-Za-z0-9]).*/.test(password);
}
