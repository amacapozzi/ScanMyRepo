import { createLogger } from "@shared/logger/logger";

export function buildApp() {
  const logger = createLogger("app");

  return {
    logger,
    modules: []
  };
}
