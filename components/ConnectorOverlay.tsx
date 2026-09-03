"use client";

import { useEffect, useState } from "react";

interface ConnectorOverlayProps {
  anchorRect: DOMRect | null; // hovered row rect
  targetPoint: { x: number; y: number } | null; // projected 2D screen point in viewport coords
  canvasRect: DOMRect | null; // canvas container rect to offset
  visible: boolean;
  reducedMotion?: boolean;
}

/**
 * Full-viewport SVG overlay drawing a laser-thin cyan connector line
 * from the panel row anchor to the projected 3D point.
 * Uses getBoundingClientRect for anchor and camera.project for target.
 */
export default function ConnectorOverlay({
  anchorRect,
  targetPoint,
  canvasRect,
  visible,
  reducedMotion,
}: ConnectorOverlayProps) {
  const [opacity, setOpacity] = useState(0);

  useEffect(() => {
    if (visible && anchorRect && targetPoint) {
      if (reducedMotion) {
        setOpacity(1);
      } else {
        requestAnimationFrame(() => setOpacity(1));
      }
    } else {
      setOpacity(0);
    }
  }, [visible, anchorRect, targetPoint, reducedMotion]);

  if (!anchorRect || !targetPoint) return null;

  const x1 = anchorRect.right;
  const y1 = anchorRect.top + anchorRect.height / 2;
  // targetPoint is in Canvas-local pixels; convert to viewport
  const x2 = canvasRect ? canvasRect.left + targetPoint.x : targetPoint.x;
  const y2 = canvasRect ? canvasRect.top + targetPoint.y : targetPoint.y;

  // Control point for subtle curve
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2 - 18;

  return (
    <svg
      className="pointer-events-none fixed inset-0 h-screen w-screen"
      style={{ zIndex: 40, opacity, transition: reducedMotion ? "none" : "opacity 220ms ease" }}
      aria-hidden="true"
    >
      <defs>
        <filter id="glow">
          <feGaussianBlur stdDeviation="1.8" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
        <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#22D3EE" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#22D3EE" stopOpacity="0.45" />
        </linearGradient>
      </defs>

      {/* Outer glow */}
      <path
        d={`M ${x1} ${y1} Q ${mx} ${my} ${x2} ${y2}`}
        fill="none"
        stroke="rgba(34,211,238,0.18)"
        strokeWidth={6}
        strokeLinecap="round"
        style={{ filter: "blur(2px)" }}
      />
      {/* Main line */}
      <path
        d={`M ${x1} ${y1} Q ${mx} ${my} ${x2} ${y2}`}
        fill="none"
        stroke="url(#lineGrad)"
        strokeWidth={1.15}
        strokeLinecap="round"
        strokeDasharray={reducedMotion ? undefined : "8 6"}
      >
        {!reducedMotion && (
          <animate
            attributeName="stroke-dashoffset"
            from="0"
            to="14"
            dur="0.7s"
            repeatCount="indefinite"
          />
        )}
      </path>

      {/* Endpoint dot */}
      <circle cx={x2} cy={y2} r={4} fill="#22D3EE" opacity={0.95} />
      <circle cx={x2} cy={y2} r={8} fill="none" stroke="#22D3EE" strokeOpacity={0.35} strokeWidth={1} />
      {!reducedMotion && (
        <circle cx={x2} cy={y2} r={12} fill="none" stroke="#22D3EE" strokeOpacity={0.14} strokeWidth={1}>
          <animate attributeName="r" from="12" to="18" dur="1.1s" repeatCount="indefinite" />
          <animate attributeName="opacity" from="0.14" to="0" dur="1.1s" repeatCount="indefinite" />
        </circle>
      )}
    </svg>
  );
}
