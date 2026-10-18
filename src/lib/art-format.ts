export type ArtPrompt = {
  actAs: string;
  request: string;
  terms: string[];
};

export type LengthMode = "detailed" | "concise";

function asText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function termText(value: unknown): string {
  if (typeof value === "string") return value.trim();
  if (value && typeof value === "object" && "text" in value) {
    return asText((value as { text: unknown }).text);
  }
  return "";
}

function stripMarker(line: string): string {
  return line.replace(/^\s*(?:[-*•]+|\d+[.)])\s+/, "").trim();
}

export function parseArtJson(raw: string): ArtPrompt | null {
  const trimmed = raw.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const body = (fenced?.[1] ?? trimmed).trim();
  const start = body.indexOf("{");
  const end = body.lastIndexOf("}");
  if (start < 0 || end <= start) return null;

  let value: unknown;
  try {
    value = JSON.parse(body.slice(start, end + 1));
  } catch {
    return null;
  }
  if (!value || typeof value !== "object") return null;

  const record = value as Record<string, unknown>;
  const actAs = asText(record.actAs ?? record.act_as ?? record.a).slice(0, 4000);
  const request = asText(record.request ?? record.r).slice(0, 4000);
  const rawTerms = record.terms ?? record.t;
  let terms: string[] = [];
  if (Array.isArray(rawTerms)) {
    terms = rawTerms.map(termText);
  } else if (typeof rawTerms === "string") {
    terms = rawTerms.split(/\n+/);
  }
  terms = terms
    .map(stripMarker)
    .map((term) => term.slice(0, 600))
    .filter(Boolean)
    .slice(0, 14);

  if (!actAs || !request || terms.length === 0) return null;
  return { actAs, request, terms };
}

export function composeMarkdown(prompt: ArtPrompt): string {
  const terms = prompt.terms.map((term) => `- ${term}`).join("\n");
  return `### A — ACT AS\n${prompt.actAs}\n\n### R — REQUEST\n${prompt.request}\n\n### T — TERMS\n${terms}\n`;
}
