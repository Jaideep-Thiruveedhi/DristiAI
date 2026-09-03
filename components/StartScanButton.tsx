"use client";

import { motion } from "framer-motion";
import { ScanLine, Sparkles } from "lucide-react";

interface StartScanButtonProps {
  onClick: () => void;
  disabled?: boolean;
}

export default function StartScanButton({ onClick, disabled }: StartScanButtonProps) {
  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      whileHover={disabled ? undefined : { scale: 1.01 }}
      whileTap={disabled ? undefined : { scale: 0.99 }}
      className="group relative inline-flex items-center justify-center gap-2 rounded-[2px] bg-[#22D3EE] px-7 py-3 font-mono text-xs font-bold tracking-[0.12em] text-[#0A0B0D] hover:bg-[#7ADDF0] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#22D3EE] disabled:cursor-not-allowed disabled:opacity-40 disabled:bg-[#1A1C1F] disabled:text-[#4A4D52] disabled:ring-1 disabled:ring-[#2A2D31]"
      style={{ boxShadow: disabled ? undefined : "0 0 18px rgba(34,211,238,0.28)" }}
      aria-label="Start retinal scan"
    >
      <ScanLine className="h-4 w-4" aria-hidden="true" />
      START SCAN <Sparkles className="h-3.5 w-3.5 opacity-60 group-hover:opacity-100 transition-opacity" aria-hidden="true" />
    </motion.button>
  );
}
