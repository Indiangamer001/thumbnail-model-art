import type { ArtPrompt, LengthMode } from "@/lib/art-format";

const HISTORY_KEY = "art-architect-history-v1";
const DRAFT_KEY = "art-architect-draft-v1";
const HISTORY_LIMIT = 20;

export type HistoryItem = {
  id: string;
  createdAt: number;
  source: string;
  length: LengthMode;
  target: string;
  audience: string;
  constraints: string;
  prompt: ArtPrompt;
};

export type Draft = {
  source: string;
  length: LengthMode;
  target: string;
  audience: string;
  constraints: string;
};

function readJson(key: string): unknown {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeJson(key: string, value: unknown) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* private mode or a full store — the prompt is still on screen */
  }
}

function isPrompt(value: unknown): value is ArtPrompt {
  if (!value || typeof value !== "object") return false;
  const record = value as ArtPrompt;
  return (
    typeof record.actAs === "string" &&
    typeof record.request === "string" &&
    Array.isArray(record.terms) &&
    record.terms.every((term) => typeof term === "string")
  );
}

function isItem(value: unknown): value is HistoryItem {
  if (!value || typeof value !== "object") return false;
  const record = value as HistoryItem;
  return (
    typeof record.id === "string" &&
    typeof record.createdAt === "number" &&
    typeof record.source === "string" &&
    (record.length === "detailed" || record.length === "concise") &&
    typeof record.target === "string" &&
    typeof record.audience === "string" &&
    typeof record.constraints === "string" &&
    isPrompt(record.prompt)
  );
}

export function loadHistory(): HistoryItem[] {
  const value = readJson(HISTORY_KEY);
  if (!Array.isArray(value)) return [];
  return value.filter(isItem).slice(0, HISTORY_LIMIT);
}

export function saveHistory(items: HistoryItem[]) {
  writeJson(HISTORY_KEY, items.slice(0, HISTORY_LIMIT));
}

export function loadDraft(): Draft | null {
  const value = readJson(DRAFT_KEY);
  if (!value || typeof value !== "object") return null;
  const record = value as Draft;
  if (typeof record.source !== "string") return null;
  return {
    source: record.source,
    length: record.length === "concise" ? "concise" : "detailed",
    target: typeof record.target === "string" ? record.target : "",
    audience: typeof record.audience === "string" ? record.audience : "",
    constraints: typeof record.constraints === "string" ? record.constraints : "",
  };
}

export function saveDraft(draft: Draft) {
  writeJson(DRAFT_KEY, draft);
}
