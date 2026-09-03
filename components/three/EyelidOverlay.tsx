"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

interface EyelidOverlayProps {
  /** Increment to trigger a scan blink (e.g. key). When it changes, a single blink fires. */
  scanBlinkKey?: number;
  /** If true, idle random blinks are disabled (reduced motion). */
  reducedMotion?: boolean;
  /** Optional external control: force closed for 150-250ms then open */
  forceBlink?: boolean;
}

/**
 * Screen-space eyelid masks — two curved dark shapes covering the globe.
 * Absolutely positioned over the Canvas container; animation is Framer Motion
 * translate/scale, not 3D geometry, so it reads as eyelids regardless of globe rotation.
 * Matches dark grey palette (#0A0B0D / #1A1C1F), not skin-toned.
 */
export default function EyelidOverlay({
  scanBlinkKey,
  reducedMotion: reducedMotionProp,
  forceBlink,
}: EyelidOverlayProps) {
  const prefersReducedMotion = useReducedMotion();
  const reducedMotion = reducedMotionProp ?? !!prefersReducedMotion;

  const [isClosed, setIsClosed] = useState(false);
  const [scanKeyPrev, setScanKeyPrev] = useState(scanBlinkKey);

  const triggerBlink = useCallback(
    (durationClosedMs = 180) => {
      if (reducedMotion) return; // spec: disable idle loop entirely; scan blink at most once and instant — we drop animation under reduced motion
      setIsClosed(true);
      window.setTimeout(() => setIsClosed(false), durationClosedMs);
    },
    [reducedMotion],
  );

  // Scan-triggered blink: fires when scanBlinkKey increments
  useEffect(() => {
    if (scanBlinkKey === undefined) return;
    if (scanBlinkKey !== scanKeyPrev) {
      setScanKeyPrev(scanBlinkKey);
      if (reducedMotion) return; // drop scan blink too under reduced motion (spec: or drop it too)
      triggerBlink(200);
    }
  }, [scanBlinkKey, scanKeyPrev, triggerBlink, reducedMotion]);

  // Force blink via prop (alternative trigger)
  useEffect(() => {
    if (forceBlink) triggerBlink(200);
  }, [forceBlink, triggerBlink]);

  // Idle random blink loop — every 4–9s randomized per cycle, fast 150–250ms closed
  useEffect(() => {
    if (reducedMotion) return; // spec: disable idle random blink loop entirely
    let timeoutId: number;
    let closedTimeoutId: number;

    const schedule = () => {
      const delay = 4000 + Math.random() * 5000; // 4–9s
      timeoutId = window.setTimeout(() => {
        setIsClosed(true);
        const closedMs = 150 + Math.random() * 100; // 150–250ms
        closedTimeoutId = window.setTimeout(() => {
          setIsClosed(false);
          schedule();
        }, closedMs);
      }, delay);
    };
    schedule();
    return () => {
      window.clearTimeout(timeoutId);
      window.clearTimeout(closedTimeoutId);
    };
  }, [reducedMotion]);

  // Heights: when closed, eyelids meet at center; when open, fully retracted
  // Use clipPath-like curved masks via border-radius + scaleY
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {/* Top eyelid */}
      <motion.div
        className="absolute left-1/2 top-0 w-[72%] max-w-[560px] -translate-x-1/2"
        style={{
          height: "50%",
          background: "linear-gradient(to bottom, #0A0B0D 0%, #1A1C1F 72%, #0A0B0D 100%)",
          borderBottomLeftRadius: "48% 100%",
          borderBottomRightRadius: "48% 100%",
          boxShadow: "0 6px 24px rgba(0,0,0,0.55)",
          transformOrigin: "top center",
        }}
        initial={false}
        animate={{
          y: isClosed ? "0%" : "-102%",
          opacity: isClosed ? 1 : 0,
        }}
        transition={
          reducedMotion
            ? { duration: 0 }
            : isClosed
              ? { duration: 0.09, ease: [0.4, 0, 1, 1] } // fast close
              : { duration: 0.11, ease: [0.16, 1, 0.3, 1] } // snap open
        }
      />

      {/* Bottom eyelid — mirrors top */}
      <motion.div
        className="absolute bottom-0 left-1/2 w-[72%] max-w-[560px] -translate-x-1/2"
        style={{
          height: "50%",
          background: "linear-gradient(to top, #0A0B0D 0%, #1A1C1F 72%, #0A0B0D 100%)",
          borderTopLeftRadius: "48% 100%",
          borderTopRightRadius: "48% 100%",
          boxShadow: "0 -6px 24px rgba(0,0,0,0.55)",
          transformOrigin: "bottom center",
        }}
        initial={false}
        animate={{
          y: isClosed ? "0%" : "102%",
          opacity: isClosed ? 1 : 0,
        }}
        transition={
          reducedMotion
            ? { duration: 0 }
            : isClosed
              ? { duration: 0.09, ease: [0.4, 0, 1, 1] }
              : { duration: 0.11, ease: [0.16, 1, 0.3, 1] }
        }
      />

      {/* Soft vignette edge when closed — sells depth */}
      <AnimatePresence>
        {isClosed && !reducedMotion && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.08 }}
            className="absolute inset-0"
            style={{
              background: "radial-gradient(ellipse 42% 38% at 50% 50%, transparent 58%, rgba(0,0,0,0.35) 100%)",
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
