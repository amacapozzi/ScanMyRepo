import { GithubError } from "@modules/github/domain/github.errors";

type HttpClientConfig = {
  baseUrl: string;
  token?: string;
  userAgent?: string;
  timeoutMs: number;
};

export class GithubHttpClient {
  constructor(private readonly cfg: HttpClientConfig) {}

  async get<T>(
    path: string,
    query?: Record<string, string | number | boolean | undefined>
  ): Promise<T> {
    const url = new URL(this.cfg.baseUrl + path);

    if (query) {
      for (const [k, v] of Object.entries(query)) {
        if (v === undefined) continue;
        url.searchParams.set(k, String(v));
      }
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.cfg.timeoutMs);

    try {
      const res = await fetch(url, {
        method: "GET",
        headers: {
          Accept: "application/vnd.github+json",
          ...(this.cfg.userAgent ? { "User-Agent": this.cfg.userAgent } : {}),
          ...(this.cfg.token ? { Authorization: `Bearer ${this.cfg.token}` } : {}),
          "X-GitHub-Api-Version": "2022-11-28"
        },
        signal: controller.signal
      });

      if (res.status === 404) {
        throw new GithubError("Resource not found on GitHub", "GITHUB_NOT_FOUND", 404);
      }

      if (res.status === 403) {
        const remaining = res.headers.get("x-ratelimit-remaining");
        if (remaining === "0") {
          throw new GithubError("Rate limit reached on GitHub", "GITHUB_RATE_LIMIT", 403, {
            reset: res.headers.get("x-ratelimit-reset")
          });
        }
      }
      if (res.status === 429) {
        throw new GithubError("Too Many Requests (rate limit).", "GITHUB_RATE_LIMIT", 429);
      }

      if (!res.ok) {
        const text = await safeReadText(res);
        throw new GithubError("GitHub HTTP error", "GITHUB_HTTP_ERROR", res.status, text);
      }

      const data = (await res.json()) as T;
      return data;
    } catch (err: any) {
      if (err?.name === "AbortError") {
        throw new GithubError("Timeout calling GitHub", "GITHUB_TIMEOUT");
      }
      if (err instanceof GithubError) throw err;
      throw new GithubError(
        "Invalid response or unknown error",
        "GITHUB_BAD_RESPONSE",
        undefined,
        err
      );
    } finally {
      clearTimeout(timeout);
    }
  }
}

async function safeReadText(res: Response): Promise<string | undefined> {
  try {
    return await res.text();
  } catch {
    return undefined;
  }
}
