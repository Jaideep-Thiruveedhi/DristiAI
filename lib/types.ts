export type ScanState = "idle" | "processing" | "revealed" | "complete";

export type UserRole = "admin" | "doctor" | "health_worker";

export interface PatientRecord {
  id: string; // "P-000001" style
  name: string;
  age: number;
  sex: "M" | "F" | "Other";
  eye: "OD" | "OS";
  lastScanDate?: string;
  phone?: string;
  village?: string;
}

export interface AnalysisLogLine {
  id: string;
  text: string;
}

export interface XAIFinding {
  id: string;
  label: string;
  position: { x: number; y: number; z: number }; // point on/near wireframe mesh
  detail?: string;
}

export interface ScanResult {
  severity: 0 | 1 | 2 | 3 | 4;
  severityLabel: string; // "No DR" | "Mild" | "Moderate" | "Severe" | "Proliferative DR"
  confidence: number; // 0-1 fraction, format ×100 at render (mirrors real API 0.9134)
  referable: boolean; // derived: severity >= 2
  modelVersion: string;
  explanation: string;
  heatmapAvailable: boolean;
  // display helpers
  status: string; // e.g. "MODERATE NON-PROLIFERATIVE DR"
  findings?: XAIFinding[];
}

export interface ScreeningRecord {
  id: string; // "SCR-000001"
  patientId: string;
  createdAt: string; // ISO date
  eye: "OD" | "OS";
  result: ScanResult;
  imageQuality: "Good" | "Adequate" | "Poor";
}
