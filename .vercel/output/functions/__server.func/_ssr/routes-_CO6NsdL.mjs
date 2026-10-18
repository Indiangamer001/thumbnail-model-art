import { i as __toESM } from "../_runtime.mjs";
import { b as require_jsx_runtime, q as require_react } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as TSS_SERVER_FUNCTION, r as getServerFnById, t as createServerFn } from "./ssr.mjs";
import { t as composeMarkdown } from "./art-format-DjpmUx5I.mjs";
import { a as Copy, i as Download, n as Trash2, o as Check, r as RefreshCw } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-_CO6NsdL.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var createSsrRpc = (functionId) => {
	const url = "/_serverFn/" + functionId;
	const serverFnMeta = { id: functionId };
	const fn = async (...args) => {
		return (await getServerFnById(functionId, { origin: "server" }))(...args);
	};
	return Object.assign(fn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
var expandPrompt = createServerFn({ method: "POST" }).validator((input) => input).handler(createSsrRpc("ea5fb75bef842ea2a101e6d760974e9e0f9ea1200f2d292595da6b4f221845dc"));
var HISTORY_KEY = "art-architect-history-v1";
var DRAFT_KEY = "art-architect-draft-v1";
var HISTORY_LIMIT = 20;
function readJson(key) {
	if (typeof window === "undefined") return null;
	try {
		const raw = window.localStorage.getItem(key);
		return raw ? JSON.parse(raw) : null;
	} catch {
		return null;
	}
}
function writeJson(key, value) {
	try {
		window.localStorage.setItem(key, JSON.stringify(value));
	} catch {}
}
function isPrompt(value) {
	if (!value || typeof value !== "object") return false;
	const record = value;
	return typeof record.actAs === "string" && typeof record.request === "string" && Array.isArray(record.terms) && record.terms.every((term) => typeof term === "string");
}
function isItem(value) {
	if (!value || typeof value !== "object") return false;
	const record = value;
	return typeof record.id === "string" && typeof record.createdAt === "number" && typeof record.source === "string" && (record.length === "detailed" || record.length === "concise") && typeof record.target === "string" && typeof record.audience === "string" && typeof record.constraints === "string" && isPrompt(record.prompt);
}
function loadHistory() {
	const value = readJson(HISTORY_KEY);
	if (!Array.isArray(value)) return [];
	return value.filter(isItem).slice(0, HISTORY_LIMIT);
}
function saveHistory(items) {
	writeJson(HISTORY_KEY, items.slice(0, HISTORY_LIMIT));
}
function loadDraft() {
	const value = readJson(DRAFT_KEY);
	if (!value || typeof value !== "object") return null;
	const record = value;
	if (typeof record.source !== "string") return null;
	return {
		source: record.source,
		length: record.length === "concise" ? "concise" : "detailed",
		target: typeof record.target === "string" ? record.target : "",
		audience: typeof record.audience === "string" ? record.audience : "",
		constraints: typeof record.constraints === "string" ? record.constraints : ""
	};
}
function saveDraft(draft) {
	writeJson(DRAFT_KEY, draft);
}
var STARTERS = [
	{
		id: "pubg",
		label: "PUBG smoothness",
		source: "Give me a prompt to research the best settings for smooth PUBG gameplay."
	},
	{
		id: "lesson",
		label: "A lesson",
		source: "Explain black holes to a curious 12-year-old who likes space documentaries, without a scary tone or fake certainty."
	},
	{
		id: "review",
		label: "Code review",
		source: "Review a React pull request for bugs, accessibility, and unnecessary complexity. The stack is TanStack Start and Tailwind."
	},
	{
		id: "voice",
		label: "Brand voice",
		source: "Turn these notes into a prompt that writes a homepage hero for a small ceramics studio: handmade, slow, not luxury-snob, ships in the US."
	}
];
var GUIDE = [
	{
		mark: "A",
		title: "Act as",
		body: "A specific expert, and the kind of judgment you want from them."
	},
	{
		mark: "R",
		title: "Request",
		body: "The job, the context you actually gave, and the outcome."
	},
	{
		mark: "T",
		title: "Terms",
		body: "Scope, format, and what done looks like."
	}
];
function wordCount(value) {
	const trimmed = value.trim();
	if (!trimmed) return 0;
	return trimmed.split(/\s+/).length;
}
function formatWhen(timestamp) {
	const minutes = Math.round((Date.now() - timestamp) / 6e4);
	if (minutes < 1) return "Just now";
	if (minutes < 60) return `${minutes}m ago`;
	const hours = Math.round(minutes / 60);
	if (hours < 24) return `${hours}h ago`;
	return `${Math.round(hours / 24)}d ago`;
}
function firstLine(value) {
	const line = value.trim().split("\n")[0] ?? "";
	return line.length > 88 ? `${line.slice(0, 86)}…` : line;
}
async function copyText(value) {
	await navigator.clipboard.writeText(value);
}
function ArchitectApp() {
	const ideaId = (0, import_react.useId)();
	const targetId = (0, import_react.useId)();
	const audienceId = (0, import_react.useId)();
	const constraintsId = (0, import_react.useId)();
	const [source, setSource] = (0, import_react.useState)("");
	const [length, setLength] = (0, import_react.useState)("detailed");
	const [target, setTarget] = (0, import_react.useState)("");
	const [audience, setAudience] = (0, import_react.useState)("");
	const [constraints, setConstraints] = (0, import_react.useState)("");
	const [prompt, setPrompt] = (0, import_react.useState)(null);
	const [activeId, setActiveId] = (0, import_react.useState)(null);
	const [history, setHistory] = (0, import_react.useState)([]);
	const [ready, setReady] = (0, import_react.useState)(false);
	const [pending, setPending] = (0, import_react.useState)(false);
	const [error, setError] = (0, import_react.useState)(null);
	const [copied, setCopied] = (0, import_react.useState)(null);
	const [contextOpen, setContextOpen] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		const draft = loadDraft();
		if (draft) {
			setSource(draft.source);
			setLength(draft.length);
			setTarget(draft.target);
			setAudience(draft.audience);
			setConstraints(draft.constraints);
			if (draft.target || draft.audience || draft.constraints) setContextOpen(true);
		}
		setHistory(loadHistory());
		setReady(true);
	}, []);
	(0, import_react.useEffect)(() => {
		if (!ready) return;
		saveDraft({
			source,
			length,
			target,
			audience,
			constraints
		});
	}, [
		ready,
		source,
		length,
		target,
		audience,
		constraints
	]);
	(0, import_react.useEffect)(() => {
		if (!copied) return;
		const timer = window.setTimeout(() => setCopied(null), 1600);
		return () => window.clearTimeout(timer);
	}, [copied]);
	async function compose(variation) {
		if (pending) return;
		setPending(true);
		setError(null);
		try {
			const result = await expandPrompt({ data: {
				source,
				length,
				target,
				audience,
				constraints,
				variation,
				previousRole: variation ? prompt?.actAs ?? "" : ""
			} });
			if (!result.ok) {
				setError(result.error);
				return;
			}
			const item = {
				id: crypto.randomUUID(),
				createdAt: Date.now(),
				source: source.trim(),
				length,
				target: target.trim(),
				audience: audience.trim(),
				constraints: constraints.trim(),
				prompt: result.prompt
			};
			const next = [item, ...history].slice(0, 20);
			setHistory(next);
			saveHistory(next);
			setPrompt(result.prompt);
			setActiveId(item.id);
		} catch {
			setError("The composer could not finish that draft. Try again.");
		} finally {
			setPending(false);
		}
	}
	function restore(item) {
		setSource(item.source);
		setLength(item.length);
		setTarget(item.target);
		setAudience(item.audience);
		setConstraints(item.constraints);
		setPrompt(item.prompt);
		setActiveId(item.id);
		setError(null);
		setContextOpen(Boolean(item.target || item.audience || item.constraints));
	}
	function remove(id) {
		const next = history.filter((item) => item.id !== id);
		setHistory(next);
		saveHistory(next);
		if (activeId === id) {
			setPrompt(null);
			setActiveId(null);
		}
	}
	function clearBrief() {
		setSource("");
		setTarget("");
		setAudience("");
		setConstraints("");
		setPrompt(null);
		setActiveId(null);
		setError(null);
		setContextOpen(false);
	}
	async function onCopy(key, value) {
		try {
			await copyText(value);
			setCopied(key);
		} catch {
			setError("Copy failed in this browser. Select the preview and copy it manually.");
		}
	}
	function download() {
		if (!prompt) return;
		const blob = new Blob([composeMarkdown(prompt)], { type: "text/markdown" });
		const url = URL.createObjectURL(blob);
		const link = document.createElement("a");
		link.href = url;
		link.download = "art-prompt.md";
		link.click();
		URL.revokeObjectURL(url);
	}
	const words = wordCount(source);
	const canCompose = source.trim().length >= 8 && !pending;
	const markdown = prompt ? composeMarkdown(prompt) : "";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex min-h-dvh flex-col lg:h-dvh lg:overflow-hidden",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", {
			className: "shrink-0 border-b border-border",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mx-auto flex max-w-6xl items-end justify-between gap-4 px-5 py-5 sm:px-8",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-display text-3xl leading-none tracking-display text-foreground",
					children: "ART"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-sm text-muted",
					children: "Prompt Architect"
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "hidden pb-1 text-right text-xs tracking-kicker text-muted uppercase sm:block",
					children: [
						"Act as",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "px-2 text-subtle",
							children: "/"
						}),
						"Request",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "px-2 text-subtle",
							children: "/"
						}),
						"Terms"
					]
				})]
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
			className: "mx-auto grid w-full max-w-6xl flex-1 lg:min-h-0 lg:grid-cols-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "px-5 py-6 sm:px-8 lg:overflow-y-auto lg:py-6",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs font-medium tracking-kicker text-muted uppercase",
						children: "The brief"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "mt-3 font-display text-4xl leading-tight tracking-display text-foreground",
						children: "What should the model do?"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 max-w-md text-base text-muted",
						children: "A rough idea goes in. A prompt another model can run comes out. This writes the instruction — it does not do the task."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
						className: "mt-6",
						onSubmit: (event) => {
							event.preventDefault();
							compose(false);
						},
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "flex flex-wrap gap-2",
								children: STARTERS.map((starter) => {
									const selected = source === starter.source;
									return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										"aria-pressed": selected,
										onClick: () => setSource(starter.source),
										className: "min-h-11 rounded-full border px-4 text-sm transition-colors duration-150 " + (selected ? "border-primary bg-primary text-primary-foreground" : "border-border-strong bg-transparent text-foreground hover:bg-surface"),
										children: starter.label
									}, starter.id);
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
								htmlFor: ideaId,
								className: "mt-6 block text-sm font-medium text-foreground",
								children: "Idea"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
								id: ideaId,
								value: source,
								onChange: (event) => setSource(event.target.value),
								onKeyDown: (event) => {
									if ((event.metaKey || event.ctrlKey) && event.key === "Enter" && canCompose) {
										event.preventDefault();
										compose(false);
									}
								},
								rows: 5,
								maxLength: 4e3,
								placeholder: "A sentence is enough. Keep the specifics you care about.",
								suppressHydrationWarning: true,
								className: "mt-2 w-full resize-y rounded-lg border border-border bg-surface px-4 py-3 text-base leading-relaxed text-foreground placeholder:text-subtle"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-2 flex items-center justify-between text-xs text-subtle tabular-nums",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: words === 1 ? "1 word" : `${words} words` }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [source.length, "/4000"] })]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("fieldset", {
								className: "mt-5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("legend", {
									className: "text-sm font-medium text-foreground",
									children: "Length"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "mt-2 grid grid-cols-2 rounded-lg border border-border-strong p-2",
									children: [["detailed", "Detailed"], ["concise", "Concise"]].map(([value, label]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										"aria-pressed": length === value,
										onClick: () => setLength(value),
										className: "min-h-11 rounded-md text-sm font-medium transition-colors duration-150 " + (length === value ? "bg-primary text-primary-foreground" : "text-muted hover:text-foreground"),
										children: label
									}, value))
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-5 flex flex-col gap-3 sm:flex-row sm:items-center",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "submit",
										disabled: !canCompose,
										className: "inline-flex min-h-11 items-center justify-center rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground transition-colors duration-150 hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-40",
										children: pending ? "Composing…" : "Compose prompt"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										onClick: clearBrief,
										className: "inline-flex min-h-11 items-center justify-center rounded-md px-3 text-sm text-muted hover:text-foreground",
										children: "Clear"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-xs text-subtle sm:ml-auto",
										children: "Ctrl + Enter"
									})
								]
							}),
							source.trim().length > 0 && source.trim().length < 8 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-3 text-sm text-muted",
								children: "A few more words and this can be expanded."
							}) : null,
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("details", {
								className: "mt-5 border-t border-border pt-4",
								open: contextOpen,
								onToggle: (event) => setContextOpen(event.currentTarget.open),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("summary", {
									className: "min-h-11 text-sm font-medium text-foreground",
									children: "Add context"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-4 grid gap-4",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
											id: targetId,
											label: "Target tool",
											optional: true,
											value: target,
											onChange: setTarget,
											placeholder: "Grok, Claude, a coding agent…",
											maxLength: 200
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
											id: audienceId,
											label: "Audience",
											optional: true,
											value: audience,
											onChange: setAudience,
											placeholder: "Who the finished work is for",
											maxLength: 200
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
											htmlFor: constraintsId,
											className: "text-sm font-medium text-foreground",
											children: ["Constraints ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "font-normal text-subtle",
												children: "optional"
											})]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
											id: constraintsId,
											value: constraints,
											onChange: (event) => setConstraints(event.target.value),
											rows: 2,
											maxLength: 600,
											placeholder: "Tone, length, things to leave out",
											suppressHydrationWarning: true,
											className: "mt-2 w-full resize-y rounded-md border border-border bg-surface px-3 py-3 text-base text-foreground placeholder:text-subtle"
										})] })
									]
								})]
							})
						]
					}),
					history.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-10 border-t border-border pt-6",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-baseline justify-between",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "text-sm font-medium text-foreground",
								children: "On this device"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-xs text-subtle tabular-nums",
								children: [history.length, " saved"]
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
							className: "mt-3 divide-y divide-border",
							children: history.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
								className: "flex items-stretch gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "button",
									onClick: () => restore(item),
									className: "min-h-11 flex-1 py-3 text-left " + (item.id === activeId ? "text-foreground" : "text-muted hover:text-foreground"),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "block text-sm",
										children: firstLine(item.source)
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "mt-1 block text-xs text-subtle tabular-nums",
										children: [
											formatWhen(item.createdAt),
											" · ",
											item.length
										]
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									"aria-label": "Remove saved prompt",
									onClick: () => remove(item.id),
									className: "inline-flex min-h-11 min-w-11 items-center justify-center text-subtle hover:text-foreground",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, {
										className: "size-4",
										"aria-hidden": "true"
									})
								})]
							}, item.id))
						})]
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-10 text-xs text-subtle",
						children: "Saved prompts stay on this device."
					})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "border-t border-border bg-surface px-5 py-6 sm:px-8 lg:overflow-y-auto lg:border-t-0 lg:border-l lg:px-10 lg:py-6",
				"aria-live": "polite",
				"aria-busy": pending,
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex items-start justify-between gap-4",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs font-medium tracking-kicker text-muted uppercase",
							children: "The prompt"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "mt-3 font-display text-3xl leading-tight tracking-display",
							children: prompt ? "Ready to copy" : "Waiting on a brief"
						})] })
					}),
					pending ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "sweep mt-6",
						"aria-hidden": "true"
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "mt-6 h-px bg-border" }),
					error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						role: "alert",
						className: "mt-4 rounded-md bg-danger-surface px-3 py-3 text-sm text-danger",
						children: error
					}) : null,
					prompt ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-4 line-clamp-2 font-display text-base text-muted italic",
						children: source.trim()
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: prompt ? "rise mt-8" : "mt-8",
						children: prompt ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PromptBlock, {
								mark: "A",
								title: "Act as",
								copied: copied === "act",
								onCopy: () => void onCopy("act", prompt.actAs),
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "whitespace-pre-wrap text-base leading-relaxed",
									children: prompt.actAs
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PromptBlock, {
								mark: "R",
								title: "Request",
								copied: copied === "request",
								onCopy: () => void onCopy("request", prompt.request),
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "whitespace-pre-wrap text-base leading-relaxed",
									children: prompt.request
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PromptBlock, {
								mark: "T",
								title: "Terms",
								copied: copied === "terms",
								onCopy: () => void onCopy("terms", prompt.terms.map((term) => `- ${term}`).join("\n")),
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
									className: "list-decimal space-y-3 pl-5 text-base leading-relaxed",
									children: prompt.terms.map((term, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: term }, `${index}-${term}`))
								})
							})
						] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
							className: "space-y-6",
							children: GUIDE.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
								className: "grid grid-cols-[2.5rem_minmax(0,1fr)] gap-4",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-display text-2xl leading-none tracking-display text-subtle",
									children: item.mark
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-sm font-medium text-foreground",
									children: item.title
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-1 text-sm text-muted",
									children: item.body
								})] })]
							}, item.mark))
						})
					}),
					prompt ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-8 border-t border-border pt-6",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-col gap-2 sm:flex-row sm:flex-wrap",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "button",
									onClick: () => void onCopy("all", markdown),
									className: "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary-hover",
									children: [copied === "all" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, {
										className: "size-4",
										"aria-hidden": "true"
									}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Copy, {
										className: "size-4",
										"aria-hidden": "true"
									}), copied === "all" ? "Copied" : "Copy full prompt"]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "button",
									onClick: () => void compose(true),
									disabled: pending,
									className: "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-border-strong px-4 text-sm font-medium text-foreground hover:bg-background disabled:opacity-40",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, {
										className: "size-4",
										"aria-hidden": "true"
									}), "Different angle"]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "button",
									onClick: download,
									className: "inline-flex min-h-11 items-center justify-center gap-2 rounded-md px-4 text-sm text-muted hover:text-foreground",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, {
										className: "size-4",
										"aria-hidden": "true"
									}), "Download"]
								})
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("details", {
							className: "mt-6",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("summary", {
								className: "text-sm font-medium text-foreground",
								children: "Preview the full prompt"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("pre", {
								className: "mt-4 whitespace-pre-wrap font-sans text-sm leading-relaxed text-foreground",
								children: markdown
							})]
						})]
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "sr-only",
						children: copied ? "Copied to clipboard." : ""
					})
				]
			})]
		})]
	});
}
function Field({ id, label, optional, value, onChange, placeholder, maxLength }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
		htmlFor: id,
		className: "text-sm font-medium text-foreground",
		children: [
			label,
			" ",
			optional ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "font-normal text-subtle",
				children: "optional"
			}) : null
		]
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
		id,
		value,
		maxLength,
		onChange: (event) => onChange(event.target.value),
		placeholder,
		className: "mt-2 h-11 w-full rounded-md border border-border bg-surface px-3 text-base text-foreground placeholder:text-subtle",
		suppressHydrationWarning: true
	})] });
}
function PromptBlock({ mark, title, copied, onCopy, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "border-b border-border py-6 first:pt-0",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mb-3 flex items-center justify-between gap-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", {
				className: "flex items-baseline gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "font-display text-2xl leading-none tracking-display",
					children: mark
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-xs font-medium tracking-kicker text-muted uppercase",
					children: title
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				onClick: onCopy,
				"aria-label": copied ? `${title} copied` : `Copy ${title}`,
				className: "inline-flex min-h-11 min-w-11 items-center justify-center rounded-md text-muted hover:text-foreground",
				children: copied ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, {
					className: "size-4",
					"aria-hidden": "true"
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Copy, {
					className: "size-4",
					"aria-hidden": "true"
				})
			})]
		}), children]
	});
}
function Home() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArchitectApp, {});
}
//#endregion
export { Home as component };
