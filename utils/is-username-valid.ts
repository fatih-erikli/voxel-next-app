export default function isUsernameValid(username: string): boolean {
  // https://stackoverflow.com/a/67758273/17805504
  /* 
    Usernames can only have: 
    - Lowercase Letters (a-z) 
    - Numbers (0-9)
    - Dots (.)
    - Underscores (_)
  */
  return /^[a-z0-9_\.]{5,20}$/.test(username);
}
