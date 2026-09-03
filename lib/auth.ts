"use client";

import type { UserRole } from "./types";

const ROLE_KEY = "dristiai_mock_role";
const EMAIL_KEY = "dristiai_mock_email";

export function getMockRole(): UserRole | null {
  if (typeof window === "undefined") return null;
  const v = localStorage.getItem(ROLE_KEY) as UserRole | null;
  if (v === "admin" || v === "doctor" || v === "health_worker") return v;
  return null;
}

export function getMockEmail(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(EMAIL_KEY);
}

export function setMockSession(role: UserRole, email: string) {
  localStorage.setItem(ROLE_KEY, role);
  localStorage.setItem(EMAIL_KEY, email);
}

export function clearMockSession() {
  localStorage.removeItem(ROLE_KEY);
  localStorage.removeItem(EMAIL_KEY);
}

export function roleLabel(role: UserRole): string {
  if (role === "health_worker") return "Health Worker";
  if (role === "doctor") return "Doctor";
  return "Admin";
}

// Concept C: monochrome — role badges use cyan intensity + outline, not hue
export function roleBadgeClasses(role: UserRole): string {
  if (role === "admin") return "bg-[#22D3EE] text-[#0A0B0D] ring-[#22D3EE]";
  if (role === "doctor") return "bg-[#1A1C1F] text-[#22D3EE] ring-[#22D3EE]/40";
  return "bg-[#1A1C1F] text-[#F5F6F7] ring-[#2A2D31]";
}
