export function getQueryParameter(url: string, key: string): string | null {
  const search = new URL(url).search;
  const urlParams = new URLSearchParams(search);
  return urlParams.get(key);
}
