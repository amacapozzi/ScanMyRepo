import { Elysia } from "elysia";

import { buildApp } from "@app/container";
import { httpLoggerPlugin } from "@app/middlewares/httpLogger.plugin";
import { env } from "@shared/env/env";
import { createLogger } from "@shared/logger/createLogger";

const httpLogger = createLogger("SERVER");

function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;

  if (typeof err === "object" && err !== null && "message" in err) {
    const m = (err as { message?: unknown }).message;
    if (typeof m === "string") return m;
  }

  try {
    return JSON.stringify(err);
  } catch {
    return "Unknown error";
  }
}

export function createServer() {
  const { PORT } = env();
  const { logger, modules } = buildApp();

  const app = new Elysia({ prefix: "/api" })
    .use(httpLoggerPlugin(httpLogger))
    .onError(({ code, error, set }) => {
      set.status = code === "NOT_FOUND" ? 404 : 500;
      return { ok: false, code, message: getErrorMessage(error) };
    });

  for (const mod of modules) app.use(mod);

  logger.info(`Server ready on http://localhost:${PORT}`);

  return { app, PORT };
}
