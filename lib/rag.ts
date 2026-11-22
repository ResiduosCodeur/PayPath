import { KNOWLEDGE_BASE, KBDoc } from "@/data/knowledge-base";

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 2);
}

const K1 = 1.5;
const B = 0.75;

type Indexed = { doc: KBDoc; tokens: string[]; length: number };

function buildIndex(docs: KBDoc[]): Indexed[] {
  return docs.map((doc) => {
    const tokens = tokenize(`${doc.title} ${doc.text}`);
    return { doc, tokens, length: tokens.length };
  });
}

function bm25Score(queryTokens: string[], indexed: Indexed[], avgLen: number): Map<string, number> {
  const N = indexed.length;
  const scores = new Map<string, number>();

  for (const term of queryTokens) {
    const containingDocs = indexed.filter((d) => d.tokens.includes(term));
    if (containingDocs.length === 0) continue;
    const idf = Math.log((N - containingDocs.length + 0.5) / (containingDocs.length + 0.5) + 1);

    for (const d of indexed) {
      const tf = d.tokens.filter((t) => t === term).length;
      if (tf === 0) continue;
      const denom = tf + K1 * (1 - B + (B * d.length) / avgLen);
      const score = idf * ((tf * (K1 + 1)) / denom);
      scores.set(d.doc.id, (scores.get(d.doc.id) || 0) + score);
    }
  }
  return scores;
}

// Retrieve top-k knowledge base entries relevant to a query, optionally filtered by category.
export function retrieve(query: string, topK = 3, category?: KBDoc["category"]): KBDoc[] {
  const pool = category ? KNOWLEDGE_BASE.filter((d) => d.category === category) : KNOWLEDGE_BASE;
  const indexed = buildIndex(pool);
  if (indexed.length === 0) return [];
  const avgLen = indexed.reduce((sum, d) => sum + d.length, 0) / indexed.length;
  const queryTokens = tokenize(query);
  const scores = bm25Score(queryTokens, indexed, avgLen);

  return [...scores.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, topK)
    .filter(([, score]) => score > 0)
    .map(([id]) => pool.find((d) => d.id === id)!);
}

// Format retrieved docs as an evidence block to inject into a prompt.
export function formatEvidence(docs: KBDoc[]): string {
  if (docs.length === 0) return "";
  return docs.map((d) => `[${d.id}] ${d.title}: ${d.text}`).join("\n");
}
