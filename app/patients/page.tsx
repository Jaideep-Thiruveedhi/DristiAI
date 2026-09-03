"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Search, Plus, Users, ScanEye, Calendar, ArrowRight } from "lucide-react";
import { mockPatients, mockScreenings } from "@/lib/mockData";

export default function PatientsPage() {
  const [query, setQuery] = useState("");
  const [eyeFilter, setEyeFilter] = useState<"all" | "OD" | "OS">("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return mockPatients.filter((p) => {
      if (eyeFilter !== "all" && p.eye !== eyeFilter) return false;
      if (!q) return true;
      return (
        p.id.toLowerCase().includes(q) ||
        p.name.toLowerCase().includes(q) ||
        (p.village ?? "").toLowerCase().includes(q)
      );
    });
  }, [query, eyeFilter]);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="flex items-center gap-2 font-mono text-xl font-bold tracking-[0.12em] text-[#F5F6F7]">
              <Users className="h-5 w-5 text-[#22D3EE]" aria-hidden="true" />
              PATIENTS
            </h1>
            <p className="mt-1 font-mono text-xs tracking-wide text-[#4A4D52]">MOCK LIST // HEALTH WORKER CREATES PATIENTS // P-000001 STYLE</p>
          </div>
          <button
            type="button"
            onClick={() => alert("Create patient — mocked in this prototype")}
            className="inline-flex items-center justify-center gap-2 rounded-[2px] border border-[#2A2D31] bg-[#1A1C1F] px-5 py-3 font-mono text-xs font-bold tracking-[0.12em] text-[#F5F6F7] hover:bg-[#2A2D31]"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            NEW PATIENT
          </button>
        </div>

        <div className="holo-panel p-4 sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <label className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#4A4D52]" aria-hidden="true" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="SEARCH BY ID, NAME, VILLAGE…"
                className="w-full rounded-[2px] border border-[#2A2D31] bg-[#0A0B0D] py-2.5 pl-10 pr-4 font-mono text-sm text-[#F5F6F7] placeholder:text-[#4A4D52] focus:border-[#22D3EE]/30 focus:outline-none focus:ring-1 focus:ring-[#22D3EE]/15"
              />
            </label>
            <div className="flex items-center gap-1 rounded-[2px] border border-[#2A2D31] bg-[#0A0B0D] p-1">
              {(["all", "OD", "OS"] as const).map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setEyeFilter(v)}
                  className={`rounded-[2px] px-4 py-1.5 font-mono text-xs font-bold tracking-wide transition-colors ${
                    eyeFilter === v ? "bg-[#F5F6F7] text-[#0A0B0D]" : "text-[#4A4D52] hover:text-[#F5F6F7]"
                  }`}
                >
                  {v === "all" ? "ALL" : v}
                </button>
              ))}
            </div>
          </div>
          <p className="mt-3 font-mono text-xs tracking-wide text-[#4A4D52]">
            SHOWING {filtered.length} OF {mockPatients.length} // MIRRORS GET /api/patients
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p, i) => {
            const count = mockScreenings.filter((s) => s.patientId === p.id).length;
            const last = mockScreenings
              .filter((s) => s.patientId === p.id)
              .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))[0];
            return (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03, duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              >
                <Link
                  href={`/patients/${p.id}`}
                  className="holo-panel flex h-full flex-col p-4 hover:border-[#22D3EE]/30 transition-colors group"
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className="rounded-[2px] bg-[#0A0B0D] px-2.5 py-1 font-mono text-xs tracking-wide text-[#F5F6F7] ring-1 ring-[#2A2D31]">
                      {p.id}
                    </span>
                    <span className="rounded-[2px] bg-[#1A1C1F] px-2.5 py-1 font-mono text-xs tracking-wide text-[#4A4D52] ring-1 ring-[#2A2D31]">
                      {p.eye}
                    </span>
                  </div>
                  <h3 className="mt-3 font-mono text-sm font-bold tracking-wide text-[#F5F6F7] group-hover:text-[#22D3EE] transition-colors">
                    {p.name.toUpperCase()}
                  </h3>
                  <p className="font-mono text-xs tracking-wide text-[#4A4D52]">
                    {p.age} YRS · {p.sex} {p.village ? `· ${p.village.toUpperCase()}` : ""}
                  </p>

                  <div className="mt-3 flex flex-wrap items-center gap-1.5">
                    <span className="inline-flex items-center gap-1 rounded-[2px] bg-[#0A0B0D] px-2.5 py-1 font-mono text-[11px] tracking-wide text-[#4A4D52] ring-1 ring-[#1A1C1F]">
                      <Calendar className="h-3 w-3" aria-hidden="true" />
                      {p.lastScanDate ?? "NO SCANS"}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-[2px] bg-[#22D3EE]/10 px-2.5 py-1 font-mono text-[11px] tracking-wide text-[#22D3EE] ring-1 ring-[#22D3EE]/20">
                      <ScanEye className="h-3 w-3" aria-hidden="true" />
                      {count} SCR
                    </span>
                  </div>

                  {last && (
                    <p className="mt-2 rounded-[2px] bg-[#0A0B0D] px-3 py-2 font-mono text-xs leading-relaxed text-[#8A8D93] ring-1 ring-[#1A1C1F]">
                      LAST: GRADE {last.result.severity} · {last.result.severityLabel.toUpperCase()}
                      {last.result.referable && (
                        <span className="ml-2 rounded-[2px] bg-[#22D3EE] px-1.5 py-0.5 font-mono text-[10px] font-bold tracking-widest text-[#0A0B0D]">REFERABLE: YES</span>
                      )}
                    </p>
                  )}

                  <span className="mt-3 inline-flex items-center gap-1 font-mono text-xs font-bold tracking-[0.12em] text-[#22D3EE] group-hover:text-[#7ADDF0]">
                    VIEW PATIENT <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </span>
                </Link>
              </motion.div>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="rounded-[2px] border border-[#2A2D31] bg-[#1A1C1F]/40 px-6 py-12 text-center">
            <p className="font-mono text-sm text-[#8A8D93]">NO PATIENTS MATCH “{query.toUpperCase()}”</p>
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setEyeFilter("all");
              }}
              className="mt-3 font-mono text-xs font-bold tracking-wide text-[#22D3EE] hover:text-[#7ADDF0]"
            >
              CLEAR FILTERS
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
