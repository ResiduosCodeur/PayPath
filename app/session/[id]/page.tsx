"use client";
import { REVIEW_THRESHOLD } from "@/lib/requirement-review";
import { useEffect, useState } from "react";
import Link from "next/link";
import Tag from "@/components/Tag";

type KBDoc = { id: string; title: string; category: string; text: string };
type Session = {
  id: string;
  title: string;
  createdAt: number;
  scenario: string;
  requirements: any[];
  sdlc: any;
  reqEvidence: KBDoc[];
  sdlcEvidence: KBDoc[];
};

function riskClasses(risk: string) {
  const r = (risk || "").toLowerCase();
  if (r === "high") return "text-danger border-danger/40 bg-danger/10";
  if (r === "medium" || r === "med") return "text-warn border-warn/40 bg-warn/10";
  return "text-good border-good/40 bg-good/10";
}
function priorityClasses(priority: string) {
  const p = (priority || "").toLowerCase();
  if (p === "must-have") return "text-accent border-accent/40 bg-accent/10";
  if (p === "should-have") return "text-warn border-warn/40 bg-warn/10";
  return "text-muted border-border bg-panel2";
}
function idClasses(id: string) {
  const prefix = (id || "").match(/^[A-Z]+/)?.[0] || "";
  if (prefix === "FR") return "text-accent border-accent/40 bg-accent/10";
  if (prefix === "SEC") return "text-danger border-danger/40 bg-danger/10";
  if (prefix === "COMP") return "text-warn border-warn/40 bg-warn/10";
  if (prefix === "NFR") return "text-good border-good/40 bg-good/10";
  return "text-muted border-border bg-panel2";
}

function EvidenceRow({ docs }: { docs: KBDoc[] }) {
  if (!docs || docs.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-2 mt-3">
      <span className="text-sm text-muted">Grounded in:</span>
      {docs.map((d) => (
        <span
          key={d.id}
          title={d.text}
          className="text-sm bg-panel2 border border-border px-2.5 py-1 rounded-[5px] cursor-help"
        >
          {d.title}
        </span>
      ))}
    </div>
  );
}

