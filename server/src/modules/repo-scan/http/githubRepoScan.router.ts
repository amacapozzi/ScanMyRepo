import { Elysia, t } from "elysia";

import type { RepoScannerService } from "@modules/repo-scan/domain/repoScanner.service";

export function githubRepoScanRouter(deps: { repoScanner: RepoScannerService }) {
  return new Elysia({ prefix: "/github/scanner" }).post(
    "/scan",
    async ({ body }) => {
      const report = await deps.repoScanner.scanRepo({
        owner: body.owner,
        repo: body.repo,
        ref: body.ref
      });

      return { ok: true as const, data: report };
    },
    {
      body: t.Object({
        owner: t.String({ minLength: 1 }),
        repo: t.String({ minLength: 1 }),
        ref: t.Optional(t.String({ minLength: 1 }))
      })
    }
  );
}
