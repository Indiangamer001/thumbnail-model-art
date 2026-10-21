import { useEffect, useId, useState, type ReactNode } from "react";
import { Check, Copy, Download, Moon, RefreshCw, Sun, Trash2 } from "lucide-react";
import { composeMarkdown, type ArtPrompt, type LengthMode } from "@/lib/art-format";
import { expandPrompt } from "@/lib/expand-prompt";
import {
  loadDraft,
  loadHistory,
  saveDraft,
  saveHistory,
  type HistoryItem,
} from "@/lib/prompt-store";
import { applyTheme, currentTheme, readStoredTheme, type Theme } from "@/lib/theme";

const STARTERS: { id: string; label: string; source: string }[] = [
  {
    id: "email",
    label: "Draft an email",
    source:
      "Write a short, polite email to my manager asking to move Thursday's review to next week. I have a conflict, I want to keep the same agenda, and I should offer two new times.",
  },
  {
    id: "summary",
    label: "Summarize notes",
    source:
      "Turn messy meeting notes into a short summary: what was decided, who owns what, and the open questions. Leave out small talk.",
  },
  {
    id: "explain",
    label: "Explain simply",
    source:
      "Explain how interest on a credit card works to someone who has never had one, without jargon or a sales pitch.",
  },
  {
    id: "plan",
    label: "Make a plan",
    source:
      "Plan a 4-week beginner running plan for someone who can walk 30 minutes but has not run before. Three days a week, no gym, and say when to rest.",
  },
];

const GUIDE = [
  {
    mark: "A",
    title: "Act as",
    body: "A specific expert, and the kind of judgment you want from them.",
  },
  {
    mark: "R",
    title: "Request",
    body: "The job, the context you actually gave, and the outcome.",
  },
  {
    mark: "T",
    title: "Terms",
    body: "Scope, format, and what done looks like.",
  },
];

function wordCount(value: string): number {
  const trimmed = value.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
}

