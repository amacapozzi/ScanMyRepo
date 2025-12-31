import type {
  AiReviewer,
  RepoProvider,
  RepoRef,
  RepoScanReport,
  RepoFile,
  SkippedFile,
  SkipReason,
  Finding,
  ScanProgressReporter
} from "./contracts";

type RepoScannerDeps = {
  repoProvider: RepoProvider;
  aiReviewer: AiReviewer;

  maxFileBytes?: number;
  maxFiles?: number;
  concurrency?: number;

  progress?: ScanProgressReporter;
};

export class RepoScannerService {
  private readonly repoProvider: RepoProvider;
  private readonly aiReviewer: AiReviewer;

  private readonly maxFileBytes: number;
  private readonly maxFiles: number | undefined;
  private readonly concurrency: number;

  private readonly progress?: ScanProgressReporter;

  constructor(deps: RepoScannerDeps) {
    this.repoProvider = deps.repoProvider;
    this.aiReviewer = deps.aiReviewer;

    this.maxFileBytes = deps.maxFileBytes ?? 180_000;
    this.maxFiles = deps.maxFiles;
    this.concurrency = Math.max(1, deps.concurrency ?? 2);

    this.progress = deps.progress;
  }

  async scanRepo(repo: RepoRef): Promise<RepoScanReport> {
    const filesAll = await this.repoProvider.listFiles(repo);
    const files = this.maxFiles ? filesAll.slice(0, this.maxFiles) : filesAll;

    this.progress?.({
      type: "repo.start",
      owner: repo.owner,
      repo: repo.repo,
      ref: repo.ref,
      totalFiles: files.length
    });

    const skipped: SkippedFile[] = [];
    const findings: Finding[] = [];

    const queue = [...files];
    const workers = Array.from({ length: this.concurrency }).map(async () => {
      while (queue.length) {
        const file = queue.shift();
        if (!file) return;

        const outcome = await this.scanSingleFile(repo, file).catch((err) => {
          const message = err instanceof Error ? err.message : String(err);

          skipped.push({
            path: file.path,
            reason: "AI_ERROR",
            detail: message
          });

          this.progress?.({ type: "ai.request.error", path: file.path, message });
          return null;
        });

        if (!outcome) continue;

        if (outcome.type === "skipped") {
          skipped.push(outcome.data);
          this.progress?.({
            type: "file.skip",
            path: outcome.data.path,
            reason: outcome.data.reason,
            detail: outcome.data.detail
          });
          continue;
        }

        findings.push(...outcome.data.findings);
      }
    });

    await Promise.all(workers);

    const byReason = this.buildSkipCounters(skipped);

    const report: RepoScanReport = {
      repo,
      scannedFiles: files.length - skipped.length,
      skippedFiles: {
        total: skipped.length,
        byReason,
        items: skipped
      },
      findings,
      summary: {
        critical: findings.filter((f) => f.severity === "critical").length,
        high: findings.filter((f) => f.severity === "high").length,
        medium: findings.filter((f) => f.severity === "medium").length,
        low: findings.filter((f) => f.severity === "low").length,
        info: findings.filter((f) => f.severity === "info").length
      }
    };

    this.progress?.({
      type: "repo.done",
      scannedFiles: report.scannedFiles,
      skippedFiles: report.skippedFiles.total,
      findings: report.findings.length
    });

    return report;
  }

