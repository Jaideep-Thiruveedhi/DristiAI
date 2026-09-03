import type {
  PatientRecord,
  AnalysisLogLine,
  ScanResult,
  ScreeningRecord,
  XAIFinding,
} from "./types";

// ---------------------------------------------------------------------------
// Patients — P-000001 style
// ---------------------------------------------------------------------------
export const mockPatients: PatientRecord[] = [
  {
    id: "P-000001",
    name: "A. Sharma",
    age: 54,
    sex: "F",
    eye: "OD",
    lastScanDate: "2026-09-02",
    phone: "+91 98XXX X2105",
    village: "Dharwad, KA",
  },
  {
    id: "P-000002",
    name: "R. Patil",
    age: 61,
    sex: "M",
    eye: "OS",
    lastScanDate: "2026-08-28",
    phone: "+91 98XXX X1180",
    village: "Hubballi, KA",
  },
  {
    id: "P-000003",
    name: "S. Kulkarni",
    age: 47,
    sex: "F",
    eye: "OD",
    lastScanDate: "2026-08-19",
    village: "Gadag, KA",
  },
  {
    id: "P-000004",
    name: "M. Desai",
    age: 52,
    sex: "M",
    eye: "OD",
    lastScanDate: "2026-07-30",
    village: "Belagavi, KA",
  },
  {
    id: "P-000005",
    name: "L. Fernandez",
    age: 39,
    sex: "F",
    eye: "OS",
    village: "Mangaluru, KA",
  },
  {
    id: "P-000006",
    name: "K. Rao",
    age: 66,
    sex: "M",
    eye: "OD",
    lastScanDate: "2026-09-01",
    village: "Mysuru, KA",
  },
];

// Back-compat single patient (used by legacy imports)
export const mockPatient: PatientRecord = mockPatients[0];

// ---------------------------------------------------------------------------
// Log lines — real pipeline language
// ---------------------------------------------------------------------------
export const mockLogLines: AnalysisLogLine[] = [
  { id: "log-1", text: "Initializing DrishtiAI vision pipeline..." },
  { id: "log-2", text: "Validating image quality..." },
  { id: "log-3", text: "Extracting vascular network..." },
  { id: "log-4", text: "Isolating macula and optic disc..." },
  { id: "log-5", text: "Scanning for microaneurysms and hemorrhages..." },
  { id: "log-6", text: "Running Grad-CAM attention analysis..." },
  { id: "log-7", text: "Computing severity grade (0–4)..." },
  { id: "log-8", text: "Calculating referable status..." },
  { id: "log-9", text: "Analysis complete." },
];

// ---------------------------------------------------------------------------
// XAI Findings — mock 3D coordinates on/near the wireframe retina mesh
// Radius ~1.8 for retina sphere; positions lie on/near surface
// ---------------------------------------------------------------------------
export const mockFindings: XAIFinding[] = [
  {
    id: "f-1",
    label: "Microaneurysm cluster — superior temporal quadrant",
    position: { x: 0.85, y: 1.1, z: 0.72 },
    detail: "3–4 punctate lesions, high Grad-CAM activation",
  },
  {
    id: "f-2",
    label: "Intraretinal hemorrhage — inferior nasal quadrant",
    position: { x: -0.92, y: -0.88, z: 0.95 },
    detail: " flame-shaped bleed, moderate attention",
  },
  {
    id: "f-3",
    label: "Hard exudates — macular edge",
    position: { x: 1.28, y: 0.12, z: 0.45 },
    detail: "yellow-white deposits, circinate pattern",
  },
  {
    id: "f-4",
    label: "Venous beading — sup. arcade",
    position: { x: 0.35, y: 1.35, z: -0.22 },
    detail: "focal venous dilation, early severe marker",
  },
  {
    id: "f-5",
    label: "Optic disc margin — peripapillary attention",
    position: { x: -0.15, y: 0.22, z: 1.58 },
    detail: "low-moderate activation near disc rim",
  },
  {
    id: "f-6",
    label: "Dot-blot hemorrhage — mid-periphery",
    position: { x: -1.12, y: 0.55, z: -0.68 },
    detail: "isolated blot, referable threshold proximity",
  },
];

