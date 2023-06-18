export default function *reverseArray<T>(array: T[]): Iterable<T> {
  let length = array.length;
  while (length--) {
    yield array[length]
  }
}