  private async scanSingleFile(
    repo: RepoRef,
    file: RepoFile
  ): Promise<
    { type: "skipped"; data: SkippedFile } | { type: "scanned"; data: { findings: Finding[] } }
  > {
    this.progress?.({ type: "file.start", path: file.path, sizeBytes: file.sizeBytes });

    if (typeof file.sizeBytes === "number" && file.sizeBytes > this.maxFileBytes) {
      return {
        type: "skipped",
        data: {
          path: file.path,
          reason: "FILE_TOO_LARGE_LOCAL",
          detail: `sizeBytes=${file.sizeBytes} > maxFileBytes=${this.maxFileBytes}`
        }
      };
    }

    if (this.looksBinaryPath(file.path)) {
      return { type: "skipped", data: { path: file.path, reason: "BINARY_OR_UNSUPPORTED" } };
    }

    let content: string;
    let sizeBytes: number | undefined;

    try {
      const read = await this.repoProvider.readFile({ ...repo, path: file.path });
      content = read.content;
      sizeBytes = read.sizeBytes;

      this.progress?.({ type: "file.read.ok", path: file.path, sizeBytes });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this.progress?.({ type: "file.read.error", path: file.path, message });

      return {
        type: "skipped",
        data: { path: file.path, reason: "READ_ERROR", detail: message }
      };
    }

    if (typeof sizeBytes === "number" && sizeBytes > this.maxFileBytes) {
      return {
        type: "skipped",
        data: {
          path: file.path,
          reason: "FILE_TOO_LARGE_LOCAL",
          detail: `sizeBytes=${sizeBytes} > maxFileBytes=${this.maxFileBytes}`
        }
      };
    }

    if (!content.trim()) {
      return { type: "scanned", data: { findings: [] } };
    }

    this.progress?.({ type: "ai.request.start", path: file.path });

    try {
      const out = await this.aiReviewer.reviewFile({
        path: file.path,
        content,
        repo,
        metadata: { sizeBytes }
      });

      this.progress?.({
        type: "ai.request.ok",
        path: file.path,
        findingsCount: out.findings.length
      });

      return { type: "scanned", data: { findings: out.findings } };
    } catch (err) {
      const mapped = this.mapAiErrorToSkip(err);
      const message = err instanceof Error ? err.message : String(err);

      this.progress?.({ type: "ai.request.error", path: file.path, message });

      if (mapped) {
        return { type: "skipped", data: { path: file.path, ...mapped } };
      }

      return {
        type: "skipped",
        data: { path: file.path, reason: "AI_ERROR", detail: message }
      };
    }
  }

  private buildSkipCounters(items: SkippedFile[]): Record<SkipReason, number> {
    const reasons: SkipReason[] = [
      "FILE_TOO_LARGE_LOCAL",
      "REQUEST_TOO_LARGE_REMOTE",
      "CONTEXT_LIMIT",
      "BINARY_OR_UNSUPPORTED",
      "READ_ERROR",
      "AI_ERROR"
    ];

    const base = Object.fromEntries(reasons.map((r) => [r, 0])) as Record<SkipReason, number>;
    for (const it of items) base[it.reason] = (base[it.reason] ?? 0) + 1;
    return base;
  }

  private mapAiErrorToSkip(err: unknown): { reason: SkipReason; detail?: string } | null {
    const anyErr = err as any;
    const status = anyErr?.status ?? anyErr?.response?.status;
    const message = String(anyErr?.message ?? anyErr?.error?.message ?? "");

    if (status === 413 || /request entity too large|too large/i.test(message)) {
      return { reason: "REQUEST_TOO_LARGE_REMOTE", detail: message };
    }

    if (/context length|maximum context|too many tokens|tokens/i.test(message)) {
      return { reason: "CONTEXT_LIMIT", detail: message };
    }

    return null;
  }

  private looksBinaryPath(path: string): boolean {
    const lower = path.toLowerCase();
    const binaryExt = [
      ".png",
      ".jpg",
      ".jpeg",
      ".webp",
      ".gif",
      ".ico",
      ".pdf",
      ".zip",
      ".gz",
      ".rar",
      ".7z",
      ".exe",
      ".dll",
      ".so",
      ".dylib",
      ".mp4",
      ".mov",
      ".mp3",
      ".woff",
      ".woff2",
      ".ttf",
      ".otf",
      ".lockb"
    ];
    return binaryExt.some((ext) => lower.endsWith(ext));
  }
}
