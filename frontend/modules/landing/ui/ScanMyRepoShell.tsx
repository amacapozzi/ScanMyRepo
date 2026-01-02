import React from "react";
import { GlowBackground } from "./GlowBackground";

type ScanMyRepoShellProps = {
  children: React.ReactNode;
};

export function ScanMyRepoShell({ children }: ScanMyRepoShellProps) {
  return (
    <div className="relative min-h-screen bg-[#030305] text-white antialiased selection:bg-blue-500/30">
      <GlowBackground />

      <div className="relative z-10 flex min-h-screen items-center justify-center p-4 md:p-8">
        <div
          className="
            relative
            flex
            w-full
            max-w-350
            min-h-175
            aspect-16/10
            flex-col
            overflow-hidden
          "
        >
          {children}
        </div>
      </div>
    </div>
  );
}
