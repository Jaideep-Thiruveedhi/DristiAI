"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ScanEye, LayoutDashboard, Users, LogOut } from "lucide-react";
import { getMockRole, getMockEmail, clearMockSession, roleLabel, roleBadgeClasses } from "@/lib/auth";
import type { UserRole } from "@/lib/types";

export default function AppHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const [role, setRole] = useState<UserRole | null>(null);
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    setRole(getMockRole());
    setEmail(getMockEmail());
  }, [pathname]);

  if (pathname === "/") return null;

  const nav = [
    { href: "/dashboard", label: "DASHBOARD", icon: LayoutDashboard },
    { href: "/patients", label: "PATIENTS", icon: Users },
  ];

  return (
    <header className="sticky top-0 z-30 border-b border-[#1A1C1F] bg-[#0A0B0D]/85 backdrop-blur-[2px]">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6 sm:py-3.5">
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-[2px] bg-[#22D3EE]/10 ring-1 ring-[#22D3EE]/20">
              <ScanEye className="h-5 w-5 text-[#22D3EE]" aria-hidden="true" />
            </span>
            <span className="hidden sm:block">
              <span className="block font-mono text-xs font-bold tracking-[0.14em] text-[#F5F6F7] leading-none">DRISHTIAI</span>
              <span className="block font-mono text-[10px] tracking-[0.12em] text-[#4A4D52]">HOLOGRAPHIC GRID // CC-01</span>
            </span>
            <span className="sm:hidden font-mono text-xs font-bold tracking-[0.14em] text-[#F5F6F7]">DRISHTIAI</span>
          </Link>

          <nav className="hidden items-center gap-1 sm:flex" aria-label="Primary">
            {nav.map(({ href, label, icon: Icon }) => {
              const active = pathname === href || pathname.startsWith(href + "/");
              return (
                <Link
                  key={href}
                  href={href}
                  className={`inline-flex items-center gap-1.5 rounded-[2px] px-3 py-1.5 font-mono text-xs font-bold tracking-[0.12em] transition-colors ${
                    active ? "bg-[#F5F6F7] text-[#0A0B0D]" : "text-[#8A8D93] hover:bg-[#1A1C1F] hover:text-[#F5F6F7] ring-1 ring-transparent hover:ring-[#2A2D31]"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                  {label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          {role && (
            <span className={`hidden sm:inline-flex items-center rounded-[2px] px-2.5 py-1 font-mono text-[11px] font-bold tracking-wide ring-1 ${roleBadgeClasses(role)}`}>
              {roleLabel(role).toUpperCase()}
            </span>
          )}
          {email && (
            <span className="hidden lg:inline font-mono text-xs text-[#4A4D52] max-w-[160px] truncate">{email}</span>
          )}
          <button
            type="button"
            onClick={() => {
              clearMockSession();
              router.push("/");
            }}
            className="inline-flex items-center gap-1.5 rounded-[2px] border border-[#2A2D31] bg-[#1A1C1F] px-3 py-1.5 font-mono text-xs font-bold tracking-wide text-[#8A8D93] hover:bg-[#2A2D31] hover:text-[#F5F6F7] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#22D3EE]"
          >
            <LogOut className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">SIGN OUT</span>
          </button>
        </div>
      </div>

      <div className="flex items-center gap-1 border-t border-[#1A1C1F] px-4 py-2 sm:hidden">
        {nav.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={`flex-1 inline-flex items-center justify-center gap-1.5 rounded-[2px] px-3 py-2 font-mono text-xs font-bold tracking-wide ${
                active ? "bg-[#F5F6F7] text-[#0A0B0D]" : "text-[#8A8D93] bg-[#1A1C1F] ring-1 ring-[#2A2D31]"
              }`}
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
              {label}
            </Link>
          );
        })}
      </div>
    </header>
  );
}
