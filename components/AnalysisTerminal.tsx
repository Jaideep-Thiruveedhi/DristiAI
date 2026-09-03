"use client";

import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { AnalysisLogLine } from "@/lib/types";
import { Terminal, Check, Loader2 } from "lucide-react";

interface AnalysisTerminalProps {
  logLines: AnalysisLogLine[];
  visibleCount: number;
}

export default function AnalysisTerminal({
  logLines,
  visibleCount,
}: AnalysisTerminalProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [visibleCount]);

  const visible = logLines.slice(0, visibleCount);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 6 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className="holo-panel holo-panel--active overflow-hidden"
      aria-live="polite"
      aria-label="Analysis log"
    >
      <div className="flex items-center gap-2 border-b border-[#1A1C1F] bg-[#0A0B0D]/60 px-4 py-3">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-[#2A2D31]" aria-hidden="true" />
          <span className="h-2 w-2 rounded-full bg-[#2A2D31]" aria-hidden="true" />
          <span className="h-2 w-2 rounded-full bg-[#22D3EE] shadow-[0_0_6px_rgba(34,211,238,0.5)]" aria-hidden="true" />
        </span>
        <span className="ml-2 flex items-center gap-1.5 font-mono text-[11px] tracking-[0.14em] text-[#8A8D93]">
          <Terminal className="h-3.5 w-3.5 text-[#4A4D52]" aria-hidden="true" />
          DRISHTIAI PIPELINE
        </span>
        <span className="ml-auto flex items-center gap-1.5 font-mono text-[11px] tracking-wide text-[#22D3EE]">
          <Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" />
          ANALYZING…
        </span>
      </div>

      <div
        ref={scrollRef}
        className="scrollbar-thin max-h-[220px] overflow-y-auto px-4 py-3 font-mono text-xs leading-6"
      >
        <AnimatePresence initial={false}>
          {visible.map((line, idx) => {
            const isLast = idx === visible.length - 1;
            const isActive = isLast && visibleCount < logLines.length;
            const isDone = !isActive;

            return (
              <motion.div
                key={line.id}
                initial={{ opacity: 0, x: -4 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="flex items-start gap-2 py-0.5"
              >
                <span className="mt-[5px] shrink-0" aria-hidden="true">
                  {isDone ? (
                    <Check className="h-3 w-3 text-[#22D3EE]" />
                  ) : (
                    <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-[#22D3EE] shadow-[0_0_6px_rgba(34,211,238,0.7)]" />
                  )}
                </span>
                <span className={isDone ? "text-[#8A8D93]" : "text-[#22D3EE]"}>
                  <span className="select-none text-[#2A2D31]">&gt; </span>
                  {line.text.toUpperCase()}
                  {isActive && (
                    <span className="ml-1 inline-block h-3 w-2 translate-y-[2px] bg-[#22D3EE] animate-pulse" aria-hidden="true">
                      ▋
                    </span>
                  )}
                </span>
              </motion.div>
            );
          })}
        </AnimatePresence>
        <span className="sr-only" aria-live="polite">
          {visible.length > 0 ? visible[visible.length - 1].text : "Initializing analysis"}
        </span>
      </div>

      <div className="h-px w-full bg-[#1A1C1F]">
        <motion.div
          className="h-px bg-[#22D3EE]"
          initial={{ width: "0%" }}
          animate={{ width: `${(visibleCount / logLines.length) * 100}%` }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          style={{ boxShadow: "0 0 10px rgba(34,211,238,0.6)" }}
          aria-hidden="true"
        />
      </div>
    </motion.div>
  );
}
