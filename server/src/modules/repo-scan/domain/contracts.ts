export type ScanProgressEvent =
  | { type: "repo.start"; owner: string; repo: string; ref?: string; totalFiles: number }
  | { type: "file.start"; path: string; sizeBytes?: number }
  | { type: "file.read.ok"; path: string; sizeBytes?: number }
  | { type: "file.read.error"; path: string; message: string }
  | { type: "file.skip"; path: string; reason: SkipReason; detail?: string }
  | { type: "ai.request.start"; path: string }
  | { type: "ai.request.ok"; path: string; findingsCount: number }
  | { type: "ai.request.error"; path: string; message: string }
  | { type: "repo.done"; scannedFiles: number; skippedFiles: number; findings: number };

export type ScanProgressReporter = (event: ScanProgressEvent) => void;

export type RepoFile = {
  path: string;
  sha?: string;
  sizeBytes?: number;
  extension?: string;
};

export type RepoRef = {
  owner: string;
  repo: string;
  ref?: string;
};

export type ReadFileResult = {
  content: string;
  sizeBytes?: number;
};

export interface RepoProvider {
  listFiles(input: RepoRef): Promise<RepoFile[]>;
  readFile(input: RepoRef & { path: string }): Promise<ReadFileResult>;
}

export type SkipReason =
  | "FILE_TOO_LARGE_LOCAL"
  | "REQUEST_TOO_LARGE_REMOTE"
  | "CONTEXT_LIMIT"
  | "BINARY_OR_UNSUPPORTED"
  | "READ_ERROR"
  | "AI_ERROR";

export type SkippedFile = {
  path: string;
  reason: SkipReason;
  detail?: string;
};

export type Severity = "info" | "low" | "medium" | "high" | "critical";

export type Finding = {
  id: string;
  path: string;
  title: string;
  severity: Severity;
  category:
    | "security"
    | "malware"
    | "secrets"
    | "dependencies"
    | "code-smell"
    | "performance"
    | "testing"
    | "dx"
    | "architecture"
    | "other";
  evidence?: string;
  recommendation: string;
  patch?: {
    language?: string;
    diff?: string;
  };
  confidence: number;
};

export type FileScanInput = {
  path: string;
  content: string;
  repo: RepoRef;
  metadata?: {
    sizeBytes?: number;
  };
};

export type FileScanOutput = {
  codeSummary: string;
  technicalSummary: string;
  findings: Finding[];
};

export interface AiReviewer {
  reviewFile(input: FileScanInput): Promise<FileScanOutput>;
}

export type RepoScanReport = {
  repo: RepoRef;
  scannedFiles: number;
  skippedFiles: {
    total: number;
    byReason: Record<SkipReason, number>;
    items: SkippedFile[];
  };
  findings: Finding[];
  summary: {
    critical: number;
    high: number;
    medium: number;
    low: number;
    info: number;
  };
};
