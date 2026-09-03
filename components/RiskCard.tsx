"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import type { ScanResult } from "@/lib/types";
import { AlertTriangle, FileText, RotateCcw, ShieldAlert, Activity, ScanEye, Save } from "lucide-react";

interface RiskCardProps {
  result: ScanResult;
  onReset?: () => void;
  onGenerateReport?: () => void;
  onSave?: () => void;
  showActions?: boolean;
  mode?: "live" | "report";
}

function CountUp({
  targetPct,
  duration = 900,
  disabled,
}: {
  targetPct: number;
  duration?: number;
  disabled?: boolean;
}) {
  const [value, setValue] = useState(disabled ? targetPct : 0);
  useEffect(() => {
    if (disabled) {
      setValue(targetPct);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const elapsed = now - start;
      const p = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setValue(eased * targetPct);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [targetPct, duration, disabled]);
  return <>{value.toFixed(1)}%</>;
}

// Concept C: monochrome — severity via intensity/opacity/fill, not hue.
// Grade 0 = dim outline, Grade 4 = filled intense cyan. All cyan+grey.
function intensityForGrade(sev: ScanResult["severity"]) {
  if (sev === 0) return { border: "border-[#2A2D31]", accent: "bg-[#2A2D31]", glow: "rgba(42,45,49,0.0)", label: "GRADE 0 — NO DR", filled: false as const };
  if (sev === 1) return { border: "border-[#2A2D31]", accent: "bg-[#22D3EE]/60", glow: "rgba(34,211,238,0.12)", label: "GRADE 1 — MILD", filled: false as const };
  if (sev === 2) return { border: "border-[#22D3EE]/40", accent: "bg-[#22D3EE]", glow: "rgba(34,211,238,0.22)", label: "GRADE 2 — MODERATE", filled: false as const };
  if (sev === 3) return { border: "border-[#22D3EE]/70", accent: "bg-[#22D3EE]", glow: "rgba(34,211,238,0.32)", label: "GRADE 3 — SEVERE", filled: true as const };
  return { border: "border-[#22D3EE]", accent: "bg-[#22D3EE]", glow: "rgba(34,211,238,0.45)", label: "GRADE 4 — PROLIFERATIVE", filled: true as const };
}

export default function RiskCard({ result, onReset, onGenerateReport, onSave, showActions = true, mode = "live" }: RiskCardProps) {
  const shouldReduceMotion = useReducedMotion();
  const pct = result.confidence * 100;
  const st = intensityForGrade(result.severity);
  const filled = st.filled;

  return (
    <motion.div
      initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 10 }}
      animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className={`holo-panel ${result.severity >= 2 ? "holo-panel--active" : ""} ${st.border} relative overflow-hidden`}
      role="region"
      aria-label="Scan result"
    >
      <div className={`h-px w-full ${st.accent}`} style={{ boxShadow: `0 0 14px ${st.glow}` }} aria-hidden="true" />

      <div className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <span className="flex items-center gap-2">
            <span className={`flex h-8 w-8 items-center justify-center rounded-[2px] ring-1 ${result.severity >= 3 ? "bg-[#22D3EE] text-[#0A0B0D] ring-[#22D3EE]" : "bg-[#1A1C1F] text-[#22D3EE] ring-[#2A2D31]"}`}>
              <ShieldAlert className="h-4 w-4" aria-hidden="true" />
            </span>
            <span>
              <span className="block font-mono text-[11px] tracking-[0.14em] text-[#4A4D52]">RISK ASSESSMENT</span>
              <span
                className={`inline-flex items-center gap-1.5 rounded-[2px] px-2.5 py-1 font-mono text-xs font-bold tracking-wide ring-1 ${
                  filled ? "bg-[#22D3EE] text-[#0A0B0D] ring-[#22D3EE]" : result.severity === 2 ? "bg-[#22D3EE]/15 text-[#22D3EE] ring-[#22D3EE]/30" : "bg-[#1A1C1F] text-[#8A8D93] ring-[#2A2D31]"
                }`}
              >
                <span className={`h-1.5 w-1.5 rounded-full ${filled ? "bg-[#0A0B0D]" : result.severity >= 2 ? "bg-[#22D3EE]" : "bg-[#4A4D52]"}`} aria-hidden="true" />
                {st.label}
              </span>
            </span>
          </span>
          <span className="hidden items-center gap-1 rounded-[2px] bg-[#0A0B0D] px-2.5 py-1 font-mono text-[11px] tracking-wide text-[#4A4D52] ring-1 ring-[#1A1C1F] sm:inline-flex">
            <Activity className="h-3 w-3" aria-hidden="true" /> {result.modelVersion.toUpperCase()}
          </span>
        </div>

        <h3 className="mt-4 font-mono text-xs font-bold tracking-wide text-[#F5F6F7]">DR GRADE: {result.severity} · {result.status}</h3>
        <p className="mt-1 font-mono text-xs tracking-wide text-[#4A4D52]">
          {result.severityLabel.toUpperCase()} · {result.modelVersion} · INTENSITY {result.severity}/4
        </p>

        <div className="mt-3 flex flex-wrap items-start gap-3">
          <span
            className={`inline-flex items-center gap-1.5 rounded-[2px] px-3 py-1.5 font-mono text-xs font-bold tracking-widest ring-1 ${
              result.referable ? "bg-[#22D3EE] text-[#0A0B0D] ring-[#22D3EE]" : "bg-[#1A1C1F] text-[#8A8D93] ring-[#2A2D31]"
            }`}
          >
            <ScanEye className="h-3 w-3" aria-hidden="true" /> REFERABLE: {result.referable ? "YES" : "NO"}
          </span>
          <span className="font-mono text-[11px] tracking-wide text-[#4A4D52]">TEXT-ONLY SEVERITY — GRADE + LABEL + REFERABLE RENDERED IN TEXT PER §8</span>
        </div>

        <div className="mt-4 flex items-baseline gap-3">
          <span className="font-mono text-[11px] tracking-[0.14em] text-[#4A4D52]">CONFIDENCE</span>
          <span className="font-mono text-2xl font-bold tracking-tight text-[#F5F6F7] sm:text-3xl">
            <CountUp targetPct={pct} disabled={!!shouldReduceMotion} />
          </span>
          <span className="font-mono text-xs tracking-wide text-[#4A4D52]">MODEL CERTAINTY</span>
        </div>
        <div className="mt-2 h-px w-full bg-[#1A1C1F]">
          <motion.div
            className={`h-px ${st.accent}`}
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
            style={{ boxShadow: `0 0 10px ${st.glow}` }}
            aria-hidden="true"
          />
        </div>

        <p className="mt-3 rounded-[2px] bg-[#0A0B0D] px-3 py-3 font-mono text-xs leading-relaxed tracking-wide text-[#8A8D93] ring-1 ring-[#1A1C1F]">
          {result.explanation}
        </p>

        <div className="mt-3 flex flex-wrap gap-1.5" aria-label="Severity scale — intensity encoded, text always present">
          {[0, 1, 2, 3, 4].map((g) => {
            const active = g === result.severity;
            const s = intensityForGrade(g as ScanResult["severity"]);
            return (
              <span
                key={g}
                className={`rounded-[2px] px-2.5 py-1 font-mono text-[11px] tracking-wide ring-1 ${
                  active ? (s.filled ? "bg-[#22D3EE] text-[#0A0B0D] ring-[#22D3EE] font-bold" : g === 2 ? "bg-[#22D3EE]/15 text-[#22D3EE] ring-[#22D3EE]/40 font-bold" : "bg-[#1A1C1F] text-[#F5F6F7] ring-[#22D3EE]/30 font-bold") : "bg-[#0A0B0D] text-[#4A4D52] ring-[#1A1C1F]"
                }`}
              >
                {g}: {g === 0 ? "NO DR" : g === 1 ? "MILD" : g === 2 ? "MOD" : g === 3 ? "SEV" : "PROLIF"}
              </span>
            );
          })}
        </div>

        {showActions && (
          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            {mode === "live" && onSave && (
              <button
                type="button"
                onClick={onSave}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-[2px] bg-[#22D3EE] px-4 py-3 font-mono text-xs font-bold tracking-[0.12em] text-[#0A0B0D] hover:bg-[#7ADDF0] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#22D3EE]"
                style={{ boxShadow: "0 0 16px rgba(34,211,238,0.22)" }}
              >
                <Save className="h-4 w-4" aria-hidden="true" /> SAVE SCREENING
              </button>
            )}
            <button
              type="button"
              onClick={onGenerateReport}
              className={`inline-flex items-center justify-center gap-2 rounded-[2px] px-4 py-3 font-mono text-xs font-bold tracking-[0.12em] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#22D3EE] ${
                mode === "live" ? "flex-1 border border-[#2A2D31] bg-[#1A1C1F] text-[#F5F6F7] hover:bg-[#2A2D31]" : "flex-1 bg-[#F5F6F7] text-[#0A0B0D] hover:bg-white"
              }`}
            >
              <FileText className="h-4 w-4" aria-hidden="true" /> GENERATE REFERRAL REPORT
            </button>
            {onReset && (
              <button
                type="button"
                onClick={onReset}
                className="inline-flex items-center justify-center gap-2 rounded-[2px] border border-[#2A2D31] bg-[#0A0B0D] px-4 py-3 font-mono text-xs font-bold tracking-[0.12em] text-[#8A8D93] hover:bg-[#1A1C1F] hover:text-[#F5F6F7] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#22D3EE]"
              >
                <RotateCcw className="h-4 w-4" aria-hidden="true" /> NEW SCAN
              </button>
            )}
          </div>
        )}

        <p className="mt-3 flex items-center gap-1.5 font-mono text-[11px] leading-relaxed tracking-wide text-[#4A4D52]">
          <AlertTriangle className="h-3 w-3 shrink-0" aria-hidden="true" /> SIMULATED — NOT A CLINICAL DIAGNOSIS // {result.modelVersion.toUpperCase()}
        </p>
      </div>
    </motion.div>
  );
}
