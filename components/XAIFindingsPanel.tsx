"use client";

import { Crosshair, Activity, ChevronRight } from "lucide-react";
import type { XAIFinding } from "@/lib/types";

interface XAIFindingsPanelProps {
  findings: XAIFinding[];
  activeId: string | null;
  onHover: (id: string | null) => void;
  onFocusId: (id: string) => void;
  enabled?: boolean;
}

export default function XAIFindingsPanel({
  findings,
  activeId,
  onHover,
  onFocusId,
  enabled = true,
}: XAIFindingsPanelProps) {
  return (
    <div className={`holo-panel ${enabled ? "holo-panel--active" : ""} p-4 sm:p-5`}>
      <div className="flex items-center gap-2">
        <span className="flex h-6 w-6 items-center justify-center rounded-[2px] bg-[#22D3EE]/10 ring-1 ring-[#22D3EE]/20">
          <Crosshair className="h-3.5 w-3.5 text-[#22D3EE]" aria-hidden="true" />
        </span>
        <h3 className="font-mono text-xs font-bold tracking-[0.14em] text-[#F5F6F7]">XAI FINDINGS</h3>
        <span className="ml-auto font-mono text-[10px] tracking-wide text-[#4A4D52]">
          {enabled ? `${findings.length} DETECTIONS` : "LOCKED — AWAITING SCAN"}
        </span>
        {enabled && <Activity className="h-3 w-3 text-[#22D3EE]" aria-hidden="true" />}
      </div>

      {!enabled ? (
        <div className="mt-4 rounded-[2px] border border-dashed border-[#2A2D31] bg-[#0A0B0D]/50 px-4 py-6 text-center">
          <p className="font-mono text-xs leading-relaxed text-[#4A4D52]">
            Run a scan to populate Grad-CAM findings. Hover will snap the 3D view — each coordinate is mock data standing in for real Grad-CAM-derived positions.
          </p>
        </div>
      ) : (
        <ul className="mt-3 divide-y divide-[#1A1C1F]" role="list" aria-label="XAI findings">
          {findings.map((f, idx) => {
            const isActive = activeId === f.id;
            return (
              <li key={f.id}>
                <button
                  type="button"
                  onMouseEnter={() => onHover(f.id)}
                  onMouseLeave={() => onHover(null)}
                  onFocus={() => {
                    onHover(f.id);
                    onFocusId(f.id);
                  }}
                  onBlur={() => onHover(null)}
                  className={`flex w-full items-start gap-3 py-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#22D3EE] ${
                    isActive ? "bg-[#22D3EE]/[0.06]" : "hover:bg-white/[0.02]"
                  }`}
                  aria-label={`Focus finding: ${f.label}`}
                >
                  <span
                    className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-[2px] font-mono text-[11px] font-bold ring-1 ${
                      isActive
                        ? "bg-[#22D3EE] text-[#0A0B0D] ring-[#22D3EE]"
                        : "bg-[#1A1C1F] text-[#4A4D52] ring-[#2A2D31]"
                    }`}
                    aria-hidden="true"
                  >
                    {idx + 1}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span
                      className={`block font-mono text-xs font-bold leading-tight tracking-wide ${
                        isActive ? "text-[#22D3EE]" : "text-[#F5F6F7]"
                      }`}
                    >
                      {f.label}
                    </span>
                    {f.detail && (
                      <span className="mt-1 block font-mono text-[11px] leading-relaxed text-[#8A8D93]">
                        {f.detail}
                      </span>
                    )}
                    <span className="mt-1 flex items-center gap-1.5 font-mono text-[10px] tracking-wide text-[#4A4D52]">
                      <span className="inline-block h-1 w-1 rounded-full bg-[#22D3EE]/60" aria-hidden="true" />
                      [{f.position.x.toFixed(2)}, {f.position.y.toFixed(2)}, {f.position.z.toFixed(2)}]
                    </span>
                  </span>
                  <ChevronRight
                    className={`mt-1 h-4 w-4 shrink-0 ${isActive ? "text-[#22D3EE]" : "text-[#2A2D31]"}`}
                    aria-hidden="true"
                  />
                </button>
              </li>
            );
          })}
        </ul>
      )}

      <p className="mt-3 font-mono text-[10px] leading-relaxed tracking-wide text-[#4A4D52]">
        Hover or focus a row to snap the camera and draw a connector to the 3D marker. Keyboard focus triggers the same snap as hover.
      </p>
    </div>
  );
}
