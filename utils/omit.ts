export function omit<T>(object: T, key: keyof T): Omit<T, keyof T> {
  const { [key]: _, ...rest } = object;
  return rest;
}
