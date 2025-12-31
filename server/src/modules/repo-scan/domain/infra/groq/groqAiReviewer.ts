import { z } from "zod";

import type {
  AiReviewer,
  FileScanInput,
  FileScanOutput
} from "@modules/repo-scan/domain/contracts";
import { GroqClient } from "@modules/repo-scan/domain/infra/groq/groq.client";
import { buildRepoFileScanPrompt } from "@modules/repo-scan/domain/infra/groq/prompts/repoFileScanPrompt";

const FindingSchema = z.object({
  id: z.string(),
  path: z.string(),
  title: z.string(),
  severity: z.enum(["info", "low", "medium", "high", "critical"]),
  category: z.enum([
    "security",
    "malware",
    "secrets",
    "dependencies",
    "code-smell",
    "performance",
    "testing",
    "dx",
    "architecture",
    "other"
  ]),
  evidence: z.string().optional(),
  recommendation: z.string(),
  patch: z
    .object({
      language: z.string().optional(),
      diff: z.string().optional()
    })
    .optional(),
  confidence: z.number().min(0).max(1)
});

const OutputSchema = z.object({
  codeSummary: z.string().min(5),
  technicalSummary: z.string().min(5),
  findings: z.array(FindingSchema)
});

type ReviewerDeps = {
  groqClient: GroqClient;
  model?: string;
};

export class GroqAiReviewer implements AiReviewer {
  private readonly groq: GroqClient;
  private readonly model: string;

  constructor(deps: ReviewerDeps) {
    this.groq = deps.groqClient;
    this.model = deps.model ?? "llama-3.1-8b-instant";
  }

  async reviewFile(input: FileScanInput): Promise<FileScanOutput> {
    const { system, user } = buildRepoFileScanPrompt({
      repo: input.repo,
      path: input.path,
      content: input.content
    });

    const { json } = await this.groq.chatJSON<unknown>(
      [
        { role: "system", content: system },
        { role: "user", content: user }
      ],
      { model: this.model, temperature: 0.2, maxCompletionTokens: 900 }
    );

    const parsed = OutputSchema.safeParse(json);
    if (!parsed.success) {
      throw new Error(`Invalid AI JSON schema: ${parsed.error.message}`);
    }

    return {
      codeSummary: parsed.data.codeSummary,
      technicalSummary: parsed.data.technicalSummary,
      findings: parsed.data.findings.map((f) => ({ ...f, path: input.path }))
    };
  }
}
