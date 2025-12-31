import type { GithubTreeItem } from "@modules/github/domain/github.types";
import { GithubService } from "@modules/github/infra/github.service";
import type {
  RepoProvider,
  RepoRef,
  RepoFile,
  ReadFileResult
} from "@modules/repo-scan/domain/contracts";

export class GithubRepoProviderAdapter implements RepoProvider {
  constructor(private readonly github: GithubService) {}

  async listFiles(input: RepoRef): Promise<RepoFile[]> {
    const tree = await this.github.getRepoTree(input.owner, input.repo, input.ref);

    const scanables = this.github.filterScanableFiles(tree.tree as GithubTreeItem[]);

    return scanables.map((i) => ({
      path: i.path,
      sha: i.sha,
      sizeBytes: i.size,
      extension: extOf(i.path)
    }));
  }

  async readFile(input: RepoRef & { path: string }): Promise<ReadFileResult> {
    const tree = await this.github.getRepoTree(input.owner, input.repo, input.ref);

    const item = (tree.tree as GithubTreeItem[]).find(
      (x) => x.type === "blob" && x.path === input.path
    );

    if (!item?.sha) {
      throw new Error(`File not found in repo tree: ${input.path}`);
    }

    const blob = await this.github.getBlob(input.owner, input.repo, item.sha);

    const content = decodeBase64ToUtf8(blob.content);

    return { content, sizeBytes: blob.size };
  }
}

function extOf(path: string): string | undefined {
  const idx = path.lastIndexOf(".");
  if (idx === -1) return undefined;
  return path.slice(idx + 1).toLowerCase();
}

function decodeBase64ToUtf8(b64: string): string {
  const cleaned = b64.replace(/\n/g, "");
  return Buffer.from(cleaned, "base64").toString("utf8");
}
