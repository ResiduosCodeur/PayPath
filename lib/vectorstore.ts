import db from "@/lib/db";
import { embed, cosineSimilarity } from "@/lib/embeddings";
import { chunkText } from "@/lib/chunk";
import { randomUUID } from "crypto";

// Fixed set of aspects we always look for in an uploaded document — covers the same
// ground a human requirements analyst would scan for, regardless of document length.
const ASPECT_QUERIES = [
  "main business objective and goal of this system",
  "security, fraud detection, and authentication requirements",
  "regulatory and compliance requirements such as PCI-DSS, AML, KYC, GDPR",
  "data retention, data residency, and privacy requirements",
  "integrations with external systems or third-party APIs",
  "performance, uptime, and availability requirements",
  "audit logging and reporting requirements",
];

export async function storeDocument(text: string): Promise<{ documentId: string; chunkCount: number }> {
  const documentId = randomUUID();
  const chunks = chunkText(text);
  const vectors = await embed(chunks);

  const insert = db.prepare(
    `INSERT INTO document_chunks (id, document_id, chunk_index, text, embedding) VALUES (?, ?, ?, ?, ?)`
  );
  const tx = db.transaction((rows: { chunk: string; vector: number[]; idx: number }[]) => {
    for (const r of rows) {
      insert.run(randomUUID(), documentId, r.idx, r.chunk, JSON.stringify(r.vector));
    }
  });
  tx(chunks.map((chunk, idx) => ({ chunk, vector: vectors[idx], idx })));

  return { documentId, chunkCount: chunks.length };
}

// Retrieves the most relevant chunks across a fixed set of requirement-analysis "aspects"
// and stitches them into one coherent scenario-style text block — this is what turns a
// long document into something the extraction agent can actually work with.
export async function synthesizeScenarioFromDocument(documentId: string): Promise<string> {
  const rows = db
    .prepare(`SELECT chunk_index, text, embedding FROM document_chunks WHERE document_id = ?`)
    .all(documentId) as { chunk_index: number; text: string; embedding: string }[];

  if (rows.length === 0) throw new Error("Document not found or has no content");

  const parsed = rows.map((r) => ({
    idx: r.chunk_index,
    text: r.text,
    vector: JSON.parse(r.embedding) as number[],
  }));

  const aspectVectors = await embed(ASPECT_QUERIES);
  const selected = new Map<number, string>();

  aspectVectors.forEach((qVec) => {
    const scored = parsed
      .map((c) => ({ ...c, score: cosineSimilarity(qVec, c.vector) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 2);
    scored.forEach((c) => selected.set(c.idx, c.text));
  });

  const ordered = [...selected.entries()].sort((a, b) => a[0] - b[0]).map(([, text]) => text);
  return ordered.join("\n\n");
}
