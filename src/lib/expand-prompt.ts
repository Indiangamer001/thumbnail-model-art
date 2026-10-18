import { createServerFn } from "@tanstack/react-start";
import { parseArtJson, type ArtPrompt, type LengthMode } from "@/lib/art-format";

export type ExpandInput = {
  source: string;
  length: LengthMode;
  target: string;
  audience: string;
  constraints: string;
  variation: boolean;
  previousRole: string;
};

export type ExpandResult =
  | { ok: true; prompt: ArtPrompt }
  | { ok: false; error: string };

const SYSTEM = `You expand a user's rough idea into one copy-ready prompt using the ART framework. You do not perform the user's task. You only write the prompt another AI should receive.

ART:
- A — Act As: a specific role, the relevant expertise, the working approach, and priorities. Do not invent degrees, employers, awards, or years of experience.
- R — Request: exactly what that AI should do, the context the user actually gave, the steps that matter, and the intended outcome. Do not widen the goal or insert facts the user did not supply.
- T — Terms: the execution rules. Include only terms that change the result: scope boundaries, required deliverables, format, depth, tone, technical constraints, edge cases, and how to handle missing information. Do not repeat A or R. Do not pad with generic advice.

Fidelity:
- Keep every concrete detail the user supplied (names, numbers, tools, constraints, audience).
- If a missing detail would materially change the prompt, use an editable placeholder in square brackets, such as [TARGET AUDIENCE], and say in Terms that the model should ask or label assumptions. Never pretend an unknown preference was provided.
- Write in imperative language aimed at the target AI.
- Match the domain. Creative work may need composition, style, and output specs. Research may need source quality, dates, citations, and uncertainty. Programming may need environment, interfaces, tests, and error handling. Do not paste the same checklist onto every topic.
- If the user asks for alternatives or variants, produce them inside the Request and Terms rather than abandoning ART.
- Length "detailed": thorough and practical, not wordy. Act As is one short paragraph. Request is one or two paragraphs. Terms is 6 to 12 concrete instructions.
- Length "concise": tight. Act As is one or two sentences. Request is one short paragraph. Terms is 4 to 6 instructions. Do not drop any part of ART.
- If variation is true, choose a genuinely different expert angle and structure than the previous role, while keeping the user's goal intact.

Return only a JSON object with this shape and no markdown fences:
{"actAs":"string","request":"string","terms":["string"]}
The strings are body copy only. Do not include the headings "ACT AS", "REQUEST", or "TERMS" inside the strings. Each term is one instruction without a leading dash or number.`;

function clip(value: unknown, max: number): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function sanitize(input: ExpandInput): ExpandInput | { error: string } {
  const source = clip(input?.source, 4000);
  if (source.length < 8) {
    return { error: "Write a little more so the brief has something to expand." };
  }
  return {
    source,
    length: input?.length === "concise" ? "concise" : "detailed",
    target: clip(input?.target, 200),
    audience: clip(input?.audience, 200),
    constraints: clip(input?.constraints, 600),
    variation: input?.variation === true,
    previousRole: clip(input?.previousRole, 500),
  };
}

function userMessage(input: ExpandInput): string {
  const lines = [
    `Length: ${input.length}`,
    `Variation: ${input.variation ? "yes — take a different expert angle than the previous role" : "no"}`,
  ];
  if (input.variation && input.previousRole) {
    lines.push(`Previous role to avoid repeating: ${input.previousRole}`);
  }
  if (input.target) lines.push(`Target AI or tool: ${input.target}`);
  if (input.audience) lines.push(`Audience for the finished work: ${input.audience}`);
  if (input.constraints) lines.push(`Extra constraints: ${input.constraints}`);
  lines.push("", "Source idea:", input.source);
  return lines.join("\n");
}

export const expandPrompt = createServerFn({ method: "POST" })
  .validator((input: ExpandInput) => input)
  .handler(async ({ data }): Promise<ExpandResult> => {
    const cleaned = sanitize(data);
    if ("error" in cleaned) return { ok: false, error: cleaned.error };

    const apiKey = process.env.XAI_API_KEY;
    if (!apiKey) {
      return { ok: false, error: "Prompt composition is unavailable right now." };
    }

    let response: Response;
    try {
      response = await fetch("https://api.x.ai/v1/chat/completions", {
        method: "POST",
        signal: AbortSignal.timeout(45_000),
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "grok-4.5",
          temperature: cleaned.variation ? 0.8 : 0.4,
          max_tokens: cleaned.length === "concise" ? 900 : 2200,
          response_format: { type: "json_object" },
          messages: [
            { role: "system", content: SYSTEM },
            { role: "user", content: userMessage(cleaned) },
          ],
        }),
      });
    } catch (error) {
      const timedOut = error instanceof Error && error.name === "TimeoutError";
      return {
        ok: false,
        error: timedOut
          ? "That took too long. Try again."
          : "The composer could not finish that draft. Try again.",
      };
    }

    if (!response.ok) {
      console.error("[art] compose failed", response.status);
      return {
        ok: false,
        error:
          response.status === 429
            ? "The composer is busy. Wait a moment and try again."
            : "The composer could not finish that draft. Try again.",
      };
    }

    const body = (await response.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const text = body.choices?.[0]?.message?.content ?? "";
    const prompt = parseArtJson(text);
    if (!prompt) {
      return { ok: false, error: "The draft came back unreadable. Try again." };
    }
    return { ok: true, prompt };
  });
