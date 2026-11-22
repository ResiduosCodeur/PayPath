// Splits document text into overlapping chunks for embedding.
// Overlap helps avoid losing context that falls right on a chunk boundary.
export function chunkText(text: string, chunkSize = 800, overlap = 120): string[] {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= chunkSize) return [clean];

  const chunks: string[] = [];
  let start = 0;
  while (start < clean.length) {
    const end = Math.min(start + chunkSize, clean.length);
    chunks.push(clean.slice(start, end));
    if (end === clean.length) break;
    start = end - overlap;
  }
  return chunks;
}
