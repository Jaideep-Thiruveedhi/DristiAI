"use client";

import { useState } from "react";
import EyeStage from "@/components/EyeStage";

const findings = [
  { label: "Microaneurysm cluster", zone: "Superior temporal", angle: -40, r: 68 },
  { label: "Dot hemorrhage", zone: "Inferior nasal", angle: 150, r: 60 },
  { label: "Hard exudate patch", zone: "Macular border", angle: 55, r: 72 },
  { label: "Vessel tortuosity", zone: "Peripheral inferior", angle: 220, r: 64 },
];

export default function EyeDemoPage() {
  const [scanState, setScanState] = useState<"idle" | "processing" | "revealed" | "complete">("idle");
  const [activeIdx, setActiveIdx] = useState<number | null>(null);
  const [log, setLog] = useState<string>("Awaiting scan start...");

  const handleScan = () => {
    setScanState("processing");
    setLog("");
    const lines = [
      "Initializing DrishtiAI vision pipeline...",
      "Validating image quality...",
      "Extracting vascular network...",
      "Isolating macula and optic disc...",
      "Scanning for microaneurysms and hemorrhages...",
      "Running Grad-CAM attention analysis...",
      "Computing severity grade (0-4)...",
      "Analysis complete.",
    ];
    let i = 0;
    const next = () => {
      if (i < lines.length) {
        setLog((prev) => prev + (prev ? "\n" : "") + "> " + lines[i]);
        i++;
        setTimeout(next, 280 + Math.random() * 180);
      } else {
        setScanState("complete");
      }
    };
    next();
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0a0b0d", color: "#f2f4f6", fontFamily: "'JetBrains Mono', monospace" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&display=swap');`}</style>
      <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", height: "100vh" }}>
        <EyeStage scanState={scanState} findings={findings} activeIdx={activeIdx} onHoverIdx={setActiveIdx} />

        <div style={{ padding: 28, display: "flex", flexDirection: "column", gap: 16, overflowY: "auto", borderLeft: "1px solid #22262b" }}>
          <div style={{ background: "rgba(255,255,255,.03)", border: "1px solid #22262b", padding: "16px 18px" }}>
            <h3 style={{ fontSize: 10, letterSpacing: ".15em", color: "#3a3f46", textTransform: "uppercase", marginBottom: 12, display: "flex", justifyContent: "space-between" }}>
              Patient // Session <span style={{ color: "#22d3ee" }}>P-000001</span>
            </h3>
            <div style={{ fontSize: 12, color: "#3a3f46" }}>A. SHARMA · 54Y · F · OD</div>
          </div>

          <div style={{ background: "rgba(255,255,255,.03)", border: "1px solid #22262b", padding: "16px 18px" }}>
            <h3 style={{ fontSize: 10, letterSpacing: ".15em", color: "#3a3f46", textTransform: "uppercase", marginBottom: 12, display: "flex", justifyContent: "space-between" }}>
              XAI Findings <span style={{ color: "#22d3ee" }}>{findings.length} detected</span>
            </h3>
            {findings.map((f, i) => (
              <div
                key={i}
                onMouseEnter={() => setActiveIdx(i)}
                onMouseLeave={() => setActiveIdx(null)}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "10px 8px",
                  border: `1px solid ${activeIdx === i ? "rgba(34,211,238,.35)" : "transparent"}`,
                  background: activeIdx === i ? "rgba(34,211,238,.06)" : "transparent",
                  cursor: "pointer",
                  fontSize: 12,
                  marginBottom: 2,
                  color: "#f2f4f6",
                }}
              >
                <span>
                  {f.label}
                  <br />
                  <span style={{ color: "#3a3f46", fontSize: 10 }}>{f.zone}</span>
                </span>
                <span style={{ fontSize: 10, color: "#22d3ee", border: "1px solid #0e7490", padding: "2px 6px" }}>F{i + 1}</span>
              </div>
            ))}
          </div>

          <div style={{ background: "rgba(255,255,255,.03)", border: "1px solid #22262b", padding: "16px 18px" }}>
            <h3 style={{ fontSize: 10, letterSpacing: ".15em", color: "#3a3f46", textTransform: "uppercase", marginBottom: 12 }}>Analysis Log</h3>
            <div style={{ fontSize: 11, lineHeight: "1.9", color: "#3a3f46", whiteSpace: "pre-wrap", minHeight: 20 }}>{log}</div>
          </div>

          <button
            onClick={handleScan}
            disabled={scanState === "processing"}
            style={{
              width: "100%",
              padding: 14,
              background: "transparent",
              border: "1px solid #22d3ee",
              color: "#22d3ee",
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 12,
              letterSpacing: ".1em",
              textTransform: "uppercase",
              cursor: scanState === "processing" ? "default" : "pointer",
              opacity: scanState === "processing" ? 0.35 : 1,
            }}
          >
            {scanState === "processing" ? "Scanning..." : "Start Scan"}
          </button>

          {scanState === "complete" && (
            <div style={{ background: "rgba(255,255,255,.03)", border: "1px solid rgba(34,211,238,.5)", padding: "16px 18px" }}>
              <h3 style={{ fontSize: 10, letterSpacing: ".15em", color: "#3a3f46", textTransform: "uppercase", marginBottom: 12 }}>Result</h3>
              <div style={{ fontSize: 32, fontWeight: 700, color: "#22d3ee" }}>85.2%</div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, padding: "6px 0", borderBottom: "1px solid #22262b" }}>
                <span>DR GRADE</span>
                <span style={{ color: "#f2f4f6", fontWeight: 600 }}>2 / 4</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, padding: "6px 0", borderBottom: "1px solid #22262b" }}>
                <span>STATUS</span>
                <span style={{ color: "#f2f4f6", fontWeight: 600 }}>MODERATE NPDR</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, padding: "6px 0", borderBottom: "1px solid #22262b" }}>
                <span>REFERABLE</span>
                <span style={{ color: "#22d3ee", fontWeight: 600 }}>YES</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, padding: "6px 0" }}>
                <span>MODEL</span>
                <span style={{ color: "#3a3f46", fontWeight: 400 }}>drishtiai-v1.2.0-mock</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
