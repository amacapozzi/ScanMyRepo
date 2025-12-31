import { GithubError } from "@modules/github/domain/github.errors";
import type {
  GithubRepo,
  GithubRepoTree,
  GithubServiceOptions,
  GithubTreeItem
} from "@modules/github/domain/github.types";
import { GithubHttpClient } from "@modules/github/infra/github.http";

export class GithubService {
  private readonly http: GithubHttpClient;

  constructor(opts: GithubServiceOptions = {}) {
    const baseUrl = opts.baseUrl ?? "https://api.github.com";
    const timeoutMs = opts.timeoutMs ?? 20_000;

    this.http = new GithubHttpClient({
      baseUrl,
      token: opts.token,
      userAgent: opts.userAgent ?? "scanmyrepo-bot",
      timeoutMs
    });
  }

  async listUserRepos(username: string): Promise<GithubRepo[]> {
    if (!username?.trim()) return [];

    const perPage = 100;
    let page = 1;
    const all: GithubRepo[] = [];

    while (true) {
      const chunk = await this.http.get<GithubRepo[]>(
        `/users/${encodeURIComponent(username)}/repos`,
        {
          per_page: perPage,
          page,
          sort: "updated",
          direction: "desc"
        }
      );

      all.push(...chunk);

      if (chunk.length < perPage) break;
      page++;
    }

    return all;
  }

  async getBlob(owner: string, repo: string, sha: string) {
    try {
      const blob = await this.http.get<{
        sha: string;
        size: number;
        encoding: "base64";
        content: string;
      }>(
        `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/git/blobs/${encodeURIComponent(sha)}`
      );

      return blob;
    } catch {
      throw new GithubError(
        `Failed to fetch blob ${sha} (${owner}/${repo})`,
        "GITHUB_BAD_RESPONSE"
      );
    }
  }

  async getRepoTree(owner: string, repo: string, ref?: string): Promise<GithubRepoTree> {
    const repoInfo = await this.http.get<{ default_branch: string }>(
      `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`
    );

    const resolvedRef = ref?.trim() || repoInfo.default_branch;

    const refData = await this.tryResolveRefToSha(owner, repo, resolvedRef);
    const sha = refData.sha;

    const tree = await this.http.get<GithubRepoTree>(
      `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/git/trees/${encodeURIComponent(sha)}`,
      { recursive: 1 }
    );

    return tree;
  }

  filterScanableFiles(
    items: GithubTreeItem[],
    opts?: { exclude?: string[]; extensions?: string[] }
  ): GithubTreeItem[] {
    const exclude = new Set((opts?.exclude ?? defaultExcludeDirs()).map(normalizePrefix));
    const exts = opts?.extensions?.map((e) => (e.startsWith(".") ? e : `.${e}`)) ?? null;

    return items
      .filter((i) => i.type === "blob")
      .filter((i) => !isExcluded(i.path, exclude))
      .filter((i) => (exts ? exts.some((e) => i.path.toLowerCase().endsWith(e)) : true));
  }

  private async tryResolveRefToSha(
    owner: string,
    repo: string,
    ref: string
  ): Promise<{ sha: string }> {
    if (looksLikeSha(ref)) return { sha: ref };

    try {
      const head = await this.http.get<{ object: { sha: string } }>(
        `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/git/ref/heads/${encodeURIComponent(ref)}`
      );
      return { sha: head.object.sha };
    } catch {}

    try {
      const tag = await this.http.get<{ object: { sha: string } }>(
        `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/git/ref/tags/${encodeURIComponent(ref)}`
      );
      return { sha: tag.object.sha };
    } catch {}

    throw new GithubError(
      `I couldn't solve the ref "${ref}" to a SHA (branch/tag/sha)`,
      "GITHUB_BAD_RESPONSE"
    );
  }
}

function looksLikeSha(ref: string): boolean {
  return /^[a-f0-9]{7,40}$/i.test(ref.trim());
}

function defaultExcludeDirs(): string[] {
  return [
    "node_modules/",
    "dist/",
    "build/",
    ".next/",
    ".turbo/",
    ".git/",
    "coverage/",
    "vendor/",
    ".cache/"
  ];
}

function normalizePrefix(p: string): string {
  const x = p.trim().replaceAll("\\", "/");
  return x.endsWith("/") ? x : `${x}/`;
}

function isExcluded(path: string, excludePrefixes: Set<string>): boolean {
  const norm = path.replaceAll("\\", "/");
  for (const pre of excludePrefixes) {
    if (norm.startsWith(pre)) return true;
  }
  return false;
}

function decodeBase64ToUtf8(b64: string): string {
  const cleaned = b64.replace(/\n/g, "");
  return Buffer.from(cleaned, "base64").toString("utf8");
}
