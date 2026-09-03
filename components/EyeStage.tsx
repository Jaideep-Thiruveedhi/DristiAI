"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { useReducedMotion } from "framer-motion";

interface EyeStageFinding {
  label: string;
  zone: string;
  angle: number;
  r: number;
}

interface XAIFindingLike {
  id: string;
  label: string;
  position: { x: number; y: number; z: number };
  detail?: string;
}

type AnyFinding = EyeStageFinding | XAIFindingLike;

interface EyeStageProps {
  scanState?: "idle" | "processing" | "revealed" | "complete";
  findings?: AnyFinding[];
  activeIdx?: number | null;
  onHoverIdx?: (idx: number | null) => void;
  onScanTrigger?: () => void;
  reducedMotion?: boolean;
  scanBlinkKey?: number;
}

const DEFAULT_FINDINGS: EyeStageFinding[] = [
  { label: "Microaneurysm cluster", zone: "Superior temporal", angle: -40, r: 68 },
  { label: "Dot hemorrhage", zone: "Inferior nasal", angle: 150, r: 60 },
  { label: "Hard exudate patch", zone: "Macular border", angle: 55, r: 72 },
  { label: "Vessel tortuosity", zone: "Peripheral inferior", angle: 220, r: 64 },
];

const CX = 260;
const CY = 150;
const IRIS_R = 95;
const PUPIL_R = 27;

