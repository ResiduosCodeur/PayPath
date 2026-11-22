import Database from "better-sqlite3";
import path from "path";

const dbPath = path.join(process.cwd(), "data.sqlite");
const db = new Database(dbPath);

db.exec(`
  CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    title TEXT,
    created_at INTEGER,
    scenario TEXT,
    requirements TEXT,
    sdlc TEXT,
    req_evidence TEXT,
    sdlc_evidence TEXT
  );

  CREATE TABLE IF NOT EXISTS document_chunks (
    id TEXT PRIMARY KEY,
    document_id TEXT,
    chunk_index INTEGER,
    text TEXT,
    embedding TEXT
  );
  CREATE INDEX IF NOT EXISTS idx_document_chunks_doc ON document_chunks(document_id);
`);

export type SessionRow = {
  id: string;
  title: string;
  created_at: number;
  scenario: string;
  requirements: string;
  sdlc: string;
  req_evidence: string;
  sdlc_evidence: string;
};

export default db;
