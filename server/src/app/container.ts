import { githubRoutes } from "@modules/github/http/github.routes";
import { createLogger } from "@shared/logger/createLogger";

export function buildApp() {
  const logger = createLogger("app");

  return {
    logger,
    modules: [githubRoutes]
  };
}