// ---------------------------------------------------------------------------
// 5-grade mock results — one per severity, deterministic demo picks grade 2
// ---------------------------------------------------------------------------
function mkResult(
  severity: 0 | 1 | 2 | 3 | 4,
  label: string,
  status: string,
  confidence: number,
  explanation: string,
): ScanResult {
  return {
    severity,
    severityLabel: label,
    confidence, // 0-1
    referable: severity >= 2,
    modelVersion: "DristiAI-v1.2.0-mock",
    explanation,
    heatmapAvailable: true,
    status,
    findings: mockFindings,
  };
}

export const mockResultsByGrade: Record<0 | 1 | 2 | 3 | 4, ScanResult> = {
  0: mkResult(
    0,
    "No DR",
    "NO DIABETIC RETINOPATHY",
    0.941,
    "No microaneurysms, hemorrhages, or exudates detected. Retina appears normal. Routine annual screening recommended.",
  ),
  1: mkResult(
    1,
    "Mild",
    "MILD NON-PROLIFERATIVE DR",
    0.812,
    "Few microaneurysms detected. No referable disease at this stage. Recommend repeat screening in 9–12 months.",
  ),
  2: mkResult(
    2,
    "Moderate",
    "MODERATE NON-PROLIFERATIVE DR",
    0.852,
    "Multiple microaneurysms and scattered intraretinal hemorrhages detected. Consistent with moderate non-proliferative diabetic retinopathy. Recommend referral to ophthalmology within 4 weeks.",
  ),
  3: mkResult(
    3,
    "Severe",
    "SEVERE NON-PROLIFERATIVE DR",
    0.887,
    "Extensive intraretinal hemorrhages in four quadrants with venous beading. High risk of progression. Urgent referral within 1–2 weeks advised.",
  ),
  4: mkResult(
    4,
    "Proliferative DR",
    "PROLIFERATIVE DIABETIC RETINOPATHY",
    0.923,
    "Neovascularization and/or preretinal hemorrhage detected. Proliferative disease — immediate referral to retina specialist required.",
  ),
};

// Default deterministic demo result (matches original "Moderate / 85.2%" spec)
export const mockResult: ScanResult = mockResultsByGrade[2];

// ---------------------------------------------------------------------------
// Screenings — mock persisted screenings per patient
// ---------------------------------------------------------------------------
export const mockScreenings: ScreeningRecord[] = [
  {
    id: "SCR-000014",
    patientId: "P-000001",
    createdAt: "2026-09-02T10:32:00.000Z",
    eye: "OD",
    result: mockResultsByGrade[2],
    imageQuality: "Good",
  },
  {
    id: "SCR-000011",
    patientId: "P-000001",
    createdAt: "2026-03-14T09:10:00.000Z",
    eye: "OS",
    result: mockResultsByGrade[1],
    imageQuality: "Good",
  },
  {
    id: "SCR-000013",
    patientId: "P-000002",
    createdAt: "2026-08-28T15:04:00.000Z",
    eye: "OS",
    result: mockResultsByGrade[0],
    imageQuality: "Good",
  },
  {
    id: "SCR-000012",
    patientId: "P-000003",
    createdAt: "2026-08-19T11:22:00.000Z",
    eye: "OD",
    result: mockResultsByGrade[3],
    imageQuality: "Adequate",
  },
  {
    id: "SCR-000010",
    patientId: "P-000004",
    createdAt: "2026-07-30T08:45:00.000Z",
    eye: "OD",
    result: mockResultsByGrade[4],
    imageQuality: "Good",
  },
  {
    id: "SCR-000009",
    patientId: "P-000006",
    createdAt: "2026-09-01T16:20:00.000Z",
    eye: "OD",
    result: mockResultsByGrade[1],
    imageQuality: "Good",
  },
];

export const SCAN_DURATION_MS = 3000;
export const REVEAL_TO_COMPLETE_DELAY_MS = 800;
export const IMAGE_QUALITY_CHECK_MS = 900;
