"use client";
import { ScanMyRepoHeroSection } from "@/modules/landing/ui/ScanMyRepoHeroSection";
import type { RepoSearchInput } from "@/modules/landing/repoSearch.types";

export default function MarketingPage() {
  async function handleSearch({ username }: RepoSearchInput) {
    console.log("Searching repositories for:", username);
  }

  return <ScanMyRepoHeroSection onSearch={handleSearch} />;
}
