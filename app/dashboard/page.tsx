"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Users,
  ClipboardList,
  AlertTriangle,
  ScanEye,
  ArrowRight,
  Activity,
  ScanLine,
  FileText,
  Calendar,
  Grid3X3,
} from "lucide-react";
import { mockPatients, mockScreenings } from "@/lib/mockData";

export default function DashboardPage() {
  const totalPatients = mockPatients.length;
  const totalScreenings = mockScreenings.length;
  const referable = mockScreenings.filter((s) => s.result.referable).length;
  const recent = [...mockScreenings]
    .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
    .slice(0, 4);

  const stats = [
    { label: "PATIENTS", value: totalPatients, icon: Users, sub: "REGISTERED" },
    { label: "SCREENINGS", value: totalScreenings, icon: ClipboardList, sub: "ALL TIME" },
    { label: "REFERABLE", value: referable, icon: AlertTriangle, sub: "GRADE ≥ 2 — SEE NOTE" },
    { label: "MODEL", value: "V1.2.0", icon: Activity, sub: "DRISTIAI-MOCK" },
  ];

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="font-mono text-xl font-bold tracking-[0.12em] text-[#F5F6F7] sm:text-2xl">DASHBOARD</h1>
            <p className="mt-1 font-mono text-xs tracking-wide text-[#4A4D52]">HOLOGRAPHIC GRID // MOCK OVERVIEW — FLASK SHAPE, FRONTEND-ONLY DATA</p>
          </div>
          <Link
            href="/patients"
            className="inline-flex items-center justify-center gap-2 rounded-[2px] bg-[#22D3EE] px-6 py-3 font-mono text-xs font-bold tracking-[0.12em] text-[#0A0B0D] hover:bg-[#7ADDF0] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#22D3EE]"
            style={{ boxShadow: "0 0 18px rgba(34,211,238,0.22)" }}
          >
            <ScanLine className="h-4 w-4" aria-hidden="true" />
            NEW SCREENING <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((s, i) => {
            const Icon = s.icon;
            return (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="holo-panel p-4"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[11px] tracking-[0.14em] text-[#4A4D52]">{s.label}</span>
                  <span className="flex h-7 w-7 items-center justify-center rounded-[2px] bg-[#22D3EE]/10 text-[#22D3EE] ring-1 ring-[#22D3EE]/20">
                    <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                  </span>
                </div>
                <p className="mt-3 font-mono text-xl font-bold tracking-tight text-[#F5F6F7]">{s.value}</p>
                <p className="font-mono text-[11px] tracking-wide text-[#4A4D52]">{s.sub}</p>
              </motion.div>
            );
          })}
        </div>

        <div className="grid gap-4 lg:grid-cols-[1.4fr_0.8fr]">
          <div className="holo-panel holo-panel--active p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <h2 className="flex items-center gap-2 font-mono text-xs font-bold tracking-[0.12em] text-[#F5F6F7]">
                <ClipboardList className="h-4 w-4 text-[#22D3EE]" aria-hidden="true" />
                RECENT SCREENINGS
              </h2>
              <Link href="/patients" className="font-mono text-xs tracking-wide text-[#22D3EE] hover:text-[#7ADDF0]">
                VIEW ALL →
              </Link>
            </div>

            <div className="mt-4 divide-y divide-[#1A1C1F] overflow-hidden rounded-[2px] border border-[#1A1C1F]">
              {recent.map((scr) => {
                const patient = mockPatients.find((p) => p.id === scr.patientId);
                const sev = scr.result.severity;
                // intensity scaling per spec: higher grade = higher cyan intensity/opacity
                const intensity = sev === 0 ? "opacity-40" : sev === 1 ? "opacity-60" : sev === 2 ? "opacity-80" : sev === 3 ? "opacity-90" : "opacity-100";
                return (
                  <Link
                    key={scr.id}
                    href={`/patients/${scr.patientId}/screening/${scr.id}`}
                    className="flex items-center gap-3 bg-[#0A0B0D]/40 px-4 py-3 hover:bg-[#1A1C1F]/60 transition-colors"
                  >
                    <span
                      className={`flex h-8 w-8 items-center justify-center rounded-[2px] font-mono text-xs font-bold ring-1 bg-[#1A1C1F] text-[#22D3EE] ring-[#2A2D31] ${intensity}`}
                    >
                      {scr.result.severity}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-mono text-xs font-bold tracking-wide text-[#F5F6F7] truncate">
                        {patient?.name ?? scr.patientId} · GRADE {scr.result.severity} · {scr.result.severityLabel.toUpperCase()}
                      </span>
                      <span className="block font-mono text-[11px] tracking-wide text-[#4A4D52]">
                        {scr.id} · {scr.eye} · {new Date(scr.createdAt).toLocaleDateString()}
                        {scr.result.referable ? (
                          <span className="ml-2 rounded-[2px] bg-[#22D3EE] px-1.5 py-0.5 font-mono text-[10px] font-bold tracking-widest text-[#0A0B0D]">REFERABLE: YES</span>
                        ) : (
                          <span className="ml-2 rounded-[2px] bg-[#1A1C1F] px-1.5 py-0.5 font-mono text-[10px] font-bold tracking-widest text-[#8A8D93] ring-1 ring-[#2A2D31]">NON-REFERABLE</span>
                        )}
                      </span>
                    </span>
                    <ScanEye className="h-4 w-4 shrink-0 text-[#2A2D31]" aria-hidden="true" />
                  </Link>
                );
              })}
            </div>

            <div className="mt-3 flex items-center gap-2 font-mono text-[11px] tracking-wide text-[#4A4D52]">
              <Calendar className="h-3.5 w-3.5" aria-hidden="true" /> MIRRORS GET /api/screenings — MOCKED
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <div className="holo-panel p-4 sm:p-5">
              <h3 className="font-mono text-xs font-bold tracking-[0.12em] text-[#F5F6F7]">QUICK ACTIONS</h3>
              <div className="mt-3 grid gap-2">
                <Link href="/patients" className="flex items-center justify-between rounded-[2px] border border-[#2A2D31] bg-[#1A1C1F] px-4 py-3 font-mono text-xs font-bold tracking-wide text-[#F5F6F7] hover:bg-[#2A2D31]">
                  <span className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-[#22D3EE]" aria-hidden="true" /> BROWSE PATIENTS
                  </span>
                  <ArrowRight className="h-4 w-4 text-[#4A4D52]" aria-hidden="true" />
                </Link>
                <Link href="/patients/P-000001/screening/new" className="flex items-center justify-between rounded-[2px] border border-[#22D3EE]/20 bg-[#22D3EE]/10 px-4 py-3 font-mono text-xs font-bold tracking-wide text-[#22D3EE] hover:bg-[#22D3EE]/15">
                  <span className="flex items-center gap-2">
                    <ScanLine className="h-4 w-4" aria-hidden="true" /> NEW SCREENING — P-000001
                  </span>
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
                <div className="rounded-[2px] border border-[#1A1C1F] bg-[#0A0B0D] px-4 py-3">
                  <p className="flex items-center gap-2 font-mono text-xs font-bold tracking-wide text-[#F5F6F7]">
                    <FileText className="h-4 w-4 text-[#4A4D52]" aria-hidden="true" /> POST /predict
                  </p>
                  <pre className="mt-2 overflow-x-auto rounded-[2px] bg-[#1A1C1F] p-3 font-mono text-xs leading-relaxed text-[#8A8D93]">{`{
  severity: 2,
  severity_label: "Moderate",
  confidence: 0.9134,
  heatmap_base64: "..."
}`}</pre>
                  <p className="mt-2 font-mono text-[11px] leading-relaxed text-[#4A4D52]">CONFIDENCE STORED 0–1 // DISPLAYED ×100</p>
                </div>
              </div>
            </div>

            <div className="rounded-[2px] border border-[#1A1C1F] bg-[#1A1C1F]/40 px-4 py-3">
              <p className="flex items-center gap-1.5 font-mono text-[11px] tracking-[0.12em] text-[#4A4D52]">
                <Grid3X3 className="h-3 w-3" aria-hidden="true" /> TRADE-OFF NOTE
              </p>
              <p className="mt-1 font-mono text-xs leading-relaxed text-[#8A8D93]">
                Concept C is strictly cyan+grey — severity is <span className="text-[#22D3EE]">intensity/opacity + grade number + label + referable text</span>, not hue. This preserves clinical legibility without color-coding.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
