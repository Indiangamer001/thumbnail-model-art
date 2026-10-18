---
name: art-prompt-architect
description: Expand a brief, rough, or vague request into an extensive, polished, copy-ready AI prompt using ART — Act As, Request, Terms. Use when the user asks to write, rewrite, expand, structure, optimize, or improve a prompt, especially when they mention ART. Do not use this skill to replace directly requested task execution.
---

# ART Prompt Architect

## Purpose
Turn a user's simple prompt or idea into a thorough, practical, ready-to-use prompt in the **ART Framework**:

- **A — Act As:** Give the AI a role and the relevant expertise or perspective.
- **R — Request:** Define precisely what the AI should do, the context, and the intended outcome.
- **T — Terms:** Define instructions, constraints, scope, quality bar, required deliverables, and output format.

Default to a detailed, copy-ready prompt when the user has not specified a length. Adapt to explicit requests for concise output.

## When to activate
Apply when the user asks for a prompt, prompt enhancement, prompt rewriting, prompt engineering, an ART conversion, or a reusable instruction for another AI tool. In a conversation clearly about prompt rewriting, a short raw request can be treated as source material to expand.

Do **not** automatically turn ordinary requests to *perform a task* into prompts. If the user directly asks to create an image, analyze information, write an email, or perform other work, complete that task instead of rewriting the instruction unless the user's intent is clearly prompt generation.

## Workflow

1. **Understand the intent.** Identify the task, audience, purpose, target AI/tool (if stated), existing constraints, and the deliverable. Preserve all important specifics supplied by the user.
2. **Choose the role (A).** Assign a relevant expert persona with specific capabilities. Avoid fabricated achievements, credentials, or unnecessary role inflation.
3. **Elaborate the task (R).** Make the action and outcome explicit. Include relevant steps and context, but do not broaden the user's goal or insert unsupported facts.
4. **Specify execution rules (T).** Add relevant scope boundaries, format, depth, tone, technical specs, quality checks, edge cases, and acceptance criteria. Match requirements to the domain rather than copying the same rules every time.
5. **Address missing details responsibly.** Ask a concise clarifying question only if information is indispensable to produce a useful prompt. Otherwise keep the prompt usable with reasonable, clearly marked defaults or editable placeholders such as `[TARGET AUDIENCE]` when necessary. Never present guesses as the user's preferences.
6. **Perform a quality pass.** Confirm the prompt is coherent, internally consistent, actionable, non-repetitive, correctly scoped, and ready to copy and paste.

## Required output

Unless the user requests a different format, deliver a single prompt using the following headings:

### A — ACT AS
[Specific role, expertise, approach, and priorities.]

### R — REQUEST
[Expanded user objective, context, tasks, and target outcome.]

### T — TERMS
[Clearly organized instructions: scope, technical/creative requirements, constraints, output structure, expected deliverables, quality checks, and success criteria as applicable.]

Do not prepend a lengthy explanation. The expanded prompt should be directly usable. If the user requests alternatives, produce clearly separated variants. If the user requests concise output, adapt the length without discarding ART's core components.

## Principles

- **Fidelity first:** Retain the user's original goal and any explicit instructions.
- **Useful depth:** Be extensive where it improves results, not simply wordy.
- **Domain-aware specificity:** Creative work may need composition, style, and technical details; research work may need source quality, dates, citations, and uncertainty; programming may need environment, interfaces, testing, and error handling.
- **No overcommitment:** Do not make claims about tools, data, sources, or actions that have not been established.
- **No hidden assumptions:** Use placeholders or specify options rather than pretending unknown details were provided.
- **Ready to execute:** Phrase the expanded prompt in imperative language suitable for the target AI.
- **Respect direct intent:** A request to actually do something is not inherently a request to create a prompt.

## Mini example

**Source:** "Give me a prompt to research the best settings for smooth PUBG gameplay."

**Expanded prompt:**

### A — ACT AS
Act as a PC gaming performance analyst with expertise in PUBG: BATTLEGROUNDS, frame-time consistency, Windows graphics performance, GPU drivers, and CPU bottlenecks.

### R — REQUEST
Investigate and recommend settings and troubleshooting steps to improve PUBG gameplay smoothness, prioritizing consistent frame times and reduced stutter while preserving practical image clarity. Explain which recommendations depend on hardware and testing results.

### T — TERMS
- Ask for essential system specifications if absent, or explicitly label advice as general.
- Separate in-game settings, Windows/driver configuration, and diagnostic testing.
- Explain trade-offs between average FPS, 1% lows, input latency, visual quality, and stability.
- Prefer safe, reversible changes; avoid bypassing game protections or anti-cheat systems.
- Cite reliable sources when current version-specific claims are needed.
- Present a prioritized set of actions and a repeatable measurement procedure.
- Clearly distinguish verified facts from hypotheses.

## Updating the skill
In future conversations, follow the user's latest explicit instructions if they ask to change the framework, output length, tone, or structure.
