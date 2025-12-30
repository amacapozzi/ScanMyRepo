import { githubRoutes } from "@modules/github/http/github.routes";
import { createLogger } from "@shared/logger/logger";

export function buildApp() {
  const logger = createLogger("app");

  return {
    logger,
    modules: [githubRoutes]
  };
}
