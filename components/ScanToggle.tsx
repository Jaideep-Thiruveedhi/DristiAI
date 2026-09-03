"use client";

import { Eye, EyeOff } from "lucide-react";

interface ScanToggleProps {
  enabled: boolean;
  onToggle: () => void;
  disabled?: boolean;
}

export default function ScanToggle({ enabled, onToggle, disabled }: ScanToggleProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        aria-label="View Grad-CAM Attention Overlay"
        aria-pressed={enabled}
        disabled={disabled}
        onClick={onToggle}
        className={`group relative inline-flex items-center gap-3 rounded-[2px] border px-1 py-1 pr-4 font-mono text-xs font-bold tracking-wide transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#22D3EE] disabled:cursor-not-allowed disabled:opacity-50 ${
          enabled ? "border-[#22D3EE]/40 bg-[#22D3EE]/10 text-[#22D3EE]" : "border-[#2A2D31] bg-[#0A0B0D] text-[#4A4D52] hover:border-[#2A2D31] hover:bg-[#1A1C1F] hover:text-[#8A8D93]"
        }`}
      >
        <span className={`flex h-7 w-7 items-center justify-center rounded-[2px] transition-colors ${enabled ? "bg-[#22D3EE] text-[#0A0B0D]" : "bg-[#1A1C1F] text-[#4A4D52] ring-1 ring-[#2A2D31]"}`} aria-hidden="true">
          {enabled ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
        </span>
        <span className="tracking-[0.12em]">GRAD-CAM OVERLAY</span>
        <span className={`ml-1 h-2 w-2 rounded-full ${enabled ? "bg-[#22D3EE] shadow-[0_0_8px_rgba(34,211,238,0.7)]" : "bg-[#2A2D31]"}`} aria-hidden="true" />
      </button>
      <p className="px-1 font-mono text-[11px] leading-relaxed tracking-wide text-[#4A4D52]">RED/YELLOW = HIGH ATTENTION · BLUE/PURPLE = LOW — MOCK WIREFRAME INTENSITY IN THIS CONCEPT</p>
    </div>
  );
}
