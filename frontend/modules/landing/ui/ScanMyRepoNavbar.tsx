import React from "react";

type Props = {
  onDemoClick?: () => void;
};

export function ScanMyRepoNavbar({ onDemoClick }: Props) {
  return (
    <nav className="z-20 relative flex items-center justify-between pt-8 pb-8 px-8 md:px-12">
      <div className="text-3xl font-bold tracking-tight text-white select-none">
        ScanMyRepo
      </div>

      <div className="hidden lg:flex items-center gap-10 text-lg text-gray-400 font-medium">
        <a href="#" className="text-white transition-colors">
          Home
        </a>
        <a href="#" className="hover:text-white transition-colors">
          How it works
        </a>
        <a href="#" className="hover:text-white transition-colors">
          Features
        </a>
        <a href="#" className="hover:text-white transition-colors">
          Pricing
        </a>
        <a href="#" className="hover:text-white transition-colors">
          Docs
        </a>
      </div>

      <button
        type="button"
        onClick={onDemoClick}
        className="relative px-6 py-2.5 rounded-full bg-[#0a0a0c] text-white text-base font-medium border border-white/10
        shadow-[inset_0_-3px_8px_-1px_rgba(59,130,246,0.4)]
        hover:shadow-[inset_0_-3px_12px_-1px_rgba(59,130,246,0.6),0_0_15px_-3px_rgba(59,130,246,0.3)]
        hover:border-blue-500/30 transition-all duration-300"
      >
        View demo
      </button>
    </nav>
  );
}
