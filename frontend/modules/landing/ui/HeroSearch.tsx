"use client";

import React, { useId, useMemo, useState } from "react";
import { AlertCircle, ArrowRight, Github, Search } from "lucide-react";
import type { RepoSearchSubmit } from "../repoSearch.types";
import {
  isValidGithubUsername,
  normalizeGithubUsername,
} from "../repoSearch.schema";
import { cn } from "@/shared/lib/utils";

type Props = {
  onSubmit: RepoSearchSubmit;
  defaultValue?: string;
};

function extractUsername(input: string) {
  const raw = input.trim();
  const urlMatch = raw.match(
    /(?:https?:\/\/)?(?:www\.)?github\.com\/([^/?#]+)/i
  );
  if (urlMatch?.[1]) return urlMatch[1];

  return raw.replace(/^@/, "");
}

export function HeroSearch({ onSubmit, defaultValue = "" }: Props) {
  const inputId = useId();
  const [value, setValue] = useState(defaultValue);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const normalized = useMemo(
    () => normalizeGithubUsername(extractUsername(value)),
    [value]
  );
  const canSubmit = useMemo(
    () => isValidGithubUsername(normalized),
    [normalized]
  );

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!canSubmit) return;

    try {
      setIsSubmitting(true);
      await onSubmit({ username: normalized });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-3xl mx-auto">
      <label htmlFor={inputId} className="sr-only">
        GitHub username
      </label>

      <div
        className={cn(
          "relative flex items-center gap-3 rounded-2xl border border-white/10 bg-white/3 px-4 py-3",
          "shadow-[0_0_40px_-18px_rgba(59,130,246,0.25)]",
          "focus-within:border-blue-400/35 focus-within:shadow-[0_0_55px_-16px_rgba(59,130,246,0.35)]",
          "transition-all duration-300"
        )}
      >
        <div className="flex items-center gap-2 text-gray-400">
          <Github className="w-5 h-5" />
          <span className="hidden sm:inline text-sm font-medium">
            github.com/
          </span>
        </div>

        <div className="relative flex-1">
          <Search className="absolute left-0 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input
            id={inputId}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder='Enter a GitHub username (e.g. "amacapozzi")'
            autoComplete="off"
            spellCheck={false}
            className="w-full bg-transparent pl-7 pr-3 text-lg text-white placeholder:text-gray-500 outline-none py-2"
          />
        </div>

        <button
          type="submit"
          disabled={!canSubmit || isSubmitting}
          className={cn(
            "shrink-0 inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-base font-medium",
            "border border-blue-400/20 bg-[#172554]/40 hover:bg-[#1e3a8a]/50 hover:border-blue-400/40",
            "text-blue-50 transition-all duration-300",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            "shadow-[0_0_40px_-14px_rgba(59,130,246,0.25)] hover:shadow-[0_0_40px_-8px_rgba(59,130,246,0.42)]"
          )}
        >
          {isSubmitting ? "Searching..." : "Search repos"}
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>

      {!canSubmit && normalized.length > 0 ? (
        <div className="mt-3 flex items-center justify-center gap-2 text-sm text-gray-400">
          <AlertCircle className="w-4 h-4" />
          <span>
            Invalid username. Use letters/numbers and hyphens (no “--”).
          </span>
        </div>
      ) : (
        <p className="mt-3 text-sm text-gray-500 text-center">
          Tip: you can paste a full GitHub URL — it will be normalized
          automatically (e.g.{" "}
          <span className="text-gray-400">github.com/user</span>)
        </p>
      )}
    </form>
  );
}
