// Local embeddings via transformers.js — runs entirely on CPU, no GPU, no API key,
// no external service. Downloads a small (~90MB) model once on first use, then caches it.
import { pipeline, type FeatureExtractionPipeline } from "@xenova/transformers";

let embedderPromise: Promise<FeatureExtractionPipeline> | null = null;

function getEmbedder() {
  if (!embedderPromise) {
    embedderPromise = pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2") as any;
  }
  return embedderPromise;
}

export async function embed(texts: string[]): Promise<number[][]> {
  const embedder = await getEmbedder();
  const results: number[][] = [];
  for (const text of texts) {
    const output = await embedder(text, { pooling: "mean", normalize: true });
    results.push(Array.from(output.data as Float32Array));
  }
  return results;
}

export function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0;
  for (let i = 0; i < a.length; i++) dot += a[i] * b[i];
  return dot; // vectors are already normalized, so dot product == cosine similarity
}
