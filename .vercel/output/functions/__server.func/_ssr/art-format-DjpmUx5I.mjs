//#region node_modules/.nitro/vite/services/ssr/assets/art-format-DjpmUx5I.js
function asText(value) {
	return typeof value === "string" ? value.trim() : "";
}
function termText(value) {
	if (typeof value === "string") return value.trim();
	if (value && typeof value === "object" && "text" in value) return asText(value.text);
	return "";
}
function stripMarker(line) {
	return line.replace(/^\s*(?:[-*•]+|\d+[.)])\s+/, "").trim();
}
function parseArtJson(raw) {
	const trimmed = raw.trim();
	const body = (trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i)?.[1] ?? trimmed).trim();
	const start = body.indexOf("{");
	const end = body.lastIndexOf("}");
	if (start < 0 || end <= start) return null;
	let value;
	try {
		value = JSON.parse(body.slice(start, end + 1));
	} catch {
		return null;
	}
	if (!value || typeof value !== "object") return null;
	const record = value;
	const actAs = asText(record.actAs ?? record.act_as ?? record.a).slice(0, 4e3);
	const request = asText(record.request ?? record.r).slice(0, 4e3);
	const rawTerms = record.terms ?? record.t;
	let terms = [];
	if (Array.isArray(rawTerms)) terms = rawTerms.map(termText);
	else if (typeof rawTerms === "string") terms = rawTerms.split(/\n+/);
	terms = terms.map(stripMarker).map((term) => term.slice(0, 600)).filter(Boolean).slice(0, 14);
	if (!actAs || !request || terms.length === 0) return null;
	return {
		actAs,
		request,
		terms
	};
}
function composeMarkdown(prompt) {
	const terms = prompt.terms.map((term) => `- ${term}`).join("\n");
	return `### A — ACT AS\n${prompt.actAs}\n\n### R — REQUEST\n${prompt.request}\n\n### T — TERMS\n${terms}\n`;
}
//#endregion
export { parseArtJson as n, composeMarkdown as t };
