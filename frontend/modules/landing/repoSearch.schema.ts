export function normalizeGithubUsername(value: string) {
  return value.trim().replace(/^@/, "");
}

export function isValidGithubUsername(value: string) {
  if (!value) return false;
  if (value.length < 1 || value.length > 39) return false;
  if (!/^[a-zA-Z0-9-]+$/.test(value)) return false;
  if (value.startsWith("-") || value.endsWith("-")) return false;
  if (value.includes("--")) return false;
  return true;
}