export default function EyeStage({
  scanState = "idle",
  findings = DEFAULT_FINDINGS,
  activeIdx: controlledActiveIdx,
  onHoverIdx,
  reducedMotion: propReduced,
}: EyeStageProps) {
  const prefersReduced = useReducedMotion();
  const reducedMotion = propReduced ?? !!prefersReduced;

  const [internalActive, setInternalActive] = useState<number | null>(null);
  const activeIdx = controlledActiveIdx !== undefined ? controlledActiveIdx : internalActive;
  const [isBlinking, setIsBlinking] = useState(false);
  const irisGroupRef = useRef<SVGGElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const markerRefs = useRef<(SVGCircleElement | null)[]>([]);
  const lineRef = useRef<SVGLineElement>(null);
  const dotRef = useRef<SVGCircleElement>(null);
  const pupilCircleRef = useRef<SVGCircleElement>(null);

  const markers = useMemo(() => {
    return findings.map((f: any) => {
      if ("position" in f && f.position) {
        const angle = (Math.atan2(f.position.y, f.position.x) * 180) / Math.PI;
        const dist = Math.sqrt(f.position.x * f.position.x + f.position.y * f.position.y);
        const r = 52 + (Math.min(dist / 1.8, 1) * 26); // map 0-1.8 -> 52-78 within iris
        const rad = (angle * Math.PI) / 180;
        const x = CX + Math.cos(rad) * r;
        const y = CY + Math.sin(rad) * r;
        const label = f.label ?? "";
        const zone = f.detail ?? f.id ?? "";
        return { label, zone, angle, r, x, y, _orig: f } as any;
      }
      const rad = (f.angle * Math.PI) / 180;
      const x = CX + Math.cos(rad) * f.r;
      const y = CY + Math.sin(rad) * f.r;
      return { ...f, x, y };
    });
  }, [findings]);

  // striations 110 radial lines
  const striations = useMemo(() => {
    const arr: { x1: number; y1: number; x2: number; y2: number; w: string }[] = [];
    for (let i = 0; i < 110; i++) {
      const angle = (Math.PI * 2 / 110) * i + (Math.random() - 0.5) * 0.04;
      const rIn = PUPIL_R + 2 + Math.random() * 4;
      const rOut = IRIS_R - 2 - Math.random() * 10;
      const x1 = CX + Math.cos(angle) * rIn;
      const y1 = CY + Math.sin(angle) * rIn;
      const x2 = CX + Math.cos(angle) * rOut;
      const y2 = CY + Math.sin(angle) * rOut;
      arr.push({ x1, y1, x2, y2, w: (0.6 + Math.random() * 0.8).toFixed(2) });
    }
    return arr;
  }, []);

  const handleHover = (idx: number | null) => {
    if (onHoverIdx) onHoverIdx(idx);
    else setInternalActive(idx);
    if (idx !== null) {
      const m = markers[idx];
      if (irisGroupRef.current) {
        const dx = (CX - m.x) * 0.18;
        const dy = (CY - m.y) * 0.18;
        irisGroupRef.current.style.transform = `translate(${dx}px, ${dy}px) scale(1.04)`;
      }
    } else {
      if (irisGroupRef.current) irisGroupRef.current.style.transform = "";
    }
  };

  // connector RAF loop
  useEffect(() => {
    let raf = 0;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      if (activeIdx === null || !markers[activeIdx] || !heroRef.current || !stageRef.current || !lineRef.current || !dotRef.current) return;
      const m = markers[activeIdx];
      const el = markerRefs.current[activeIdx];
      if (!el) return;
      const heroRect = heroRef.current.getBoundingClientRect();
      const mRect = el.getBoundingClientRect();
      const x2 = mRect.left + mRect.width / 2 - heroRect.left;
      const y2 = mRect.top + mRect.height / 2 - heroRect.top;
      const x1 = stageRef.current.offsetLeft + stageRef.current.offsetWidth + 40;
      const y1 = 40;
      lineRef.current.setAttribute("x1", String(x1));
      lineRef.current.setAttribute("y1", String(y1));
      lineRef.current.setAttribute("x2", String(x2));
      lineRef.current.setAttribute("y2", String(y2));
      dotRef.current.setAttribute("cx", String(x2));
      dotRef.current.setAttribute("cy", String(y2));
      lineRef.current.classList.add("active");
      dotRef.current.classList.add("active");
      if (activeIdx === null) {
        lineRef.current.classList.remove("active");
        dotRef.current.classList.remove("active");
      }
    };
    tick();
    return () => cancelAnimationFrame(raf);
  }, [activeIdx, markers]);

  // clear connector when inactive
  useEffect(() => {
    if (activeIdx === null && lineRef.current && dotRef.current) {
      lineRef.current.classList.remove("active");
      dotRef.current.classList.remove("active");
    }
  }, [activeIdx]);

  // idle saccade
  useEffect(() => {
    if (reducedMotion) return;
    let timeout: number;
    const loop = () => {
      if (activeIdx !== null) {
        timeout = window.setTimeout(loop, 1200);
        return;
      }
      const dx = (Math.random() - 0.5) * 16;
      const dy = (Math.random() - 0.5) * 10;
      if (irisGroupRef.current) irisGroupRef.current.style.transform = `translate(${dx}px, ${dy}px)`;
      timeout = window.setTimeout(loop, 1800 + Math.random() * 2200);
    };
    loop();
    return () => window.clearTimeout(timeout);
  }, [activeIdx, reducedMotion]);

  // pupil dilate
  useEffect(() => {
    if (reducedMotion) return;
    let phase = 0;
    const id = window.setInterval(() => {
      phase += 0.4;
      const r = 27 + Math.sin(phase) * 2;
      if (pupilCircleRef.current) pupilCircleRef.current.setAttribute("r", r.toFixed(1));
    }, 100);
    return () => window.clearInterval(id);
  }, [reducedMotion]);

  // blink schedule
  const triggerBlink = () => {
    if (reducedMotion) return;
    setIsBlinking(true);
    window.setTimeout(() => setIsBlinking(false), 380);
  };
  useEffect(() => {
    if (reducedMotion) return;
    let t: number;
    const schedule = () => {
      const next = 4000 + Math.random() * 4000;
      t = window.setTimeout(() => {
        triggerBlink();
        schedule();
      }, next);
    };
    schedule();
    return () => window.clearTimeout(t);
  }, [reducedMotion]);

  // scan-triggered blink
  const prevScanRef = useRef(scanState);
  useEffect(() => {
    if (prevScanRef.current !== "processing" && scanState === "processing") {
      triggerBlink();
    }
    prevScanRef.current = scanState;
  }, [scanState]);

  const isScanning = scanState === "processing";

  return (
    <div ref={heroRef} className="eye-hero">
      <style>{`
        .eye-hero{position:relative;overflow:hidden;border-right:1px solid #22262b;display:flex;align-items:center;justify-content:center;background:#0a0b0d;min-height:340px;}
        .eye-hero .hero-bg-grid{position:absolute;inset:0;pointer-events:none;background-image:linear-gradient(rgba(34,211,238,.05) 1px, transparent 1px),linear-gradient(90deg, rgba(34,211,238,.05) 1px, transparent 1px);background-size:36px 36px;-webkit-mask-image:radial-gradient(ellipse at 50% 55%, black 10%, transparent 68%);mask-image:radial-gradient(ellipse at 50% 55%, black 10%, transparent 68%);}
        .eye-hero .hero-label{position:absolute;top:24px;left:24px;font-size:11px;letter-spacing:.15em;color:#22d3ee;display:flex;align-items:center;gap:8px;text-transform:uppercase;z-index:6;font-family:'JetBrains Mono',monospace;}
        .eye-hero .hero-label::before{content:'';width:6px;height:6px;border-radius:50%;background:#22d3ee;box-shadow:0 0 8px #22d3ee;animation:eyePulseDot 1.6s infinite;}
        @keyframes eyePulseDot{0%,100%{opacity:1;}50%{opacity:.3;}}
        .eye-hero .hero-caption{position:absolute;bottom:24px;left:24px;font-size:11px;color:#3a3f46;max-width:340px;line-height:1.6;z-index:6;font-family:'JetBrains Mono',monospace;}
        .eye-hero .hero-caption b{color:#f2f4f6;}
        #eyeStageInner{position:relative;width:560px;height:320px;flex-shrink:0;}
        #eyeSvg{width:100%;height:100%;overflow:visible;}
        #irisGroup{transition:transform 1.1s cubic-bezier(.4,0,.2,1);}
        .striation{stroke:url(#irisGrad);opacity:.55;}
        .marker-dot{fill:#22d3ee;filter:drop-shadow(0 0 4px #22d3ee);}
        .marker-ring{fill:none;stroke:#22d3ee;opacity:.5;}
        .marker-ring.pulse{animation:markerPulse 2.4s infinite;}
        @keyframes markerPulse{0%{r:6;opacity:.6;}100%{r:16;opacity:0;}}
        .scan-ring{fill:none;stroke:#22d3ee;stroke-width:1;stroke-dasharray:4 7;opacity:.45;transform-origin:260px 150px;animation:spinRing 14s linear infinite;}
        @keyframes spinRing{to{transform:rotate(360deg);}}
        .vessel{fill:none;stroke:#7a3b3b;opacity:.22;stroke-width:1;}
        .pupil-highlight{fill:#fff;opacity:.15;}
        #sweep{position:absolute;left:0;top:-10%;width:100%;height:14%;background:linear-gradient(180deg, transparent, rgba(34,211,238,.35), transparent);clip-path:ellipse(46% 46% at 50% 50%);display:none;pointer-events:none;z-index:5;}
        #sweep.active{display:block;animation:sweepMove 1.4s linear infinite;}
        @keyframes sweepMove{from{top:-10%;}to{top:100%;}}
        .lid{position:absolute;left:-10%;width:120%;height:52%;background:#0a0b0d;z-index:8;pointer-events:none;}
        .lid-top{top:-2%;transform-origin:top center;clip-path:ellipse(60% 100% at 50% 0%);border-bottom:1px solid #22262b;transform:scaleY(0);}
        .lid-bottom{bottom:-2%;transform-origin:bottom center;clip-path:ellipse(60% 100% at 50% 100%);border-top:1px solid #22262b;transform:scaleY(0);}
        .lid.blink-top{animation:blinkTop .38s cubic-bezier(.6,0,.4,1);}
        .lid.blink-bottom{animation:blinkBottom .38s cubic-bezier(.6,0,.4,1);}
        @keyframes blinkTop{0%{transform:scaleY(0);}45%{transform:scaleY(1);}100%{transform:scaleY(0);}}
        @keyframes blinkBottom{0%{transform:scaleY(0);}45%{transform:scaleY(1);}100%{transform:scaleY(0);}}
        svg#connector{position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:7;overflow:visible;}
        svg#connector line{stroke:#22d3ee;stroke-width:1;opacity:0;transition:opacity .25s;}
        svg#connector line.active{opacity:.85;}
        svg#connector circle.endpoint{fill:#22d3ee;opacity:0;transition:opacity .25s;}
        svg#connector circle.endpoint.active{opacity:1;}
        @media(max-width:900px){#eyeStageInner{width:360px;height:210px;}}
      `}</style>

      <div className="hero-bg-grid" />
      <div className="hero-label">Live Ocular Field</div>

      <div id="eyeStageInner" ref={stageRef}>
        <svg id="eyeSvg" viewBox="0 0 520 300" aria-label="Eye globe with iris and findings">
          <defs>
            <radialGradient id="scleraGrad" cx="50%" cy="45%" r="70%">
              <stop offset="0%" stopColor="#dfe4e8" />
              <stop offset="55%" stopColor="#b9c2c9" />
              <stop offset="100%" stopColor="#7c868d" />
            </radialGradient>
            <radialGradient id="irisGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#67e8f5" />
              <stop offset="60%" stopColor="#0e7490" />
              <stop offset="100%" stopColor="#083344" />
            </radialGradient>
            <clipPath id="eyeClip">
              <path d="M20,150 Q260,15 500,150 Q260,285 20,150 Z" />
            </clipPath>
          </defs>

          <g clipPath="url(#eyeClip)">
            <rect x="0" y="0" width="520" height="300" fill="url(#scleraGrad)" />
            <path className="vessel" d="M40,150 Q120,120 190,145" />
            <path className="vessel" d="M35,170 Q110,190 185,165" />
            <path className="vessel" d="M480,140 Q400,110 335,140" />
            <path className="vessel" d="M485,165 Q410,185 335,160" />

            <g id="irisGroup" ref={irisGroupRef}>
              <circle cx="260" cy="150" r="95" fill="url(#irisGrad)" />
              <g>
                {striations.map((s, i) => (
                  <line
                    key={i}
                    x1={s.x1}
                    y1={s.y1}
                    x2={s.x2}
                    y2={s.y2}
                    className="striation"
                    strokeWidth={s.w}
                  />
                ))}
              </g>
              <circle cx="260" cy="150" r="95" fill="none" stroke="#22d3ee" strokeWidth="1.5" opacity={0.5} />
              <circle className="scan-ring" cx="260" cy="150" r="106" />

              <circle ref={pupilCircleRef} cx="260" cy="150" r="27" fill="#050607" />
              <circle id="pupilGlow" cx="260" cy="150" r="29" fill="none" stroke="#22d3ee" strokeWidth="1" opacity={0.4} />
              <ellipse className="pupil-highlight" cx="251" cy="140" rx="7" ry="5" />

              <g>
                {markers.map((m, i) => (
                  <g key={i}>
                    <circle
                      cx={m.x}
                      cy={m.y}
                      r={6}
                      className="marker-ring pulse"
                      style={{ animationDelay: `${i * 0.5}s` } as React.CSSProperties}
                    />
                    <circle
                      ref={(el) => {
                        markerRefs.current[i] = el;
                      }}
                      cx={m.x}
                      cy={m.y}
                      r={4}
                      className="marker-dot"
                      id={`marker-${i}`}
                    />
                  </g>
                ))}
              </g>
            </g>
          </g>
        </svg>

        <div id="sweep" className={isScanning ? "active" : ""} />
        <div className={`lid lid-top ${isBlinking ? "blink-top" : ""}`} />
        <div className={`lid lid-bottom ${isBlinking ? "blink-bottom" : ""}`} />
        <svg id="connector">
          <line ref={lineRef} id="connLine" />
          <circle ref={dotRef} id="connDot" className="endpoint" r={3} />
        </svg>
      </div>

      <div className="hero-caption">
        Live iris/fundus field model. <b>Hover a finding</b> — the eye turns toward it and traces a line to its coordinate.
      </div>
    </div>
  );
}
