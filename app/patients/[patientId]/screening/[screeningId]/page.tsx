"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import * as THREE from "three";
import { ArrowLeft, FileText, AlertTriangle, ScanEye } from "lucide-react";
import { mockPatients, mockScreenings, mockResultsByGrade, mockFindings } from "@/lib/mockData";
import type { ScanResult } from "@/lib/types";
import DataPanel from "@/components/DataPanel";
import RiskCard from "@/components/RiskCard";
import XAIFindingsPanel from "@/components/XAIFindingsPanel";
import ConnectorOverlay from "@/components/ConnectorOverlay";
import RetinaScene from "@/components/three/RetinaScene";
import { useReducedMotion } from "framer-motion";

export default function ReportPage() {
  const params = useParams<{ patientId: string; screeningId: string }>();
  const searchParams = useSearchParams();
  const patientId = params.patientId;
  const screeningId = params.screeningId;

  const patient = mockPatients.find((p) => p.id === patientId);
  const existing = mockScreenings.find((s) => s.id === screeningId);

  const gradeParam = searchParams.get("grade");
  const eyeParam = searchParams.get("eye") as "OD" | "OS" | null;
  const parsedGrade = gradeParam !== null ? (Number(gradeParam) as 0 | 1 | 2 | 3 | 4) : null;
  const isValidGrade = parsedGrade !== null && [0, 1, 2, 3, 4].includes(parsedGrade);

  const result: ScanResult | null = isValidGrade
    ? mockResultsByGrade[parsedGrade as 0 | 1 | 2 | 3 | 4]
    : existing
      ? existing.result
      : null;

  const eye: "OD" | "OS" = eyeParam ?? existing?.eye ?? patient?.eye ?? "OD";
  const createdAt = existing?.createdAt ?? new Date().toISOString();
  const imageQuality = existing?.imageQuality ?? "Good";

  const shouldReduceMotion = useReducedMotion();
  const reducedMotion = !!shouldReduceMotion;

  const [gradCamOn, setGradCamOn] = useState(true);
  const [hoveredFindingId, setHoveredFindingId] = useState<string | null>(null);
  const [anchorRect, setAnchorRect] = useState<DOMRect | null>(null);
  const [projectedPoint, setProjectedPoint] = useState<{ x: number; y: number } | null>(null);
  const [canvasRect, setCanvasRect] = useState<DOMRect | null>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const findingRowRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [toast, setToast] = useState<string | null>(null);

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

  const onCameraProject = useCallback((v: THREE.Vector3 | null) => {
    if (!v) {
      setProjectedPoint(null);
      return;
    }
    setProjectedPoint({ x: v.x, y: v.y });
  }, []);

  const focusedPos = hoveredFindingId ? (mockFindings.find((f) => f.id === hoveredFindingId)?.position ?? null) : null;

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

  if (!result) {
    return (
      <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6">
        <p className="font-mono text-sm tracking-wide text-[#F5F6F7]">SCREENING {screeningId} NOT FOUND</p>
        <Link href={`/patients/${patientId}`} className="mt-2 inline-flex font-mono text-xs tracking-wide text-[#22D3EE] hover:text-[#7ADDF0]">
          ← BACK TO {patientId}
        </Link>
      </div>
    );
  }

  const isSynthetic = !existing;

  return (
    <div className="relative flex flex-1 flex-col">
      <div ref={canvasContainerRef} className="pointer-events-none fixed inset-0 top-[56px] sm:top-[57px]" aria-hidden="true">
        <div className="h-full w-full">
          <RetinaScene
            scanState="complete"
            gradCamOn={gradCamOn}
            focusedFindingPos={focusedPos}
            hoveredFindingId={hoveredFindingId}
            onCameraProject={onCameraProject}
            reducedMotion={reducedMotion}
          />
        </div>
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#0A0B0D] via-transparent to-transparent opacity-55" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#0A0B0D] to-transparent" />
      </div>

      <ConnectorOverlay
        anchorRect={anchorRect}
        targetPoint={projectedPoint}
        canvasRect={canvasRect}
        visible={!!hoveredFindingId && !!projectedPoint}
        reducedMotion={reducedMotion}
      />

      <div className="relative z-10 mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
        <div className="flex flex-col gap-4">
          <Link href={`/patients/${patientId}`} className="inline-flex items-center gap-1.5 self-start font-mono text-xs tracking-[0.12em] text-[#4A4D52] hover:text-[#F5F6F7]">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" /> {patient.id} · {patient.name.toUpperCase()}
          </Link>

          <div className="flex flex-col gap-1">
            <h1 className="flex flex-wrap items-center gap-3 font-mono text-xl font-bold tracking-[0.12em] text-[#F5F6F7] sm:text-2xl">
              SCREENING REPORT
              <span className="rounded-[2px] bg-[#1A1C1F] px-3 py-1 font-mono text-xs tracking-wide text-[#8A8D93] ring-1 ring-[#2A2D31]">{screeningId}</span>
              {isSynthetic && <span className="rounded-[2px] bg-[#22D3EE]/15 px-3 py-1 font-mono text-xs tracking-wide text-[#22D3EE] ring-1 ring-[#22D3EE]/20">JUST SAVED — MOCK</span>}
            </h1>
            <p className="font-mono text-xs tracking-wide text-[#4A4D52]">
              READ-ONLY // GET /api/screenings/{screeningId} // {new Date(createdAt).toLocaleString()} // EYE {eye} // QUALITY {imageQuality.toUpperCase()} // {result.modelVersion.toUpperCase()}
            </p>
          </div>

          <div className="grid gap-4 lg:grid-cols-12">
            <div className="flex flex-col gap-4 lg:col-span-5">
              <div className="holo-panel p-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[11px] tracking-[0.12em] text-[#4A4D52]">HOLOGRAPHIC RETINA // READ-ONLY</span>
                  <button
                    type="button"
                    onClick={() => setGradCamOn((v) => !v)}
                    aria-pressed={gradCamOn}
                    className={`rounded-[2px] px-2.5 py-1 font-mono text-[11px] font-bold tracking-wide ring-1 ${gradCamOn ? "bg-[#22D3EE] text-[#0A0B0D] ring-[#22D3EE]" : "bg-[#1A1C1F] text-[#4A4D52] ring-[#2A2D31]"}`}
                  >
                    GRAD-CAM {gradCamOn ? "ON" : "OFF"}
                  </button>
                </div>
                <p className="mt-2 font-mono text-xs leading-relaxed tracking-wide text-[#8A8D93]">
                  Real product: <span className="text-[#F5F6F7]">heatmap_base64</span> from POST /predict (true Grad-CAM). Mock here: wireframe intensity + per-finding snap markers via Command Grid.
                </p>
                <p className="mt-2 flex items-center gap-1.5 font-mono text-[11px] tracking-wide text-[#4A4D52]">
                  <ScanEye className="h-3.5 w-3.5" aria-hidden="true" /> HOVER FINDINGS TO SNAP CAMERA — 3D IS SUPPLEMENTARY, NOT SOLE ACCESS
                </p>
              </div>

              <DataPanel patient={{ ...patient, eye }} />

              <button
                type="button"
                onClick={() => setGradCamOn((v) => !v)}
                className="rounded-[2px] border border-[#2A2D31] bg-[#1A1C1F] px-4 py-3 font-mono text-xs font-bold tracking-[0.12em] text-[#8A8D93] hover:bg-[#2A2D31] hover:text-[#F5F6F7]"
                aria-pressed={gradCamOn}
              >
                TOGGLE GRAD-CAM OVERLAY — {gradCamOn ? "ON" : "OFF"}
              </button>
            </div>

            <div className="flex flex-col gap-4 lg:col-span-7">
              <XAIFindingsPanel
                findings={mockFindings}
                activeId={hoveredFindingId}
                onHover={setHoveredFindingId}
                onFocusId={setHoveredFindingId}
                enabled
              />
              <FindingRowRefBinder findings={mockFindings} refs={findingRowRefs} />

              <RiskCard
                result={result}
                onGenerateReport={() => {
                  setToast("REPORT QUEUED — FEATURE COMING SOON");
                  setTimeout(() => setToast(null), 2400);
                }}
                mode="report"
              />

              <div className="holo-panel p-4">
                <h3 className="flex items-center gap-2 font-mono text-xs font-bold tracking-[0.12em] text-[#F5F6F7]">
                  <FileText className="h-4 w-4 text-[#22D3EE]" aria-hidden="true" /> REPORT DETAILS
                </h3>
                <dl className="mt-3 space-y-2 font-mono text-xs">
                  <div className="flex justify-between gap-4">
                    <dt className="text-[#4A4D52]">PATIENT</dt>
                    <dd className="tracking-wide text-[#F5F6F7]">
                      {patient.name.toUpperCase()} · {patient.id}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-[#4A4D52]">SCREENING ID</dt>
                    <dd className="text-[#F5F6F7]">{screeningId}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-[#4A4D52]">EYE</dt>
                    <dd className="text-[#F5F6F7]">{eye}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-[#4A4D52]">GRADE</dt>
                    <dd className="text-[#F5F6F7]">
                      {result.severity} · {result.severityLabel.toUpperCase()}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-[#4A4D52]">CONFIDENCE</dt>
                    <dd className="text-[#F5F6F7]">{(result.confidence * 100).toFixed(1)}%</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-[#4A4D52]">REFERABLE</dt>
                    <dd className={result.referable ? "font-bold text-[#22D3EE]" : "text-[#8A8D93]"}>{result.referable ? "YES (GRADE ≥ 2)" : "NO"}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-[#4A4D52]">MODEL</dt>
                    <dd className="text-[#8A8D93]">{result.modelVersion.toUpperCase()}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-[#4A4D52]">QUALITY</dt>
                    <dd className="text-[#F5F6F7]">{imageQuality.toUpperCase()}</dd>
                  </div>
                </dl>
                <p className="mt-3 rounded-[2px] bg-[#0A0B0D] px-3 py-3 font-mono text-xs leading-relaxed tracking-wide text-[#8A8D93] ring-1 ring-[#1A1C1F]">
                  {result.explanation}
                </p>
                <p className="mt-2 flex items-center gap-1.5 font-mono text-[11px] tracking-wide text-[#4A4D52]">
                  <AlertTriangle className="h-3 w-3" aria-hidden="true" /> FRONTEND-ONLY — PERSISTED ROW FROM POST /api/screenings IN REAL APP
                </p>
              </div>

              <Link
                href={`/patients/${patientId}/screening/new`}
                className="inline-flex items-center justify-center gap-2 rounded-[2px] border border-[#2A2D31] bg-[#1A1C1F] px-5 py-3 font-mono text-xs font-bold tracking-[0.12em] text-[#F5F6F7] hover:bg-[#2A2D31]"
              >
                NEW SCREENING FOR {patientId}
              </Link>
            </div>
          </div>
        </div>
      </div>

      {toast && (
        <motion.div
          initial={{ opacity: 0, y: 8, x: "-50%" }}
          animate={{ opacity: 1, y: 0, x: "-50%" }}
          exit={{ opacity: 0, y: 6, x: "-50%" }}
          className="pointer-events-none fixed bottom-6 left-1/2 z-50 rounded-[2px] border border-[#22D3EE]/20 bg-[#0A0B0D] px-5 py-3 font-mono text-xs font-bold tracking-wide text-[#F5F6F7] shadow-2xl"
          role="status"
        >
          <span className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#22D3EE]" aria-hidden="true" /> {toast}
          </span>
        </motion.div>
      )}
    </div>
  );
}

function FindingRowRefBinder({
  findings,
  refs,
}: {
  findings: { id: string; label: string }[];
  refs: React.MutableRefObject<Record<string, HTMLButtonElement | null>>;
}) {
  useEffect(() => {
    const buttons = document.querySelectorAll<HTMLButtonElement>('[aria-label^="Focus finding"]');
    const all = Array.from(buttons);
    findings.forEach((f, i) => {
      if (all[i]) refs.current[f.id] = all[i];
    });
    buttons.forEach((btn) => {
      const label = btn.getAttribute("aria-label") ?? "";
      const f = findings.find((x) => label.includes(x.label.slice(0, 16)) || btn.textContent?.includes(x.label.slice(0, 10)));
      if (f && !refs.current[f.id]) refs.current[f.id] = btn;
    });
  }, [findings, refs]);
  return null;
}
