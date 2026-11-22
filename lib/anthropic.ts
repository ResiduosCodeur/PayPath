import { retrieve, formatEvidence } from "@/lib/rag";
import { KBDoc } from "@/data/knowledge-base";

const BASE_URL = process.env.INFERENCE_BASE_URL;
const CONFIDENCE_ESCALATION_THRESHOLD = 60;

async function callAgent(path: string, body: any) {
  if (!BASE_URL) throw new Error("INFERENCE_BASE_URL is not set in .env.local");
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (data.error) throw new Error(`${path} agent error: ${data.error}`);
  return data;
}

export type ExtractionResult = {
  requirements: any[];
  evidenceUsed: KBDoc[];
};

export type SdlcResult = {
  sdlc: any;
  evidenceUsed: KBDoc[];
};

// ---------- AGENT 1: REQUIREMENTS EXTRACTION (RAG-grounded) ----------
export async function extractRequirements(scenario: string): Promise<ExtractionResult> {
  const evidenceDocs = retrieve(scenario, 3, "regulation");
  const evidence = formatEvidence(evidenceDocs);

  const data = await callAgent("/extract", { scenario, evidence });

  // Deterministic escalation: flag low-confidence requirements for human review
  // rather than trusting the model to self-report this.
  const requirements = (data.requirements || []).map((r: any) => ({
    ...r,
    needsReview: typeof r.confidence === "number" && r.confidence < CONFIDENCE_ESCALATION_THRESHOLD,
  }));

  return { requirements, evidenceUsed: evidenceDocs };
}

// ---------- AGENT 2: SDLC SELECTION (RAG-grounded) ----------
export async function recommendSdlc(requirements: any[]): Promise<SdlcResult> {
  const query = requirements.map((r) => `${r.category} ${r.risk} ${r.statement}`).join(" ");
  const evidenceDocs = retrieve(query, 3, "sdlc_rule");
  const evidence = formatEvidence(evidenceDocs);

  const data = await callAgent("/sdlc", { requirements, compliance: [], evidence });
  return { sdlc: data.sdlc, evidenceUsed: evidenceDocs };
}
