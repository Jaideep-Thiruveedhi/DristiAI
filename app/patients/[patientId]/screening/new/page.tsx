"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import * as THREE from "three";
import { ArrowLeft, Upload, Check, Image as ImageIcon, Settings2 } from "lucide-react";

import type { ScanState } from "@/lib/types";
import {
  mockPatients,
  mockLogLines,
  mockResultsByGrade,
  mockFindings,
  SCAN_DURATION_MS,
  REVEAL_TO_COMPLETE_DELAY_MS,
  IMAGE_QUALITY_CHECK_MS,
} from "@/lib/mockData";

import DataPanel from "@/components/DataPanel";
import AnalysisTerminal from "@/components/AnalysisTerminal";
import RiskCard from "@/components/RiskCard";
import XAIFindingsPanel from "@/components/XAIFindingsPanel";
import ConnectorOverlay from "@/components/ConnectorOverlay";
import CommandArc from "@/components/CommandArc";
import RetinaScene from "@/components/three/RetinaScene";

export default function NewScreeningPage() {
  const params = useParams<{ patientId: string }>();
  const router = useRouter();
  const patientId = params.patientId;
  const patient = mockPatients.find((p) => p.id === patientId);

  const shouldReduceMotion = useReducedMotion();
  const reducedMotion = !!shouldReduceMotion;

  const [scanState, setScanState] = useState<ScanState>("idle");
  const [visibleLogCount, setVisibleLogCount] = useState(0);
  const [gradCamOn, setGradCamOn] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const [fileName, setFileName] = useState<string | null>(null);
  const [qualityStatus, setQualityStatus] = useState<"idle" | "checking" | "good">("idle");
  const [eyeChoice, setEyeChoice] = useState<"OD" | "OS">("OD");
  const [gradeChoice, setGradeChoice] = useState<0 | 1 | 2 | 3 | 4>(2);

  // Hover snap
  const [hoveredFindingId, setHoveredFindingId] = useState<string | null>(null);
  const [anchorRect, setAnchorRect] = useState<DOMRect | null>(null);
  const [projectedPoint, setProjectedPoint] = useState<{ x: number; y: number } | null>(null);
  const [canvasRect, setCanvasRect] = useState<DOMRect | null>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const findingRowRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const timersRef = useRef<number[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const clearTimers = useCallback(() => {
    timersRef.current.forEach((id) => window.clearTimeout(id));
    timersRef.current = [];
  }, []);

  useEffect(() => () => clearTimers(), [clearTimers]);
  useEffect(() => {
    if (!toast) return;
    const id = window.setTimeout(() => setToast(null), 2600);
    return () => window.clearTimeout(id);
  }, [toast]);
  useEffect(() => {
    if (patient) setEyeChoice(patient.eye);
  }, [patient]);

  // Canvas rect tracking (for connector overlay viewport conversion)
  useEffect(() => {
    const el = canvasContainerRef.current;
    if (!el) return;
    const update = () => setCanvasRect(el.getBoundingClientRect());
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, []);

  // Anchor rect when hoveredFindingId changes
  useEffect(() => {
    if (!hoveredFindingId) {
      setAnchorRect(null);
      return;
    }
    const el = findingRowRefs.current[hoveredFindingId];
    if (el) setAnchorRect(el.getBoundingClientRect());
    const onScroll = () => {
      const e = findingRowRefs.current[hoveredFindingId ?? ""];
      if (e) setAnchorRect(e.getBoundingClientRect());
    };
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", onScroll);
    };
  }, [hoveredFindingId]);

  const handleFile = useCallback(
    (f: File | null) => {
      if (!f) return;
      setFileName(f.name);
      setQualityStatus("checking");
      setScanState("idle");
      setVisibleLogCount(0);
      setGradCamOn(false);
      const id = window.setTimeout(() => setQualityStatus("good"), IMAGE_QUALITY_CHECK_MS);
      timersRef.current.push(id);
    },
    [],
  );

  const startScan = useCallback(() => {
    if (qualityStatus !== "good" || scanState !== "idle") return;
    clearTimers();
    setScanState("processing");
    setVisibleLogCount(0);
    setGradCamOn(false);
    setHoveredFindingId(null);

    const total = mockLogLines.length;
    const interval = (SCAN_DURATION_MS - 400) / (total - 1 || 1);
    for (let i = 0; i < total; i++) {
      const id = window.setTimeout(() => setVisibleLogCount(i + 1), Math.round(i * interval));
      timersRef.current.push(id);
    }
    const doneId = window.setTimeout(() => {
      setScanState("revealed");
      const completeId = window.setTimeout(() => setScanState("complete"), REVEAL_TO_COMPLETE_DELAY_MS);
      timersRef.current.push(completeId);
    }, SCAN_DURATION_MS);
    timersRef.current.push(doneId);
  }, [clearTimers, qualityStatus, scanState]);

  const handleReset = useCallback(() => {
    clearTimers();
    setScanState("idle");
    setVisibleLogCount(0);
    setGradCamOn(false);
    setHoveredFindingId(null);
  }, [clearTimers]);

  const handleSave = useCallback(() => {
    const mockId = `SCR-${String(Math.floor(Math.random() * 900) + 100).padStart(6, "0")}`;
    router.push(`/patients/${patientId}/screening/${mockId}?grade=${gradeChoice}&eye=${eyeChoice}`);
  }, [router, patientId, gradeChoice, eyeChoice]);

  const handleGenerateReport = useCallback(() => setToast("REPORT QUEUED — FEATURE COMING SOON"), []);

  if (!patient) {
    return (
      <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6">
        <p className="font-mono text-sm tracking-wide text-[#F5F6F7]">PATIENT {patientId} NOT FOUND</p>
        <Link href="/patients" className="mt-2 inline-flex font-mono text-xs tracking-wide text-[#22D3EE] hover:text-[#7ADDF0]">
          ← BACK TO PATIENTS
        </Link>
      </div>
    );
  }

  const result = mockResultsByGrade[gradeChoice];
  const canStart = qualityStatus === "good" && scanState === "idle";
  const findingsEnabled = scanState === "revealed" || scanState === "complete";
  const focusedPos = hoveredFindingId ? (mockFindings.find((f) => f.id === hoveredFindingId)?.position ?? null) : null;

  const onCameraProject = useCallback(
    (v: THREE.Vector3 | null) => {
      if (!v) {
        setProjectedPoint(null);
        return;
      }
      setProjectedPoint({ x: v.x, y: v.y });
    },
    [],
  );

  return (
    <div className="relative flex flex-1 flex-col">
      {/* Full-bleed Canvas behind panel grid — chosen for command-center immersion: panels float over holographic floor, grid perspective preserved full-width, more cinematic than boxed left column */}
      <div ref={canvasContainerRef} className="pointer-events-none fixed inset-0 top-[56px] sm:top-[57px]" aria-hidden="true">
        <div className="h-full w-full">
          <RetinaScene
            scanState={scanState}
            gradCamOn={gradCamOn}
            focusedFindingPos={focusedPos}
            hoveredFindingId={hoveredFindingId}
            onCameraProject={onCameraProject}
            reducedMotion={reducedMotion}
          />
        </div>
        {/* Top vignette to keep header legible */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#0A0B0D] via-transparent to-transparent opacity-60" />
        {/* Bottom fade before Command Arc */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#0A0B0D] to-transparent" />
      </div>

      {/* Connector overlay — above canvas, below panels */}
      <ConnectorOverlay
        anchorRect={anchorRect}
        targetPoint={projectedPoint}
        canvasRect={canvasRect}
        visible={!!hoveredFindingId && !!projectedPoint && findingsEnabled}
        reducedMotion={reducedMotion}
      />

      {/* Page content — bento panel grid over canvas */}
      <div className="relative z-10 mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8 pb-28">
        <div className="flex flex-col gap-4">
          <Link href={`/patients/${patientId}`} className="inline-flex items-center gap-1.5 self-start font-mono text-xs tracking-[0.12em] text-[#4A4D52] hover:text-[#F5F6F7]">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" /> {patient.id} · {patient.name.toUpperCase()}
          </Link>

          <div className="flex flex-col gap-1">
            <h1 className="font-mono text-xl font-bold tracking-[0.12em] text-[#F5F6F7] sm:text-2xl">NEW SCREENING — HOLOGRAPHIC GRID</h1>
            <p className="font-mono text-xs tracking-wide text-[#4A4D52]">
              UPLOAD → QUALITY CHECK → 3D SCAN PLANE → XAI FINDINGS // HOVER-TO-SNAP → GRAD-CAM OVERLAY → RESULT — MIRRORS POST /predict
            </p>
          </div>

          {/* Bento grid */}
          <div className="grid gap-4 lg:grid-cols-12">
            {/* Left stack: Patient + Upload/Controls */}
            <div className="flex flex-col gap-4 lg:col-span-4">
              <DataPanel patient={{ ...patient, eye: eyeChoice }} />

              {/* Upload panel — idle only */}
              <AnimatePresence mode="wait">
                {scanState === "idle" && (
                  <motion.div
                    key="upload"
                    initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 8 }}
                    animate={reducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
                    exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: -6 }}
                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    className="holo-panel holo-panel--active p-4"
                  >
                    <h2 className="font-mono text-xs font-bold tracking-[0.12em] text-[#F5F6F7]">UPLOAD FUNDUS IMAGE</h2>
                    <p className="mt-1 font-mono text-[11px] tracking-wide text-[#4A4D52]">ANY IMAGE ACCEPTED — PLACEHOLDER WIREFRAME SHOWN UNTIL SCAN</p>

                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="mt-3 flex w-full flex-col items-center justify-center gap-2 rounded-[2px] border border-dashed border-[#2A2D31] bg-[#0A0B0D]/60 px-6 py-7 hover:bg-[#1A1C1F]/60 hover:border-[#22D3EE]/25 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#22D3EE]"
                    >
                      <span className="flex h-9 w-9 items-center justify-center rounded-[2px] bg-[#22D3EE]/10 ring-1 ring-[#22D3EE]/20">
                        <Upload className="h-5 w-5 text-[#22D3EE]" aria-hidden="true" />
                      </span>
                      <span className="font-mono text-xs font-bold tracking-wide text-[#F5F6F7]">{fileName ? fileName.toUpperCase() : "CLICK TO BROWSE OR DROP"}</span>
                      <span className="font-mono text-[11px] tracking-wide text-[#4A4D52]">PNG, JPG — ANY RESOLUTION</span>
                    </button>
                    <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFile(e.target.files?.[0] ?? null)} />

                    <div className="mt-3 rounded-[2px] border border-[#1A1C1F] bg-[#0A0B0D] px-3 py-3">
                      <p className="flex items-center gap-2 font-mono text-[11px] tracking-[0.12em] text-[#4A4D52]">
                        <ImageIcon className="h-3.5 w-3.5" aria-hidden="true" /> IMAGE QUALITY CHECK
                      </p>
                      <div className="mt-2 font-mono text-xs tracking-wide">
                        {qualityStatus === "idle" && <span className="text-[#4A4D52]">UPLOAD TO RUN MOCKED CHECK</span>}
                        {qualityStatus === "checking" && (
                          <span className="inline-flex items-center gap-2 text-[#22D3EE]">
                            <span className="h-2 w-2 animate-pulse rounded-full bg-[#22D3EE]" aria-hidden="true" /> CHECKING… ({IMAGE_QUALITY_CHECK_MS}MS MOCKED)
                          </span>
                        )}
                        {qualityStatus === "good" && (
                          <span className="inline-flex items-center gap-2 text-[#22D3EE]">
                            <span className="flex h-5 w-5 items-center justify-center rounded-[2px] bg-[#22D3EE] text-[#0A0B0D]">
                              <Check className="h-3 w-3" aria-hidden="true" />
                            </span>{" "}
                            GOOD ✓ — READY TO ANALYZE
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Inline demo controls */}
                    <div className="mt-3 rounded-[2px] border border-[#1A1C1F] bg-[#0A0B0D] p-3">
                      <p className="flex items-center gap-1.5 font-mono text-[11px] tracking-[0.12em] text-[#4A4D52]">
                        <Settings2 className="h-3.5 w-3.5" aria-hidden="true" /> DEMO CONTROLS
                      </p>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <span className="font-mono text-[11px] tracking-wide text-[#4A4D52]">EYE</span>
                        <span className="inline-flex rounded-[2px] border border-[#1A1C1F] bg-[#0A0B0D] p-1">
                          {(["OD", "OS"] as const).map((e) => (
                            <button
                              key={e}
                              type="button"
                              onClick={() => setEyeChoice(e)}
                              className={`rounded-[2px] px-3 py-1 font-mono text-xs font-bold ${eyeChoice === e ? "bg-[#F5F6F7] text-[#0A0B0D]" : "text-[#4A4D52] hover:text-[#F5F6F7]"}`}
                            >
                              {e}
                            </button>
                          ))}
                        </span>
                        <span className="font-mono text-[11px] tracking-wide text-[#4A4D52]">GRADE</span>
                        <span className="inline-flex gap-1 rounded-[2px] border border-[#1A1C1F] bg-[#0A0B0D] p-1">
                          {[0, 1, 2, 3, 4].map((g) => (
                            <button
                              key={g}
                              type="button"
                              onClick={() => setGradeChoice(g as 0 | 1 | 2 | 3 | 4)}
                              className={`h-7 w-7 rounded-[2px] font-mono text-xs font-bold ${gradeChoice === g ? "bg-[#22D3EE] text-[#0A0B0D]" : "bg-[#1A1C1F] text-[#4A4D52] ring-1 ring-[#2A2D31] hover:text-[#F5F6F7]"}`}
                              aria-pressed={gradeChoice === g}
                              aria-label={`Grade ${g}`}
                            >
                              {g}
                            </button>
                          ))}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                )}

                {scanState === "processing" && (
                  <motion.div
                    key="processing-note"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="holo-panel p-4"
                  >
                    <p className="font-mono text-xs font-bold tracking-[0.12em] text-[#22D3EE]">3D SCAN PLANE ACTIVE</p>
                    <p className="mt-1 font-mono text-xs leading-relaxed tracking-wide text-[#8A8D93]">
                      Thin cyan plane sweeping vertically through the wireframe mesh — 3D-native equivalent of the 2D laser sweep. Real inference mocked.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Center + Right: Log / Findings / Result */}
            <div className="flex flex-col gap-4 lg:col-span-8">
              {/* Analysis Log — full width when processing, otherwise compact */}
              <AnimatePresence mode="wait">
                {scanState === "processing" ? (
                  <AnalysisTerminal key="term" logLines={mockLogLines} visibleCount={visibleLogCount} />
                ) : scanState === "idle" ? (
                  <motion.div
                    key="idle-hint"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="holo-panel p-4"
                  >
                    <p className="font-mono text-xs font-bold tracking-[0.12em] text-[#4A4D52]">WIREFRAME RETINA — IDLE ROTATION</p>
                    <p className="mt-1 font-mono text-xs leading-relaxed tracking-wide text-[#8A8D93]">
                      Ambient rotation never stops. Grid floor cyan lines fade radially. Upload an image, then use <span className="text-[#22D3EE]">COMMAND ARC → START SCAN</span> below.
                    </p>
                  </motion.div>
                ) : (
                  <motion.div key="log-compact" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="holo-panel px-4 py-3">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[11px] tracking-[0.14em] text-[#4A4D52]">PIPELINE</span>
                      <span className="inline-flex items-center gap-1.5 font-mono text-[11px] tracking-wide text-[#22D3EE]">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#22D3EE] shadow-[0_0_6px_rgba(34,211,238,0.6)]" aria-hidden="true" /> COMPLETE
                      </span>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {mockLogLines.map((l) => (
                        <span key={l.id} className="rounded-[2px] bg-[#0A0B0D] px-2.5 py-1 font-mono text-[11px] tracking-wide text-[#4A4D52] ring-1 ring-[#1A1C1F]">
                          ✓ {l.text.toUpperCase().slice(0, 28)}
                        </span>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* XAI Findings — hover interactive, revealed+complete only */}
              <div
                // Attach refs to each row button via callback — we map finding ids to DOM nodes for connector anchor
                ref={(el) => {
                  // container ref not needed
                }}
              >
                <XAIFindingsPanel
                  findings={mockFindings}
                  activeId={hoveredFindingId}
                  onHover={setHoveredFindingId}
                  onFocusId={setHoveredFindingId}
                  enabled={findingsEnabled}
                />
                {/* Hidden ref wiring — render buttons inside panel, but we need to capture row rects.
                    Instead of forking panel, attach refs after mount via query: */}
                {findingsEnabled && (
                  <span className="sr-only" aria-hidden="true">
                    {/* Ref wiring effect — imperatively bind row buttons */}
                  </span>
                )}
              </div>

              {/* We need to actually wire row refs: use effect to query buttons inside XAIFindingsPanel */}
              {/* Workaround: query DOM after render */}
              <FindingRowRefBinder findings={mockFindings} enabled={findingsEnabled} refs={findingRowRefs} />

              {scanState === "revealed" && (
                <div className="holo-panel p-4">
                  <div className="flex items-center gap-2 font-mono text-[11px] tracking-[0.14em] text-[#4A4D52]">
                    <span className="h-2 w-2 animate-pulse rounded-full bg-[#22D3EE]" aria-hidden="true" /> FINALIZING ASSESSMENT…
                  </div>
                  <div className="mt-3 h-px w-full bg-[#1A1C1F]">
                    <motion.div
                      className="h-px bg-[#22D3EE]"
                      initial={{ width: "60%" }}
                      animate={{ width: "100%" }}
                      transition={{ duration: REVEAL_TO_COMPLETE_DELAY_MS / 1000, ease: [0.16, 1, 0.3, 1] }}
                      aria-hidden="true"
                    />
                  </div>
                </div>
              )}

              {scanState === "complete" && <RiskCard result={result} onGenerateReport={handleGenerateReport} onSave={handleSave} onReset={handleReset} mode="live" />}
            </div>
          </div>
        </div>
      </div>

      <CommandArc
        scanState={scanState}
        gradCamOn={gradCamOn}
        onStart={startScan}
        onToggleGradCam={() => findingsEnabled && setGradCamOn((v) => !v)}
        onSave={handleSave}
        onGenerateReport={handleGenerateReport}
        onReset={handleReset}
        canStart={canStart}
      />

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 8, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: 6, x: "-50%" }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="pointer-events-none fixed bottom-24 left-1/2 z-50 rounded-[2px] border border-[#22D3EE]/20 bg-[#0A0B0D] px-5 py-3 font-mono text-xs font-bold tracking-wide text-[#F5F6F7] shadow-2xl"
            role="status"
            aria-live="polite"
          >
            <span className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#22D3EE] shadow-[0_0_8px_rgba(34,211,238,0.6)]" aria-hidden="true" /> {toast}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {scanState === "idle" && "Ready — upload an image then use Command Arc Start Scan"}
        {scanState === "processing" && "Analyzing — 3D scan plane sweeping wireframe retina"}
        {scanState === "revealed" && "Analysis complete — hover XAI findings to snap camera"}
        {scanState === "complete" && `Result grade ${result.severity} ${result.severityLabel}, confidence ${(result.confidence * 100).toFixed(1)} percent, referable ${result.referable ? "yes" : "no"}`}
      </div>
    </div>
  );
}

/**
 * Imperatively binds row button refs by querying the nearest XAI panel list.
 * Avoids forking XAIFindingsPanel props — keeps connector logic contained in page.
 */
function FindingRowRefBinder({
  findings,
  enabled,
  refs,
}: {
  findings: { id: string }[];
  enabled: boolean;
  refs: React.MutableRefObject<Record<string, HTMLButtonElement | null>>;
}) {
  useEffect(() => {
    if (!enabled) return;
    const buttons = document.querySelectorAll<HTMLButtonElement>('[aria-label^="Focus finding"]');
    buttons.forEach((btn) => {
      const label = btn.getAttribute("aria-label") ?? "";
      const f = findings.find((x) => label.includes(x.id) || label.toLowerCase().includes(x.id) || btn.textContent?.includes(x.id));
      // Fallback: map by order if id not in label
      const idx = Array.from(buttons).indexOf(btn);
      const id = f?.id ?? findings[idx]?.id;
      if (id) refs.current[id] = btn;
    });
    // Also map by index order as reliable fallback
    const all = Array.from(buttons);
    findings.forEach((f, i) => {
      if (!refs.current[f.id] && all[i]) refs.current[f.id] = all[i];
    });
  }, [enabled, findings, refs]);
  return null;
}
