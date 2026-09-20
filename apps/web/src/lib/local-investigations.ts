import { randomUUID } from "crypto";
import { spawn } from "child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";
import type { InvestigationRecordDTO } from "@/lib/healing-data";

type LocalRecord = InvestigationRecordDTO & { error?: string };
const root = join(process.cwd(), "../..");
const storePath = join(root, ".data", "local-investigations.json");

function readRecords(): LocalRecord[] {
  try { return JSON.parse(readFileSync(storePath, "utf8")) as LocalRecord[]; } catch { return []; }
}
function writeRecords(records: LocalRecord[]) {
  if (!existsSync(join(root, ".data"))) mkdirSync(join(root, ".data"), { recursive: true });
  writeFileSync(storePath, JSON.stringify(records, null, 2));
}
function update(id: string, values: Partial<LocalRecord>) { const records = readRecords().map((record) => record.investigation_id === id ? { ...record, ...values } : record); writeRecords(records); }

export function getLocalInvestigation(id: string) { return readRecords().find((record) => record.investigation_id === id) ?? null; }

export function startLocalInvestigation(input: { owner: string; repository: string; ref: string }) {
  const investigation_id = randomUUID();
  const record: LocalRecord = { investigation_id, status: "RUNNING", owner: input.owner, repository: input.repository, ref: input.ref, created_at: Math.floor(Date.now() / 1000) };
  writeRecords([record, ...readRecords()]);
  const child = spawn("python3", [join(root, "backend", "local_investigation.py"), JSON.stringify(input)], { cwd: root });
  let output = "", error = "";
  child.stdout.on("data", (chunk) => { output += String(chunk); });
  child.stderr.on("data", (chunk) => { error += String(chunk); });
  child.on("close", (code) => {
    try { update(investigation_id, code === 0 ? { status: "SUCCEEDED", result: JSON.parse(output) } : { status: "FAILED", error: error || "Local analysis failed." }); }
    catch { update(investigation_id, { status: "FAILED", error: "Local analysis returned an unreadable result." }); }
  });
  child.on("error", () => update(investigation_id, { status: "FAILED", error: "Python 3 is required for local analysis." }));
  return record;
}