export default function SessionPage({ params }: { params: { id: string } }) {
  const [session, setSession] = useState<Session | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/sessions/${params.id}`)
      .then((r) => r.json())
      .then((d) => (d.error ? setError(d.error) : setSession(d)));
  }, [params.id]);

  if (error) return <p className="text-danger text-base">{error}</p>;
  if (!session) return <p className="text-base text-muted">Loading…</p>;

  const { requirements, sdlc, reqEvidence, sdlcEvidence } = session;
  const reviewCount = requirements.filter((r) => r.needsReview).length;
  const hasValidSdlc = Array.isArray(sdlc?.ranked_options) && sdlc.ranked_options.length > 0;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <Tag>Results</Tag>
        <div className="flex gap-3">
          <a href="/" className="border border-border hover:border-accent transition-colors text-base px-5 py-2.5 rounded-[8px]">
            Dashboard
          </a>
          <Link href="/scenario" className="bg-accent hover:bg-accent-dark transition-colors text-bg font-medium text-base px-5 py-2.5 rounded-[8px]">
            New analysis
          </Link>
        </div>
      </div>

      <div className="bg-panel border border-border rounded-[10px] p-7">
        <h3 className="text-sm text-muted mb-2">Scenario</h3>
        <p className="text-base leading-relaxed whitespace-pre-wrap max-w-[70ch]">{session.scenario}</p>
      </div>

      <div className="w-full lg:w-[min(76rem,calc(100vw_-_4rem))] self-center bg-panel border border-border rounded-[10px] p-4 sm:p-7 overflow-x-auto">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
          <h3 className="font-display font-bold text-lg">
            Requirements <span className="text-muted font-sans font-normal text-base">({requirements.length})</span>
          </h3>
          {reviewCount > 0 && (
            <span className="whitespace-nowrap text-sm text-warn border border-warn/40 bg-warn/10 px-2.5 py-1 rounded-[5px]">
              {reviewCount} flagged for human review
            </span>
          )}
        </div>
        <p className="text-sm text-muted mb-4">Requirements with confidence below {REVIEW_THRESHOLD}% are flagged for human review.</p>
        <table className="w-full text-base">
          <thead>
            <tr className="text-sm text-muted">
              <th className="text-left border-b border-border py-3 pr-4 font-normal">ID</th>
              <th className="text-left border-b border-border py-3 pr-4 font-normal">Statement</th>
              <th className="text-left border-b border-border py-3 pr-4 font-normal">Category</th>
              <th className="text-left border-b border-border py-3 pr-4 font-normal">Priority</th>
              <th className="text-left border-b border-border py-3 pr-4 font-normal">Risk</th>
              <th className="text-left border-b border-border py-3 pr-4 font-normal">Confidence</th>
            </tr>
          </thead>
          <tbody className="[&_span]:inline-block [&_span]:whitespace-nowrap">
            {requirements.map((r) => (
              <tr key={r.id} className={r.needsReview ? "bg-warn/5" : ""}>
                <td className="border-b border-border py-4 pr-4">
                  <span className={`text-sm font-mono border px-2.5 py-1 rounded-[5px] ${idClasses(r.id)}`}>{r.id}</span>
                </td>
                <td className="min-w-[12rem] [overflow-wrap:anywhere] border-b border-border py-4 pr-4">
                  {r.statement}
                  {r.needsReview && <span className="ml-2 text-sm text-warn">⚠ review</span>}
                </td>
                <td className="border-b border-border py-4 pr-4">
                  <span className="text-sm bg-panel2 border border-border px-2.5 py-1 rounded-[5px]">{r.category}</span>
                </td>
                <td className="border-b border-border py-4 pr-4">
                  <span className={`text-sm border px-2.5 py-1 rounded-[5px] ${priorityClasses(r.priority)}`}>{r.priority}</span>
                </td>
                <td className="border-b border-border py-4 pr-4">
                  <span className={`text-sm border px-2.5 py-1 rounded-[5px] ${riskClasses(r.risk)}`}>{r.risk}</span>
                </td>
                <td className="border-b border-border py-4 pr-4 text-muted">{r.confidence != null ? `${r.confidence}%` : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <EvidenceRow docs={reqEvidence} />
      </div>

      <div className="bg-panel border border-border rounded-[10px] p-7">
        <h3 className="font-display font-bold text-lg mb-5">SDLC recommendation</h3>

        {hasValidSdlc ? (
          <>
            <div className="flex flex-col gap-3">
              {sdlc.ranked_options.map((o: any, i: number) => (
                <div key={i} className={i === 0 ? "rounded-[8px] p-5 bg-accent/10 border border-accent" : "rounded-[8px] p-5 border border-border"}>
                  <div className="flex items-baseline justify-between mb-2">
                    <strong className={`text-lg ${i === 0 ? "text-accent" : ""}`}>{o.model}</strong>
                    <span className="text-sm text-muted">{i === 0 ? "First choice" : `Alternative ${i}`}</span>
                  </div>
                  <p className="text-sm text-muted">{o.reason}</p>
                </div>
              ))}
            </div>
            <EvidenceRow docs={sdlcEvidence} />

            <div className="grid sm:grid-cols-3 gap-6 mt-7 pt-7 border-t border-border">
              <div>
                <h4 className="text-sm text-muted mb-2.5">Phases</h4>
                <ul className="text-base flex flex-col gap-1.5">
                  {sdlc?.recommended_workflow?.phases?.map((p: string, i: number) => <li key={i}>{p}</li>)}
                </ul>
              </div>
              <div>
                <h4 className="text-sm text-muted mb-2.5">Key controls</h4>
                <ul className="text-base flex flex-col gap-1.5">
                  {sdlc?.recommended_workflow?.key_controls?.map((p: string, i: number) => <li key={i}>{p}</li>)}
                </ul>
              </div>
              <div>
                <h4 className="text-sm text-muted mb-2.5">Approval gates</h4>
                <ul className="text-base flex flex-col gap-1.5">
                  {sdlc?.recommended_workflow?.approval_gates?.map((p: string, i: number) => <li key={i}>{p}</li>)}
                </ul>
              </div>
            </div>
          </>
        ) : (
          <div className="border border-dashed border-border rounded-[8px] p-5">
            <p className="text-sm text-warn mb-2">
              The SDLC agent's response didn't match the expected format — showing raw output below.
            </p>
            <pre className="text-xs text-muted whitespace-pre-wrap overflow-x-auto">
              {JSON.stringify(sdlc, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
