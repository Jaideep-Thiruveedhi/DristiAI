"use client";

import type { PatientRecord } from "@/lib/types";
import { User, Calendar, ScanEye, Database, MapPin, Phone } from "lucide-react";

interface DataPanelProps {
  patient: PatientRecord;
  variant?: "default" | "compact";
}

function Field({
  icon: IconRaw,
  label,
  value,
}: {
  icon: any;
  label: string;
  value: string;
}) {
  const Icon: any = IconRaw;
  return (
    <div className="flex items-center justify-between gap-4 py-2">
      <span className="flex items-center gap-2 font-mono text-[11px] tracking-[0.12em] text-[#4A4D52]">
        <Icon className="h-3.5 w-3.5 text-[#2A2D31]" aria-hidden="true" />
        {label}
      </span>
      <span className="font-mono text-xs tracking-wide text-[#F5F6F7] text-right">{value}</span>
    </div>
  );
}

export default function DataPanel({ patient }: DataPanelProps) {
  return (
    <div className="holo-panel p-4">
      <div className="mb-3 flex items-center gap-2">
        <span className="flex h-6 w-6 items-center justify-center rounded-[2px] bg-[#22D3EE]/10 ring-1 ring-[#22D3EE]/20">
          <Database className="h-3.5 w-3.5 text-[#22D3EE]" aria-hidden="true" />
        </span>
        <h3 className="font-mono text-xs font-bold tracking-[0.14em] text-[#F5F6F7]">PATIENT // SESSION</h3>
        <span className="ml-auto rounded-[2px] bg-[#0A0B0D] px-2.5 py-1 font-mono text-[11px] tracking-wide text-[#8A8D93] ring-1 ring-[#2A2D31]">
          {patient.id} · {patient.eye}
        </span>
      </div>

      <div className="divide-y divide-[#1A1C1F]">
        <Field icon={User} label="PATIENT ID" value={patient.id} />
        <Field icon={User} label="NAME" value={patient.name.toUpperCase()} />
        <Field icon={Calendar} label="AGE" value={`${patient.age} Y`} />
        <Field icon={User} label="SEX" value={patient.sex} />
        <Field icon={ScanEye} label="EYE" value={patient.eye === "OD" ? "OD · RIGHT" : "OS · LEFT"} />
        {patient.lastScanDate && <Field icon={Calendar} label="LAST SCAN" value={patient.lastScanDate} />}
        {patient.village && <Field icon={MapPin} label="VILLAGE" value={patient.village.toUpperCase()} />}
        {patient.phone && <Field icon={Phone} label="PHONE" value={patient.phone} />}
        <Field icon={ScanEye} label="RESOLUTION" value="2992 × 2000 PX" />
      </div>

      <p className="mt-3 rounded-[2px] border border-[#2A2D31] bg-[#0A0B0D] px-3 py-2 font-mono text-[11px] leading-relaxed tracking-wide text-[#4A4D52]">
        MOCK // FICTIONAL — PROTOTYPE ONLY
      </p>
    </div>
  );
}
