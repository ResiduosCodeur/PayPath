import { NextResponse } from "next/server";
import db, { SessionRow } from "@/lib/db";

export async function GET() {
  const rows = db
    .prepare(`SELECT id, title, created_at FROM sessions ORDER BY created_at DESC LIMIT 50`)
    .all() as Pick<SessionRow, "id" | "title" | "created_at">[];
  return NextResponse.json(rows);
}
