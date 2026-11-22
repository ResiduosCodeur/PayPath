"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Tag from "@/components/Tag";

export default function ScenarioPage() {
  const [mode, setMode] = useState<"text" | "file">("text");
  const [scenario, setScenario] = useState("");

  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [documentId, setDocumentId] = useState<string | null>(null);
  const [preview, setPreview] = useState("");
  const [chunkCount, setChunkCount] = useState(0);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleFileSelect(f: File) {
    setFile(f);
    setDocumentId(null);
    setUploading(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("file", f);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setDocumentId(data.documentId);
      setPreview(data.preview);
      setChunkCount(data.chunkCount);
    } catch (e: any) {
      setError(e.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function submit() {
    setLoading(true);
    setError("");
    try {
      const body = mode === "file" ? { documentId } : { scenario };
      const res = await fetch("/api/pipeline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      router.push(`/session/${data.id}`);
    } catch (e: any) {
      setError(e.message || "Something went wrong — try again.");
      setLoading(false);
    }
  }

  const canSubmit = mode === "text" ? !!scenario.trim() : !!documentId;

  if (loading) {
    return (
      <div className="bg-panel border border-border rounded-[10px] p-7">
        <Tag>Requirements agent</Tag>
        <div className="flex items-center gap-3 py-6">
          <span className="w-4 h-4 border-2 border-border border-t-accent rounded-full animate-spin" />
          <p className="text-base text-muted">Running extraction, then SDLC recommendation…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-panel border border-border rounded-[10px] p-7">
      <Tag>Requirements agent</Tag>
      <h2 className="font-display font-bold text-xl mb-4">Describe the scenario</h2>

      <div className="flex gap-2 mb-5">
        <button
          onClick={() => setMode("text")}
          className={`text-sm px-4 py-2 rounded-[8px] border transition-colors ${
            mode === "text" ? "border-accent text-accent bg-accent/10" : "border-border text-muted"
          }`}
        >
          Write scenario
        </button>
        <button
          onClick={() => setMode("file")}
          className={`text-sm px-4 py-2 rounded-[8px] border transition-colors ${
            mode === "file" ? "border-accent text-accent bg-accent/10" : "border-border text-muted"
          }`}
        >
          Upload document
        </button>
      </div>

      {mode === "text" ? (
        <>
          <p className="text-sm text-muted mb-4 max-w-[60ch]">
            Write out the functionality or module you need. The agent extracts structured
            requirements, then recommends an SDLC approach.
          </p>
          <textarea
            className="w-full h-48 bg-panel2 border border-border rounded-[8px] px-4 py-3 text-base placeholder:text-muted focus:outline-none focus:border-accent transition-colors"
            placeholder="e.g. We need a payment gateway for e-commerce merchants that processes card payments, supports refunds under $50 for staff without approval, and needs to comply with PCI-DSS by routing card data through Stripe..."
            value={scenario}
            onChange={(e) => setScenario(e.target.value)}
          />
        </>
      ) : (
        <>
          <p className="text-sm text-muted mb-4 max-w-[60ch]">
            Upload a policy document, existing requirements doc, or project brief (.pdf, .docx, or
            .txt). It'll be split into chunks, embedded, and the most relevant sections retrieved
            for analysis.
          </p>
          <label className="block border border-dashed border-border rounded-[8px] p-8 text-center cursor-pointer hover:border-accent transition-colors">
            <input
              type="file"
              accept=".pdf,.docx,.txt"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
            />
            {file ? (
              <span className="text-base">{file.name}</span>
            ) : (
              <span className="text-base text-muted">Click to choose a .pdf, .docx, or .txt file</span>
            )}
          </label>

          {uploading && (
            <div className="flex items-center gap-3 mt-4">
              <span className="w-4 h-4 border-2 border-border border-t-accent rounded-full animate-spin" />
              <p className="text-sm text-muted">Extracting text and generating embeddings…</p>
            </div>
          )}

          {documentId && !uploading && (
            <div className="mt-4 bg-panel2 border border-border rounded-[8px] p-4">
              <p className="text-sm text-good mb-2">
                Indexed {chunkCount} chunk{chunkCount === 1 ? "" : "s"} — ready to analyze
              </p>
              <p className="text-sm text-muted italic">"{preview}…"</p>
            </div>
          )}
        </>
      )}

      {error && <p className="text-danger text-sm mt-3">{error}</p>}

      <button
        className="mt-5 bg-accent hover:bg-accent-dark disabled:opacity-40 disabled:hover:bg-accent transition-colors text-bg font-medium text-sm px-5 py-2.5 rounded-[8px]"
        disabled={!canSubmit}
        onClick={submit}
      >
        Generate requirements &amp; recommendation
      </button>
    </div>
  );
}
