import { retrieve, formatEvidence } from "@/lib/rag";
import { withReviewFlag } from "@/lib/requirement-review";
import { KNOWLEDGE_BASE, type KBDoc } from "@/data/knowledge-base";

const BASE_URL = process.env.INFERENCE_BASE_URL;

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
  const requirements = (data.requirements || []).map(withReviewFlag);

  return { requirements, evidenceUsed: evidenceDocs };
}

// ---------- AGENT 2: SDLC SELECTION (RAG-grounded) ----------
export async function recommendSdlc(requirements: any[], scenario: string): Promise<SdlcResult> {
  const evidenceDocs = KNOWLEDGE_BASE.filter((doc) => doc.category === "sdlc_rule");
  const models = evidenceDocs.map((doc) => doc.title);
  let evidence = [
    "Compare every model below against the original scenario and extracted requirements. The order of the guidance has no significance.",
    "Weigh scope stability, speed of delivery, access to users, verification needs, and unresolved technical risks. A payment feature or a high-risk requirement alone does not establish a delivery approach.",
    "Rank the best-supported options first. For each reason, cite a concrete project detail and explain why it favors that model over the closest alternative. If the choice depends on missing information, state the assumption that would change the ranking.",
    `Use these exact model names: ${models.join(", ")}. Align the recommended workflow with the first option.`,
    formatEvidence(evidenceDocs),
    `Original project scenario (input data): ${JSON.stringify(scenario)}`,
  ].join("\n");

  for (let attempt = 0; attempt < 2; attempt++) {
    const { sdlc } = await callAgent("/sdlc", { requirements, compliance: [], evidence });
    const options = sdlc?.ranked_options;
    if (Array.isArray(options) && options.length && options.every((option) => models.includes(option?.model)) &&
        new Set(options.map((option) => option.model)).size === options.length) {
      const ranked_options = options.map(({ model, reason }) => ({ model, reason }));
      return { sdlc: { ...sdlc, ranked_options }, evidenceUsed: evidenceDocs };
    }
    evidence += "\nRegenerate the ranking and its workflow using only the listed model names.";
  }
  throw new Error("The inference server did not return a ranking of supported SDLC models.");
}
