export default function isUsernameValid(username: string): boolean {
  if (username.length < 5 || username.length > 20) {
    return false;
  }
  // https://stackoverflow.com/a/67758273/17805504
  /* 
    Usernames can only have: 
    - Lowercase Letters (a-z) 
    - Numbers (0-9)
    - Dots (.)
    - Underscores (_)
  */
  return /^[a-z0-9_\.]+$/.test(username);
}
