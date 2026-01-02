import React from "react";

export function GlowBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <div className="absolute -top-65 left-1/2 h-175 w-300 -translate-x-1/2 rounded-full bg-blue-900/10 blur-[140px]" />

      <div className="absolute inset-0 bg-linear-to-b from-black/35 via-transparent to-black/55" />

      <div className="absolute -bottom-[30%] left-0 right-0 h-[70%] bg-blue-600/20 blur-[140px]" />
      <div className="absolute -bottom-[18%] left-1/2 h-[45%] w-[85%] -translate-x-1/2 rounded-[999px] bg-white/10 blur-[110px]" />
      <div className="absolute bottom-0 left-1/2 h-80 w-full -translate-x-1/2 bg-linear-to-t from-blue-500/10 via-blue-400/5 to-transparent blur-3xl" />
    </div>
  );
}
