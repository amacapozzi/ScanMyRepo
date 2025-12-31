import { githubRoutes } from "@modules/github/http/github.routes";
import { buildRepoScanner } from "@modules/repo-scan/container/repoScan.container";
import { githubRepoScanRouter } from "@modules/repo-scan/http/githubRepoScan.router";
import { GITHUB_CONSTS } from "@shared/constants/github";
import { GROQ_CONSTS } from "@shared/constants/groq";
import { createLogger } from "@shared/logger/createLogger";

export function buildApp() {
  const logger = createLogger("app");

  const repoScanner = buildRepoScanner({
    githubToken: GITHUB_CONSTS.secret,
    groqApiKey: GROQ_CONSTS.apiKey
  });

  return {
    logger,
    modules: [githubRoutes, githubRepoScanRouter({ repoScanner })]
  };
}
