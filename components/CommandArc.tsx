"use client";

import { ScanLine, Eye, Save, FileText, RotateCcw, Activity } from "lucide-react";
import type { ScanState } from "@/lib/types";

interface CommandArcProps {
  scanState: ScanState;
  gradCamOn: boolean;
  onStart: () => void;
  onToggleGradCam: () => void;
  onSave: () => void;
  onGenerateReport: () => void;
  onReset: () => void;
  canStart: boolean;
}

type Action = {
  id: string;
  label: string;
  icon: any;
  onClick: () => void;
  enabled: boolean;
  primary?: boolean;
};

export default function CommandArc({
  scanState,
  gradCamOn,
  onStart,
  onToggleGradCam,
  onSave,
  onGenerateReport,
  onReset,
  canStart,
}: CommandArcProps) {
  const revealedOrComplete = scanState === "revealed" || scanState === "complete";
  const isProcessing = scanState === "processing";
  const isComplete = scanState === "complete";

  const actions: Action[] = [
    {
      id: "start",
      label: "START SCAN",
      icon: ScanLine,
      onClick: onStart,
      enabled: canStart && !isProcessing && scanState === "idle",
      primary: true,
    },
    {
      id: "gradcam",
      label: gradCamOn ? "GRAD-CAM ON" : "GRAD-CAM",
      icon: Eye,
      onClick: onToggleGradCam,
      enabled: revealedOrComplete,
    },
    {
      id: "save",
      label: "SAVE",
      icon: Save,
      onClick: onSave,
      enabled: isComplete,
    },
    {
      id: "report",
      label: "REPORT",
      icon: FileText,
      onClick: onGenerateReport,
      enabled: isComplete,
    },
    {
      id: "reset",
      label: "RESET",
      icon: RotateCcw,
      onClick: onReset,
      enabled: scanState !== "idle",
    },
  ];

  return (
    <div className="pointer-events-none fixed bottom-0 left-0 right-0 z-30 flex justify-center px-4 pb-4 sm:pb-6">
      {/* Arc background — actually curved via border-radius + clip perception */}
      <div
        className="pointer-events-auto relative flex items-end gap-2 sm:gap-3"
        style={{
          // Curved arc shape: SVG background + flex row of icons
          // Use an outer container with large top border-radius to read as arc
          background: "rgba(16, 18, 20, 0.92)",
          border: "1px solid rgba(34,211,238,0.22)",
          borderBottom: "1px solid rgba(34,211,238,0.32)",
          borderRadius: "22px 22px 4px 4px",
          padding: "14px 18px 12px",
          boxShadow: "0 -8px 32px rgba(34,211,238,0.10), 0 0 0 1px rgba(34,211,238,0.08) inset",
        }}
        role="toolbar"
        aria-label="Command Arc"
      >
        {/* Top arc highlight */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-6 -top-px h-px"
          style={{
            background: "linear-gradient(90deg, transparent, rgba(34,211,238,0.55), transparent)",
          }}
        />

        <span className="pointer-events-none absolute -top-6 left-1/2 hidden -translate-x-1/2 items-center gap-1.5 font-mono text-[9px] tracking-[0.18em] text-[#4A4D52] sm:flex" aria-hidden="true">
          <Activity className="h-3 w-3" /> COMMAND ARC
        </span>

        {actions.map((a) => {
          const Icon = a.icon;
          const enabled = a.enabled;
          return (
            <button
              key={a.id}
              type="button"
              onClick={a.onClick}
              disabled={!enabled}
              aria-label={a.label}
              aria-pressed={(a.id === "gradcam" ? gradCamOn : undefined) as any}
              className={`group relative flex flex-col items-center gap-1 rounded-[10px] px-3 py-2.5 sm:px-4 transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#22D3EE] ${
                enabled
                  ? a.primary
                    ? "bg-[#22D3EE] text-[#0A0B0D] shadow-[0_0_18px_rgba(34,211,238,0.35)] hover:bg-[#7ADDF0]"
                    : gradCamOn && a.id === "gradcam"
                      ? "bg-[#22D3EE]/15 text-[#22D3EE] ring-1 ring-[#22D3EE]/40 hover:bg-[#22D3EE]/22"
                      : "bg-[#1A1C1F] text-[#F5F6F7] ring-1 ring-[#2A2D31] hover:ring-[#22D3EE]/40 hover:text-[#22D3EE] hover:shadow-[0_0_14px_rgba(34,211,238,0.12)]"
                  : "bg-[#0A0B0D] text-[#4A4D52] ring-1 ring-[#1A1C1F] cursor-not-allowed"
              }`}
            >
              <Icon
                className={`h-[18px] w-[18px] sm:h-5 sm:w-5 ${enabled ? "drop-shadow-[0_0_6px_rgba(34,211,238,0.45)]" : ""}`}
                aria-hidden="true"
              />
              <span className="font-mono text-[9px] font-bold tracking-[0.14em] leading-none sm:text-[10px]">
                {a.label}
              </span>
              {enabled && a.primary && (
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 rounded-[10px] opacity-60"
                  style={{ boxShadow: "0 0 0 1px rgba(34,211,238,0.35) inset" }}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
