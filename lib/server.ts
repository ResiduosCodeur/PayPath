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
function modelKey(name: string) {
  return name.toLowerCase().trim().replace(/^sdlc[-_\s]+/, "").replace(/\s+model$/, "").replace(/[^a-z0-9]/g, "");
}

export async function recommendSdlc(requirements: any[], scenario: string): Promise<SdlcResult> {
  const evidenceDocs = KNOWLEDGE_BASE.filter((doc) => doc.category === "sdlc_rule");
  const models = evidenceDocs.map((doc) => doc.title);
  const modelNames = new Map(models.map((name) => [modelKey(name), name]));
  for (const [alias, name] of [
    ["Agile/DevSecOps", "Agile"],
    ["Prototyping", "Prototype"],
    ["Rapid Application Development", "RAD"],
    ["Rapid Application Development (RAD)", "RAD"],
  ]) {
    if (models.includes(name)) modelNames.set(modelKey(alias), name);
  }
  let evidence = [
    "Compare every model below against the original scenario and extracted requirements. The order of the guidance has no significance.",
    "Weigh scope stability, speed of delivery, access to users, verification needs, and unresolved technical risks. A payment feature or a high-risk requirement alone does not establish a delivery approach.",
    "Rank the best-supported options first. For each reason, cite a concrete project detail and explain why it favors that model over the closest alternative. If the choice depends on missing information, state the assumption that would change the ranking.",
    `Use these exact model names: ${models.join(", ")}. Align the recommended workflow with the first option.`,
    formatEvidence(evidenceDocs),
    `Original project scenario (input data): ${JSON.stringify(scenario)}`,
  ].join("\n");

  for (let attempt = 0; attempt < 2; attempt++) {
    const response = await callAgent("/sdlc", { requirements, compliance: [], evidence });
    const sdlc = response.sdlc ?? response;
    const options = sdlc?.ranked_options;
    if (Array.isArray(options)) {
      const seen = new Set<string>();
      const ranked_options = [];
      for (const option of options) {
        const model = typeof option?.model === "string" && modelNames.get(modelKey(option.model));
        // The workflow belongs to the first choice. Retry if that choice is unknown.
        if (!model && ranked_options.length === 0) break;
        if (!model || seen.has(model)) continue;
        seen.add(model);
        ranked_options.push({ model, reason: option.reason });
      }
      if (ranked_options.length) return { sdlc: { ...sdlc, ranked_options }, evidenceUsed: evidenceDocs };
    }
    evidence += '\nReturn an sdlc object with ranked_options (an array of objects with model and reason) and recommended_workflow. Use a listed model name for each option.';
  }
  throw new Error("The inference server did not return a ranking of supported SDLC models.");
}