function formatWhen(timestamp: number): string {
  const minutes = Math.round((Date.now() - timestamp) / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}

function firstLine(value: string): string {
  const line = value.trim().split("\n")[0] ?? "";
  return line.length > 88 ? `${line.slice(0, 86)}…` : line;
}

async function copyText(value: string) {
  await navigator.clipboard.writeText(value);
}

export function ArchitectApp() {
  const ideaId = useId();
  const targetId = useId();
  const audienceId = useId();
  const constraintsId = useId();

  const [source, setSource] = useState("");
  const [length, setLength] = useState<LengthMode>("detailed");
  const [target, setTarget] = useState("");
  const [audience, setAudience] = useState("");
  const [constraints, setConstraints] = useState("");
  const [prompt, setPrompt] = useState<ArtPrompt | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [ready, setReady] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [contextOpen, setContextOpen] = useState(false);
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    function resolve() {
      const stored = readStoredTheme();
      const next: Theme = stored ?? (media.matches ? "dark" : "light");
      applyTheme(next, false);
      setTheme(next);
    }
    resolve();
    function onSchemeChange() {
      if (readStoredTheme()) return;
      resolve();
    }
    media.addEventListener("change", onSchemeChange);
    return () => media.removeEventListener("change", onSchemeChange);
  }, []);

  useEffect(() => {
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

  useEffect(() => {
    if (!ready) return;
    saveDraft({ source, length, target, audience, constraints });
  }, [ready, source, length, target, audience, constraints]);

  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(null), 1600);
    return () => window.clearTimeout(timer);
  }, [copied]);

  async function compose(variation: boolean) {
    if (pending) return;
    setPending(true);
    setError(null);
    try {
      const result = await expandPrompt({
        data: {
          source,
          length,
          target,
          audience,
          constraints,
          variation,
          previousRole: variation ? (prompt?.actAs ?? "") : "",
        },
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      const item: HistoryItem = {
        id: crypto.randomUUID(),
        createdAt: Date.now(),
        source: source.trim(),
        length,
        target: target.trim(),
        audience: audience.trim(),
        constraints: constraints.trim(),
        prompt: result.prompt,
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

  function restore(item: HistoryItem) {
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

  function remove(id: string) {
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

  async function onCopy(key: string, value: string) {
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

  function toggleTheme() {
    const next: Theme = currentTheme() === "dark" ? "light" : "dark";
    applyTheme(next, true);
    setTheme(next);
  }

  const words = wordCount(source);
  const canCompose = source.trim().length >= 8 && !pending;
  const markdown = prompt ? composeMarkdown(prompt) : "";

  return (
    <div className="flex min-h-dvh flex-col lg:h-dvh lg:overflow-hidden">
      <header className="shrink-0 border-b border-border">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-5 sm:px-8">
          <div>
            <p className="font-display text-3xl leading-none tracking-display text-foreground">
              ART
            </p>
            <p className="mt-1 text-sm text-muted">Prompt Architect</p>
          </div>
          <div className="flex items-center gap-3 pb-0.5">
            <p className="hidden text-right text-xs tracking-kicker text-muted uppercase sm:block">
              Act as
              <span className="px-2 text-subtle">/</span>
              Request
              <span className="px-2 text-subtle">/</span>
              Terms
            </p>
            <button
              type="button"
              onClick={toggleTheme}
              aria-pressed={theme === "dark"}
              aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
              className="inline-flex size-11 items-center justify-center rounded-md border border-border-strong text-foreground transition-colors duration-150 hover:bg-surface"
            >
              <Sun className="hidden size-4 dark:block" aria-hidden="true" />
              <Moon className="size-4 dark:hidden" aria-hidden="true" />
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto grid w-full max-w-6xl flex-1 lg:min-h-0 lg:grid-cols-2">
        <section className="px-5 py-6 sm:px-8 lg:overflow-y-auto lg:py-6">
          <p className="text-xs font-medium tracking-kicker text-muted uppercase">The brief</p>
          <h1 className="mt-3 font-display text-4xl leading-tight tracking-display text-foreground">
            What should the model do?
          </h1>
          <p className="mt-3 max-w-md text-base text-muted">
            A rough idea goes in. A prompt another model can run comes out. This writes the
            instruction — it does not do the task.
          </p>

          <form
            className="mt-6"
            onSubmit={(event) => {
              event.preventDefault();
              void compose(false);
            }}
          >
            <div className="flex flex-wrap gap-2">
              {STARTERS.map((starter) => {
                const selected = source === starter.source;
                return (
                  <button
                    key={starter.id}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => setSource(starter.source)}
                    className={
                      "min-h-11 rounded-full border px-4 text-sm transition-colors duration-150 " +
                      (selected
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border-strong bg-transparent text-foreground hover:bg-surface")
                    }
                  >
                    {starter.label}
                  </button>
                );
              })}
            </div>

            <label htmlFor={ideaId} className="mt-6 block text-sm font-medium text-foreground">
              Idea
            </label>
            <textarea
              id={ideaId}
              value={source}
              onChange={(event) => setSource(event.target.value)}
              onKeyDown={(event) => {
                if ((event.metaKey || event.ctrlKey) && event.key === "Enter" && canCompose) {
                  event.preventDefault();
                  void compose(false);
                }
              }}
              rows={5}
              maxLength={4000}
              placeholder="A sentence is enough. Keep the specifics you care about."
              suppressHydrationWarning
              className="mt-2 w-full resize-y rounded-lg border border-border bg-surface px-4 py-3 text-base leading-relaxed text-foreground placeholder:text-subtle"
            />
            <div className="mt-2 flex items-center justify-between text-xs text-subtle tabular-nums">
              <span>{words === 1 ? "1 word" : `${words} words`}</span>
              <span>{source.length}/4000</span>
            </div>

            <fieldset className="mt-5">
              <legend className="text-sm font-medium text-foreground">Length</legend>
              <div className="mt-2 grid grid-cols-2 rounded-lg border border-border-strong p-2">
                {(
                  [
                    ["detailed", "Detailed"],
                    ["concise", "Concise"],
                  ] as const
                ).map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    aria-pressed={length === value}
                    onClick={() => setLength(value)}
                    className={
                      "min-h-11 rounded-md text-sm font-medium transition-colors duration-150 " +
                      (length === value
                        ? "bg-primary text-primary-foreground"
                        : "text-muted hover:text-foreground")
                    }
                  >
                    {label}
                  </button>
                ))}
              </div>
            </fieldset>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
              <button
                type="submit"
                disabled={!canCompose}
                className="inline-flex min-h-11 items-center justify-center rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground transition-colors duration-150 hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-40"
              >
                {pending ? "Composing…" : "Compose prompt"}
              </button>
              <button
                type="button"
                onClick={clearBrief}
                className="inline-flex min-h-11 items-center justify-center rounded-md px-3 text-sm text-muted hover:text-foreground"
              >
                Clear
              </button>
              <span className="text-xs text-subtle sm:ml-auto">Ctrl + Enter</span>
            </div>
            {source.trim().length > 0 && source.trim().length < 8 ? (
              <p className="mt-3 text-sm text-muted">A few more words and this can be expanded.</p>
            ) : null}

            <details
              className="mt-5 border-t border-border pt-4"
              open={contextOpen}
              onToggle={(event) => setContextOpen(event.currentTarget.open)}
            >
              <summary className="min-h-11 text-sm font-medium text-foreground">Add context</summary>
              <div className="mt-4 grid gap-4">
                <Field
                  id={targetId}
                  label="Target tool"
                  optional
                  value={target}
                  onChange={setTarget}
                  placeholder="Grok, Claude, a coding agent…"
                  maxLength={200}
                />
                <Field
                  id={audienceId}
                  label="Audience"
                  optional
                  value={audience}
                  onChange={setAudience}
                  placeholder="Who the finished work is for"
                  maxLength={200}
                />
                <div>
                  <label htmlFor={constraintsId} className="text-sm font-medium text-foreground">
                    Constraints <span className="font-normal text-subtle">optional</span>
                  </label>
                  <textarea
                    id={constraintsId}
                    value={constraints}
                    onChange={(event) => setConstraints(event.target.value)}
                    rows={2}
                    maxLength={600}
                    placeholder="Tone, length, things to leave out"
                    suppressHydrationWarning
                    className="mt-2 w-full resize-y rounded-md border border-border bg-surface px-3 py-3 text-base text-foreground placeholder:text-subtle"
                  />
                </div>
              </div>
            </details>
          </form>

          {history.length > 0 ? (
            <div className="mt-10 border-t border-border pt-6">
              <div className="flex items-baseline justify-between">
                <h2 className="text-sm font-medium text-foreground">On this device</h2>
                <p className="text-xs text-subtle tabular-nums">{history.length} saved</p>
              </div>
              <ul className="mt-3 divide-y divide-border">
                {history.map((item) => (
                  <li key={item.id} className="flex items-stretch gap-2">
                    <button
                      type="button"
                      onClick={() => restore(item)}
                      className={
                        "min-h-11 flex-1 py-3 text-left " +
                        (item.id === activeId ? "text-foreground" : "text-muted hover:text-foreground")
                      }
                    >
                      <span className="block text-sm">{firstLine(item.source)}</span>
                      <span className="mt-1 block text-xs text-subtle tabular-nums">
                        {formatWhen(item.createdAt)} · {item.length}
                      </span>
                    </button>
                    <button
                      type="button"
                      aria-label="Remove saved prompt"
                      onClick={() => remove(item.id)}
                      className="inline-flex min-h-11 min-w-11 items-center justify-center text-subtle hover:text-foreground"
                    >
                      <Trash2 className="size-4" aria-hidden="true" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="mt-10 text-xs text-subtle">Saved prompts stay on this device.</p>
          )}
        </section>

        <section
          className="border-t border-border bg-surface px-5 py-6 sm:px-8 lg:overflow-y-auto lg:border-t-0 lg:border-l lg:px-10 lg:py-6"
          aria-live="polite"
          aria-busy={pending}
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-medium tracking-kicker text-muted uppercase">The prompt</p>
              <h2 className="mt-3 font-display text-3xl leading-tight tracking-display">
                {prompt ? "Ready to copy" : "Waiting on a brief"}
              </h2>
            </div>
          </div>

          {pending ? <div className="sweep mt-6" aria-hidden="true" /> : <div className="mt-6 h-px bg-border" />}

          {error ? (
            <p role="alert" className="mt-4 rounded-md bg-danger-surface px-3 py-3 text-sm text-danger">
              {error}
            </p>
          ) : null}

          {prompt ? (
            <p className="mt-4 line-clamp-2 font-display text-base text-muted italic">{source.trim()}</p>
          ) : null}

          <div className={prompt ? "rise mt-8" : "mt-8"}>
            {prompt ? (
              <>
                <PromptBlock
                  mark="A"
                  title="Act as"
                  copied={copied === "act"}
                  onCopy={() => void onCopy("act", prompt.actAs)}
                >
                  <p className="whitespace-pre-wrap text-base leading-relaxed">{prompt.actAs}</p>
                </PromptBlock>
                <PromptBlock
                  mark="R"
                  title="Request"
                  copied={copied === "request"}
                  onCopy={() => void onCopy("request", prompt.request)}
                >
                  <p className="whitespace-pre-wrap text-base leading-relaxed">{prompt.request}</p>
                </PromptBlock>
                <PromptBlock
                  mark="T"
                  title="Terms"
                  copied={copied === "terms"}
                  onCopy={() => void onCopy("terms", prompt.terms.map((term) => `- ${term}`).join("\n"))}
                >
                  <ol className="list-decimal space-y-3 pl-5 text-base leading-relaxed">
                    {prompt.terms.map((term, index) => (
                      <li key={`${index}-${term}`}>{term}</li>
                    ))}
                  </ol>
                </PromptBlock>
              </>
            ) : (
              <ol className="space-y-6">
                {GUIDE.map((item) => (
                  <li key={item.mark} className="grid grid-cols-[2.5rem_minmax(0,1fr)] gap-4">
                    <span className="font-display text-2xl leading-none tracking-display text-subtle">
                      {item.mark}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-foreground">{item.title}</p>
                      <p className="mt-1 text-sm text-muted">{item.body}</p>
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </div>

          {prompt ? (
            <div className="mt-8 border-t border-border pt-6">
              <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                <button
                  type="button"
                  onClick={() => void onCopy("all", markdown)}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary-hover"
                >
                  {copied === "all" ? (
                    <Check className="size-4" aria-hidden="true" />
                  ) : (
                    <Copy className="size-4" aria-hidden="true" />
                  )}
                  {copied === "all" ? "Copied" : "Copy full prompt"}
                </button>
                <button
                  type="button"
                  onClick={() => void compose(true)}
                  disabled={pending}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-border-strong px-4 text-sm font-medium text-foreground hover:bg-background disabled:opacity-40"
                >
                  <RefreshCw className="size-4" aria-hidden="true" />
                  Different angle
                </button>
                <button
                  type="button"
                  onClick={download}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md px-4 text-sm text-muted hover:text-foreground"
                >
                  <Download className="size-4" aria-hidden="true" />
                  Download
                </button>
              </div>

              <details className="mt-6">
                <summary className="text-sm font-medium text-foreground">Preview the full prompt</summary>
                <pre className="mt-4 whitespace-pre-wrap font-sans text-sm leading-relaxed text-foreground">
                  {markdown}
                </pre>
              </details>
            </div>
          ) : null}

          <p className="sr-only">{copied ? "Copied to clipboard." : ""}</p>
        </section>
      </main>
    </div>
  );
}

function Field({
  id,
  label,
  optional,
  value,
  onChange,
  placeholder,
  maxLength,
}: {
  id: string;
  label: string;
  optional?: boolean;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  maxLength: number;
}) {
  return (
    <div>
      <label htmlFor={id} className="text-sm font-medium text-foreground">
        {label} {optional ? <span className="font-normal text-subtle">optional</span> : null}
      </label>
      <input
        id={id}
        value={value}
        maxLength={maxLength}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="mt-2 h-11 w-full rounded-md border border-border bg-surface px-3 text-base text-foreground placeholder:text-subtle"
        suppressHydrationWarning
      />
    </div>
  );
}

function PromptBlock({
  mark,
  title,
  copied,
  onCopy,
  children,
}: {
  mark: string;
  title: string;
  copied: boolean;
  onCopy: () => void;
  children: ReactNode;
}) {
  return (
    <section className="border-b border-border py-6 first:pt-0">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="flex items-baseline gap-3">
          <span className="font-display text-2xl leading-none tracking-display">{mark}</span>
          <span className="text-xs font-medium tracking-kicker text-muted uppercase">{title}</span>
        </h3>
        <button
          type="button"
          onClick={onCopy}
          aria-label={copied ? `${title} copied` : `Copy ${title}`}
          className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-md text-muted hover:text-foreground"
        >
          {copied ? (
            <Check className="size-4" aria-hidden="true" />
          ) : (
            <Copy className="size-4" aria-hidden="true" />
          )}
        </button>
      </div>
      {children}
    </section>
  );
}
