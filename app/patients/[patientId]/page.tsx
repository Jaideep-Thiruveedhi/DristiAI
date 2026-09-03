"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, ScanLine, ScanEye, Calendar, FileText, Users } from "lucide-react";
import { mockPatients, mockScreenings } from "@/lib/mockData";
import DataPanel from "@/components/DataPanel";

export default function PatientDetailPage() {
  const params = useParams<{ patientId: string }>();
  const patientId = params.patientId;
  const patient = mockPatients.find((p) => p.id === patientId);
  const screenings = mockScreenings
    .filter((s) => s.patientId === patientId)
    .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));

  if (!patient) {
    return (
      <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6">
        <div className="rounded-[2px] border border-[#2A2D31] bg-[#1A1C1F]/40 px-6 py-12 text-center">
          <Users className="mx-auto h-8 w-8 text-[#4A4D52]" aria-hidden="true" />
          <p className="mt-3 font-mono text-sm font-bold tracking-wide text-[#F5F6F7]">PATIENT {patientId} NOT FOUND</p>
          <Link href="/patients" className="mt-4 inline-flex items-center gap-2 font-mono text-xs font-bold tracking-wide text-[#22D3EE] hover:text-[#7ADDF0]">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" /> BACK TO PATIENTS
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
      <div className="flex flex-col gap-6">
        <Link href="/patients" className="inline-flex items-center gap-1.5 self-start font-mono text-xs tracking-[0.12em] text-[#4A4D52] hover:text-[#F5F6F7]">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" /> PATIENTS
        </Link>

        <div>
          <h1 className="font-mono text-xl font-bold tracking-[0.12em] text-[#F5F6F7] sm:text-2xl">
            {patient.name.toUpperCase()} <span className="font-mono text-sm font-normal tracking-wide text-[#4A4D52]">{patient.id}</span>
          </h1>
          <p className="mt-1 font-mono text-xs tracking-wide text-[#4A4D52]">DEMOGRAPHICS + PRIOR SCREENINGS // MIRRORS GET /api/patients/{patient.id}</p>
        </div>

        <div className="grid gap-4 lg:grid-cols-[0.95fr_1.15fr]">
          <div className="flex flex-col gap-4">
            <DataPanel patient={patient} />
            <Link
              href={`/patients/${patient.id}/screening/new`}
              className="inline-flex items-center justify-center gap-2 rounded-[2px] bg-[#22D3EE] px-6 py-3.5 font-mono text-xs font-bold tracking-[0.12em] text-[#0A0B0D] hover:bg-[#7ADDF0] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#22D3EE]"
              style={{ boxShadow: "0 0 18px rgba(34,211,238,0.22)" }}
            >
              <ScanLine className="h-4 w-4" aria-hidden="true" /> NEW SCREENING
            </Link>
            <p className="font-mono text-xs leading-relaxed tracking-wide text-[#4A4D52]">
              FLOW: PATIENT → NEW SCREENING → UPLOAD → QUALITY CHECK → ANALYZE → SAVE → REPORT
            </p>
          </div>

          <div className="holo-panel holo-panel--active p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <h2 className="flex items-center gap-2 font-mono text-xs font-bold tracking-[0.12em] text-[#F5F6F7]">
                <FileText className="h-4 w-4 text-[#22D3EE]" aria-hidden="true" /> PRIOR SCREENINGS
              </h2>
              <span className="rounded-[2px] bg-[#0A0B0D] px-2.5 py-1 font-mono text-xs tracking-wide text-[#4A4D52] ring-1 ring-[#1A1C1F]">{screenings.length} TOTAL</span>
            </div>

            {screenings.length === 0 ? (
              <div className="mt-6 rounded-[2px] border border-dashed border-[#2A2D31] bg-[#0A0B0D]/50 px-6 py-10 text-center">
                <ScanEye className="mx-auto h-6 w-6 text-[#4A4D52]" aria-hidden="true" />
                <p className="mt-2 font-mono text-xs font-bold tracking-wide text-[#8A8D93]">NO SCREENINGS YET</p>
                <p className="mt-1 font-mono text-xs tracking-wide text-[#4A4D52]">START A NEW SCREENING TO GENERATE A MOCKED GRAD-CAM REPORT</p>
              </div>
            ) : (
              <div className="mt-4 divide-y divide-[#1A1C1F] overflow-hidden rounded-[2px] border border-[#1A1C1F]">
                {screenings.map((scr, i) => (
                  <motion.div
                    key={scr.id}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04, duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <Link
                      href={`/patients/${patient.id}/screening/${scr.id}`}
                      className="flex items-center gap-3 bg-[#0A0B0D]/40 px-4 py-4 hover:bg-[#1A1C1F]/60 transition-colors"
                    >
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[2px] bg-[#1A1C1F] font-mono text-sm font-bold text-[#22D3EE] ring-1 ring-[#2A2D31]">{scr.result.severity}</span>
                      <span className="min-w-0 flex-1">
                        <span className="block font-mono text-xs font-bold tracking-wide text-[#F5F6F7]">
                          {scr.id} · GRADE {scr.result.severity} · {scr.result.severityLabel.toUpperCase()}
                          {scr.result.referable ? (
                            <span className="ml-2 rounded-[2px] bg-[#22D3EE] px-1.5 py-0.5 font-mono text-[10px] font-bold tracking-widest text-[#0A0B0D]">REFERABLE: YES</span>
                          ) : (
                            <span className="ml-2 rounded-[2px] bg-[#1A1C1F] px-1.5 py-0.5 font-mono text-[10px] font-bold tracking-widest text-[#8A8D93] ring-1 ring-[#2A2D31]">NON-REFERABLE</span>
                          )}
                        </span>
                        <span className="mt-0.5 flex flex-wrap items-center gap-2 font-mono text-[11px] tracking-wide text-[#4A4D52]">
                          <span className="inline-flex items-center gap-1">
                            <Calendar className="h-3 w-3" aria-hidden="true" /> {new Date(scr.createdAt).toLocaleString()}
                          </span>
                          <span>· {scr.eye}</span>
                          <span>· {scr.imageQuality.toUpperCase()}</span>
                          <span>· {(scr.result.confidence * 100).toFixed(1)}%</span>
                        </span>
                        <span className="mt-1 block font-mono text-xs leading-relaxed text-[#8A8D93] line-clamp-2">{scr.result.explanation}</span>
                      </span>
                      <ScanEye className="h-4 w-4 shrink-0 text-[#2A2D31]" aria-hidden="true" />
                    </Link>
                  </motion.div>
                ))}
              </div>
            )}

            <p className="mt-3 font-mono text-[11px] tracking-wide text-[#4A4D52]">MIRRORS GET /api/screenings/{patient.id}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
