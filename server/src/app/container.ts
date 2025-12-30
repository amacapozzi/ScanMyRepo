import { githubModule } from "@modules/github/router";
import { createLogger } from "@shared/logger/logger";

export function buildApp() {
  const logger = createLogger("app");

  return {
    logger,
    modules: [githubModule]
  };
}
