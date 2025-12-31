import { GithubService } from "@modules/github/infra/github.service";
import { GithubRepoProviderAdapter } from "@modules/github/infra/githubRepoProvider.adapter";
import type { ScanProgressEvent } from "@modules/repo-scan/domain/contracts";
import { GroqClient } from "@modules/repo-scan/domain/infra/groq/groq.client";
import { GroqAiReviewer } from "@modules/repo-scan/domain/infra/groq/groqAiReviewer";
import { RepoScannerService } from "@modules/repo-scan/domain/repoScanner.service";

export function buildRepoScanner(input: { githubToken?: string; groqApiKey: string }) {
  const github = new GithubService({
    token: input.githubToken,
    userAgent: "scanmyrepo-bot"
  });

  const repoProvider = new GithubRepoProviderAdapter(github);

  const groqClient = new GroqClient(input.groqApiKey);
  const aiReviewer = new GroqAiReviewer({
    groqClient,
    model: "llama-3.1-8b-instant"
  });

  return new RepoScannerService({
    repoProvider,
    aiReviewer,
    maxFileBytes: 180_000,
    concurrency: 2,
    progress: createConsoleProgressLogger()
  });
}

function createConsoleProgressLogger() {
  let total = 0;
  let done = 0;
  let skipped = 0;

  return (e: ScanProgressEvent) => {
    switch (e.type) {
      case "repo.start":
        total = e.totalFiles;
        done = 0;
        skipped = 0;
        console.log(`[SCAN] start ${e.owner}/${e.repo} ref=${e.ref ?? "default"} files=${total}`);
        break;

      case "file.start":
        console.log(`[SCAN] [${Math.min(done + skipped + 1, total)}/${total}] file ${e.path}`);
        break;

      case "file.skip":
        skipped++;
        console.warn(`[SCAN] skip ${e.path} reason=${e.reason}${e.detail ? ` | ${e.detail}` : ""}`);
        break;

      case "ai.request.ok":
        done++;
        console.log(`[SCAN] ok ${e.path} findings=${e.findingsCount}`);
        break;

      case "ai.request.error":
        skipped++;
        console.error(`[SCAN] ai error ${e.path} | ${e.message}`);
        break;

      case "repo.done":
        console.log(
          `[SCAN] done scanned=${e.scannedFiles} skipped=${e.skippedFiles} findings=${e.findings}`
        );
        break;
    }
  };
}
