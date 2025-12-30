export class GithubError extends Error {
  constructor(
    message: string,
    public readonly code:
      | "GITHUB_HTTP_ERROR"
      | "GITHUB_NOT_FOUND"
      | "GITHUB_RATE_LIMIT"
      | "GITHUB_TIMEOUT"
      | "GITHUB_BAD_RESPONSE",
    public readonly status?: number,
    public readonly details?: unknown
  ) {
    super(message);
    this.name = "GithubError";
  }
}
