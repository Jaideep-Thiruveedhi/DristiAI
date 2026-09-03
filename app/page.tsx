"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ScanEye, Shield, Stethoscope, Users, ArrowRight, Info, Grid3X3, Activity } from "lucide-react";
import { setMockSession } from "@/lib/auth";
import type { UserRole } from "@/lib/types";

const roles: { value: UserRole; label: string; desc: string; icon: React.ElementType }[] = [
  { value: "health_worker", label: "HEALTH WORKER", desc: "CREATE PATIENTS // RUN SCREENINGS", icon: Users },
  { value: "doctor", label: "DOCTOR", desc: "REVIEW REPORTS // REFERRALS", icon: Stethoscope },
  { value: "admin", label: "ADMIN", desc: "MANAGE USERS // OVERVIEW", icon: Shield },
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("health.worker@dristiai.mock");
  const [password, setPassword] = useState("password");
  const [role, setRole] = useState<UserRole>("health_worker");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMockSession(role, email || "user@dristiai.mock");
    router.push("/dashboard");
  };

  return (
    <div className="flex flex-1 items-center justify-center px-4 py-10 sm:px-6 sm:py-12">
      <div className="w-full max-w-5xl grid gap-6 lg:grid-cols-[1.05fr_0.95fr] items-center">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="hidden lg:block"
        >
          <div className="holo-panel holo-panel--active p-8 sm:p-10">
            <span className="flex h-11 w-11 items-center justify-center rounded-[2px] bg-[#22D3EE]/10 ring-1 ring-[#22D3EE]/20">
              <ScanEye className="h-6 w-6 text-[#22D3EE]" aria-hidden="true" />
            </span>
            <h1 className="mt-6 font-mono text-2xl font-bold tracking-[0.08em] text-[#F5F6F7]">
              DRISHTIAI
              <span className="mt-1 block font-mono text-xs font-normal tracking-[0.18em] text-[#8A8D93]">
                HOLOGRAPHIC GRID // COMMAND CENTER — CONCEPT C
              </span>
            </h1>
            <p className="mt-4 font-mono text-xs leading-relaxed tracking-wide text-[#8A8D93]">
              Cinematic frontend prototype — monochromatic cyan+grey. Wireframe retina, grid floor, hover-to-snap XAI. All inference mocked client-side.
            </p>

            <div className="mt-6 grid gap-2">
              <div className="rounded-[2px] border border-[#2A2D31] bg-[#0A0B0D]/60 px-4 py-3">
                <p className="font-mono text-[10px] tracking-[0.14em] text-[#4A4D52]">REAL PIPELINE — MOCKED HERE</p>
                <p className="mt-1 font-mono text-xs leading-relaxed text-[#8A8D93]">
                  FLASK · PYTORCH · best_model.pth · GRAD-CAM · POST /predict → SEVERITY 0–4 · REFERABLE = ≥2
                </p>
              </div>
              <div className="rounded-[2px] border border-[#2A2D31] bg-[#0A0B0D]/60 px-4 py-3">
                <p className="font-mono text-[10px] tracking-[0.14em] text-[#4A4D52]">BOUNDARY</p>
                <p className="mt-1 font-mono text-xs leading-relaxed text-[#8A8D93]">NO BACKEND · NO MODEL FILES · NO DB — 100% REACT STATE + MOCK DATA</p>
              </div>
            </div>

            <p className="mt-4 flex items-start gap-2 rounded-[2px] border border-[#22D3EE]/15 bg-[#22D3EE]/[0.06] px-3 py-2.5 font-mono text-[11px] leading-relaxed text-[#8A8D93]">
              <Info className="h-4 w-4 shrink-0 text-[#22D3EE]/60 mt-0.5" aria-hidden="true" />
              SIGN IN ALWAYS SUCCEEDS. PICK ANY ROLE — BADGE IS COSMETIC. HEALTH-WORKER FLOW IS FULLY BUILT.
            </p>

            <div className="mt-6 flex items-center gap-2 font-mono text-[10px] tracking-[0.14em] text-[#2A2D31]">
              <Grid3X3 className="h-3 w-3" aria-hidden="true" /> WIREFRAME RETINA // GRID FLOOR // COMMAND ARC
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.06, ease: [0.16, 1, 0.3, 1] }}
          className="holo-panel holo-panel--active p-6 sm:p-8"
        >
          <div className="lg:hidden flex items-center gap-3 mb-5">
            <span className="flex h-9 w-9 items-center justify-center rounded-[2px] bg-[#22D3EE]/10 ring-1 ring-[#22D3EE]/20">
              <ScanEye className="h-5 w-5 text-[#22D3EE]" aria-hidden="true" />
            </span>
            <span>
              <span className="block font-mono text-xs font-bold tracking-[0.14em] text-[#F5F6F7]">DRISHTIAI</span>
              <span className="block font-mono text-[10px] tracking-[0.12em] text-[#4A4D52]">HOLOGRAPHIC GRID // CC-01</span>
            </span>
          </div>

          <h2 className="font-mono text-sm font-bold tracking-[0.14em] text-[#F5F6F7]">SIGN IN — MOCK AUTH</h2>
          <p className="mt-1 font-mono text-xs tracking-wide text-[#4A4D52]">NO REAL CREDENTIALS REQUIRED</p>

          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            <div>
              <label htmlFor="email" className="font-mono text-[11px] tracking-[0.14em] text-[#8A8D93]">
                EMAIL
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@dristiai.mock"
                className="mt-2 w-full rounded-[2px] border border-[#2A2D31] bg-[#0A0B0D] px-4 py-3 font-mono text-sm text-[#F5F6F7] placeholder:text-[#4A4D52] focus:border-[#22D3EE]/40 focus:outline-none focus:ring-1 focus:ring-[#22D3EE]/20"
              />
            </div>
            <div>
              <label htmlFor="password" className="font-mono text-[11px] tracking-[0.14em] text-[#8A8D93]">
                PASSWORD
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="mt-2 w-full rounded-[2px] border border-[#2A2D31] bg-[#0A0B0D] px-4 py-3 font-mono text-sm text-[#F5F6F7] placeholder:text-[#4A4D52] focus:border-[#22D3EE]/40 focus:outline-none focus:ring-1 focus:ring-[#22D3EE]/20"
              />
            </div>

            <div>
              <p className="font-mono text-[11px] tracking-[0.14em] text-[#8A8D93]">ROLE — COSMETIC BADGE ONLY</p>
              <div className="mt-2 grid gap-2">
                {roles.map((r) => {
                  const active = role === r.value;
                  const Icon = r.icon as any;
                  return (
                    <button
                      key={r.value}
                      type="button"
                      onClick={() => setRole(r.value)}
                      className={`flex items-center gap-3 rounded-[2px] border px-4 py-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#22D3EE] ${
                        active ? "border-[#22D3EE]/40 bg-[#22D3EE]/10" : "border-[#1A1C1F] bg-[#0A0B0D] hover:bg-[#1A1C1F] hover:border-[#2A2D31]"
                      }`}
                      aria-pressed={active as any}
                    >
                      <span className={`flex h-8 w-8 items-center justify-center rounded-[2px] ${active ? "bg-[#22D3EE] text-[#0A0B0D]" : "bg-[#1A1C1F] text-[#4A4D52] ring-1 ring-[#2A2D31]"}`}>
                        <Icon className="h-4 w-4" aria-hidden="true" />
                      </span>
                      <span className="flex-1">
                        <span className={`block font-mono text-xs font-bold tracking-wide ${active ? "text-[#F5F6F7]" : "text-[#8A8D93]"}`}>{r.label}</span>
                        <span className="block font-mono text-[11px] tracking-wide text-[#4A4D52]">{r.desc}</span>
                      </span>
                      <span className={`h-2.5 w-2.5 rounded-full ${active ? "bg-[#22D3EE] shadow-[0_0_8px_rgba(34,211,238,0.6)]" : "bg-[#1A1C1F] ring-1 ring-[#2A2D31]"}`} aria-hidden="true" />
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              type="submit"
              className="mt-1 inline-flex w-full items-center justify-center gap-2 rounded-[2px] bg-[#22D3EE] px-6 py-3.5 font-mono text-xs font-bold tracking-[0.14em] text-[#0A0B0D] hover:bg-[#7ADDF0] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#22D3EE]"
              style={{ boxShadow: "0 0 22px rgba(34,211,238,0.28)" }}
            >
              SIGN IN <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </form>

          <p className="mt-4 flex items-center justify-center gap-1.5 font-mono text-[11px] tracking-wide text-[#4A4D52]">
            <Activity className="h-3 w-3" aria-hidden="true" /> FRONTEND-ONLY // NO DATA LEAVES BROWSER
          </p>
        </motion.div>
      </div>
    </div>
  );
}
