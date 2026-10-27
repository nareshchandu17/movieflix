export function getCsrfHeaders(): Record<string, string> {
  if (typeof document === "undefined") {
    return {};
  }

  const cookie = document.cookie
    .split(";")
    .map((value) => value.trim())
    .find((value) => value.startsWith("csrf_token="));
  const token = cookie?.slice("csrf_token=".length);

  return token ? { "x-csrf-token": token } : {};
}
