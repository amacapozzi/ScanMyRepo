type Level = "debug" | "info" | "warn" | "error";

export function createLogger(scope: string) {
  const log = (level: Level, message: string, meta?: unknown) => {
    const line = `[${new Date().toISOString()}] ${level.toUpperCase()} ${scope} - ${message}`;
    meta ? console.log(line, meta) : console.log(line);
  };

  return {
    debug: (m: string, meta?: unknown) => log("debug", m, meta),
    info: (m: string, meta?: unknown) => log("info", m, meta),
    warn: (m: string, meta?: unknown) => log("warn", m, meta),
    error: (m: string, meta?: unknown) => log("error", m, meta)
  };
}
