export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { storeDocument } from "@/lib/vectorstore";
import mammoth from "mammoth";
import { PDFParse } from "pdf-parse";

async function extractText(file: File): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer());
  const name = file.name.toLowerCase();

  if (name.endsWith(".pdf")) {
    const parser = new PDFParse({ data: buffer });
    try {
      const { text } = await parser.getText();
      return text;
    } finally {
      await parser.destroy();
    }
  }
  if (name.endsWith(".docx")) {
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  }
  if (name.endsWith(".txt")) {
    return buffer.toString("utf-8");
  }
  throw new Error("Unsupported file type — please upload a .pdf, .docx, or .txt file");
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

    const text = await extractText(file);
    if (!text || text.trim().length < 20) {
      return NextResponse.json({ error: "Couldn't extract meaningful text from this file" }, { status: 400 });
    }

    const { documentId, chunkCount } = await storeDocument(text);
    return NextResponse.json({
      documentId,
      chunkCount,
      preview: text.trim().slice(0, 300),
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Upload failed" }, { status: 500 });
  }
}
