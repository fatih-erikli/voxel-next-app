export function* enumerateIterable<T>(iterable: Iterable<T>): Iterable<readonly [number, T]> {
  let index = 0;
  for (const item of iterable) {
    yield [index, item] as const;
    index++;
  }
}
