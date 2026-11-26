"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Tag from "@/components/Tag";

type SessionSummary = { id: string; title: string; created_at: number };

export default function Home() {
  const [sessions, setSessions] = useState<SessionSummary[] | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);

  useEffect(() => {
    fetch("/api/sessions", { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) throw new Error("Could not load analyses");
        const data = await response.json();
        if (!Array.isArray(data)) throw new Error("Invalid analyses response");
        return data;
      })
      .then(setSessions)
      .catch(() => setLoadFailed(true));
  }, []);

  return (
    <div className="bg-panel border border-border rounded-[10px] p-6">
      <Tag>Dashboard</Tag>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display font-bold text-xl">Your analyses</h2>
        <Link
          href="/scenario"
          className="bg-accent hover:bg-accent-dark transition-colors text-bg font-medium text-sm px-4 py-2 rounded-[8px]"
        >
          New analysis
        </Link>
      </div>

      {loadFailed && <p role="alert" className="text-sm text-danger">Could not load your analyses.</p>}
      {!loadFailed && sessions === null && <p className="text-sm text-muted">Loading…</p>}
      {sessions?.length === 0 && (
        <div className="border border-dashed border-border rounded-[8px] py-10 text-center">
          <p className="text-sm text-muted">Nothing here yet. Describe a scenario to get started.</p>
        </div>
      )}
      <div className="flex flex-col divide-y divide-border">
        {sessions?.map((s) => (
          <Link
            key={s.id}
            href={`/session/${s.id}`}
            className="group flex items-center justify-between py-3.5 hover:pl-2 transition-all"
          >
            <div className="min-w-0">
              <div className="font-medium truncate group-hover:text-accent transition-colors">
                {s.title}
              </div>
              <div className="text-xs text-muted mt-0.5">
                {new Date(s.created_at).toLocaleString()}
              </div>
            </div>
            <span className="text-muted group-hover:text-accent transition-colors shrink-0 ml-3">
              &rarr;
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
