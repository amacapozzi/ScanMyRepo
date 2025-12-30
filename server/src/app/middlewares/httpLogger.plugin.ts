import type { Elysia } from "elysia";

import type { Logger } from "@shared/logger/Logger";

type HttpLoggerCtx = {
  __reqStart: number;
};

export const httpLoggerPlugin = (logger: Logger) => (app: Elysia) =>
  app
    .derive(
      (): HttpLoggerCtx => ({
        __reqStart: performance.now()
      })
    )
    .onAfterHandle(({ request, set, __reqStart }) => {
      const durationMs = Math.round(performance.now() - __reqStart);
      const path = new URL(request.url).pathname;

      logger.info("HTTP request", {
        method: request.method,
        path,
        status: set.status ?? 200,
        durationMs
      });
    })
    .onError(({ request, set, code, error, __reqStart }) => {
      const start = typeof __reqStart === "number" ? __reqStart : performance.now();
      const durationMs = Math.round(performance.now() - start);
      const path = new URL(request.url).pathname;

      logger.error("HTTP error", {
        method: request.method,
        path,
        status: set.status ?? 500,
        code,
        durationMs,
        error
      });
    });
