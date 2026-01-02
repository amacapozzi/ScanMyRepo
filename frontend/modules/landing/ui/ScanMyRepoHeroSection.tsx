"use client";

import React from "react";
import type { RepoSearchSubmit } from "../repoSearch.types";
import { HeroSearch } from "./HeroSearch";
import { ScanMyRepoShell } from "./ScanMyRepoShell";
import { ScanMyRepoNavbar } from "./ScanMyRepoNavbar";

type Props = {
  onSearch: RepoSearchSubmit;
};

export function ScanMyRepoHeroSection({ onSearch }: Props) {
  return (
    <ScanMyRepoShell>
      <ScanMyRepoNavbar />

      <main className="relative z-10 flex-1 -mt-10 flex flex-col items-center justify-center text-center px-6">
        <div className="group inline-flex items-center gap-2 px-5 py-2 rounded-full bg-blue-950/20 border border-blue-500/20 text-blue-200 text-base font-medium mb-10">
          AI-powered repository auditing in seconds
        </div>
        <h1 className="text-5xl md:text-6xl lg:text-7xl font-semibold tracking-tight leading-[1.08] mb-8 max-w-5xl drop-shadow-2xl">
          <span className="bg-linear-to-b from-gray-100 via-blue-100 to-blue-300 bg-clip-text text-transparent">
            Scan repos.
          </span>{" "}
          <span className="text-white">Ship better code.</span>
        </h1>

        <p className="text-xl md:text-2xl text-gray-400 leading-relaxed max-w-3xl mb-10 font-medium">
          Enter a GitHub username and explore repositories with deep analysis:
          structure, bugs, performance, security risks, and clear AI
          explanations.
        </p>

        <HeroSearch onSubmit={onSearch} />
      </main>
    </ScanMyRepoShell>
  );
}
