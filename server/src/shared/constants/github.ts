import { env } from "elysia";

const GITHUB_CONSTS = {
  secret: env.GITHUB_SECRET!,
  baseUrl: "https://api.github.com",
  timeoutMs: 20_000
};

export { GITHUB_CONSTS };
