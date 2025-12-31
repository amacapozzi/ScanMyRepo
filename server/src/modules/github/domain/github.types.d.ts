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
export type GithubRepo = {
  id: number;
  name: string;
  full_name: string;
  private: boolean;
  html_url: string;
  default_branch: string;
  fork: boolean;
  archived: boolean;
  disabled: boolean;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  updated_at: string;
};

export type GithubTreeItemType = "blob" | "tree";

export type GithubTreeItem = {
  path: string;
  mode: string;
  type: GithubTreeItemType;
  sha: string;
  size?: number;
  url: string;
};

export type GithubRepoTree = {
  sha: string;
  truncated: boolean;
  tree: GithubTreeItem[];
};

export type GithubServiceOptions = {
  token?: string;
  baseUrl?: string;
  userAgent?: string;
  timeoutMs?: number;
};

export type GithubBlob = {
  sha: string;
  size: number;
  encoding: "base64";
  content: string;
};
