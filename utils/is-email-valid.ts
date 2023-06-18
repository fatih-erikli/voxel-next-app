export default function isEmailValid(email: string) {
  return new RegExp(
    "[a-z0-9!#$%&'*+/=?^_`{|}~-]+" +
      "(?:.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*" +
      "@" +
      "(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?"
  ).test(email);
}
