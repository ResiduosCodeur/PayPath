import { NextRequest, NextResponse } from "next/server";
import db, { SessionRow } from "@/lib/db";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const row = db.prepare(`SELECT * FROM sessions WHERE id = ?`).get(params.id) as SessionRow | undefined;
  if (!row) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json({
    id: row.id,
    title: row.title,
    createdAt: row.created_at,
    scenario: row.scenario,
    requirements: JSON.parse(row.requirements),
    sdlc: JSON.parse(row.sdlc),
    reqEvidence: JSON.parse(row.req_evidence || "[]"),
    sdlcEvidence: JSON.parse(row.sdlc_evidence || "[]"),
  });
}
