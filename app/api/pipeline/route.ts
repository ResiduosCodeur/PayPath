import { NextRequest, NextResponse } from "next/server";
import { extractRequirements, recommendSdlc } from "@/lib/anthropic";
import { synthesizeScenarioFromDocument } from "@/lib/vectorstore";
import db from "@/lib/db";
import { randomUUID } from "crypto";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    let scenario: string = body.scenario || "";
    let title: string;

    if (body.documentId) {
      scenario = await synthesizeScenarioFromDocument(body.documentId);
      title = "Analysis from uploaded document";
    } else {
      if (!scenario.trim()) {
        return NextResponse.json({ error: "Scenario description is required" }, { status: 400 });
      }
      title = scenario.length > 60 ? scenario.slice(0, 57) + "…" : scenario;
    }

    const { requirements, evidenceUsed: reqEvidence } = await extractRequirements(scenario);
    const { sdlc, evidenceUsed: sdlcEvidence } = await recommendSdlc(requirements);

    const id = randomUUID();
    db.prepare(
      `INSERT INTO sessions (id, title, created_at, scenario, requirements, sdlc, req_evidence, sdlc_evidence)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(
      id,
      title,
      Date.now(),
      scenario,
      JSON.stringify(requirements),
      JSON.stringify(sdlc),
      JSON.stringify(reqEvidence),
      JSON.stringify(sdlcEvidence)
    );

    return NextResponse.json({ id, requirements, sdlc });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "pipeline failed" }, { status: 500 });
  }
}
