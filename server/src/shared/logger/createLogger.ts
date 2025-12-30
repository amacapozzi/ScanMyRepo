import { Logger, LogLevel } from "@shared/logger/Logger";

export function createLogger(scope: string): Logger {
  const log = (level: LogLevel, message: string, meta?: unknown) => {
    const line = `[${new Date().toISOString()}] ${level.toUpperCase()} ${scope} - ${message}`;

    meta ? console.log(line, meta) : console.log(line);
  };

  return {
    debug: (m, meta) => log("debug", m, meta),
    info: (m, meta) => log("info", m, meta),
    warn: (m, meta) => log("warn", m, meta),
    error: (m, meta) => log("error", m, meta)
  };
}
