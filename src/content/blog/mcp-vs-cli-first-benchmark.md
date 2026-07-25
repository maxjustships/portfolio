---
title: "I benchmarked MCP vs CLI-first agents. The winner depends on your client."
description: "Across 95 real LLM sessions, replacing MCP tools with a generated CLI saves ~31% of tokens on clients without progressive tool disclosure — and loses where disclosure is built in."
pubDate: 2026-07-25
tags: [mcp, llm, agents, benchmarks]
---

MCP servers dump their entire tool catalog into your agent's context. I wanted to know how much that actually costs — and whether replacing native MCP tools with a generated CLI + skill ("CLI-first") is worth it. So I built deterministic fixtures, ran 95 real LLM sessions across two agent clients, and measured provider-reported tokens, not estimates.

**TL;DR: CLI-first is not a universal MCP replacement. It wins by ~31% on clients without progressive tool disclosure — and loses to built-in disclosure where that exists.**

## Setup

- **Fat fixture**: 150 read-only tools across inventory/billing/workforce/support/logistics domains, deterministic seeded data. Catalog: ~33k tokens of schemas.
- **Small fixture**: 24 tools, ~4.6k tokens of schemas.
- **Model**: one weak-ish model, high reasoning, same for every run. Task: answer a deterministic question via tools, exact-match assertion (`ANSWER: <json>`).
- **Clients**: Hermes (has automatic `tool_search` — when a catalog exceeds ~27k tokens it defers tools behind search/describe) and Codex CLI (no progressive disclosure: every configured MCP tool goes straight into the model catalog — verified via MCP tool events in traces).

## Result 1: small catalog — native wins

30 runs (5 scenarios × 3 reps × 2 modes), 100% success both modes.

| Mode | Mean tokens (in+out) | Wall time |
|---|---:|---:|
| Native tools | 5,037 | 10.7 s |
| CLI-first (cold) | 7,449 | 23.6 s |

Discovery costs turns. On a small catalog you pay for `--list`/`--help` roundtrips and get nothing back.

## Result 2: fat catalog inside a client WITH progressive disclosure — disclosure wins

45 runs (5 × 3 × 3 modes), 100% success everywhere.

| Mode | Mean tokens | Wall time |
|---|---:|---:|
| Naive full injection | ~27.5k cold input / 4,599 median* | 16.3 s |
| Hermes tool_search | 5,694 | 16.5 s |
| CLI-first (cold) | 9,339 | 32.8 s |

\* Naive is bimodal: provider prompt caching rescued warm-prefix runs (~4.6k) but cold runs paid the full ~27.5k. Cache helps billing; it doesn't free the context window.

The "MCP is bloated" problem is real — and modern clients already solve it internally. Hermes deferred 154 tools behind `tool_search` and beat CLI-first on both tokens and latency.

## Result 3: fat catalog on a client WITHOUT disclosure — CLI-first wins

20 runs on Codex CLI (5 × 2 × 2), 100% success everywhere.

| Mode | Mean tokens used | Wall time |
|---|---:|---:|
| Naive MCP (150 tools) | 18,290 | 23.6 s |
| CLI-first (cold) | 12,675 (−31%) | 39.9 s |

Codex totals include its ~5.5k system prompt, so the marginal gap is larger than 31%. CLI-first won on 4 of 5 scenarios (fifth was a wash). The cost: 1.7× wall time from cold process startup.

## The latency finding that matters more than tokens

Cold CLI means spawning a process + MCP server per step: ~1.7 s per call. A persistent session brings that to **2–10 ms** (warm lane, same fixture). Any serious CLI-first runtime needs a daemon.

## Bonus: the sandbox matrix nobody documents

While dogfooding I probed what a sandboxed agent shell (Codex `workspace-write`) can actually do:

| Channel | Works? |
|---|---|
| Spawning an MCP stdio server (mcp2cli-style) | ❌ silently produces zero output |
| Unix socket connect | ❌ PermissionError |
| Even creating a TCP socket | ❌ seccomp blocks `socket()` |
| Read/write files in workspace | ✅ |

A warm daemon can only reach a sandboxed agent through the filesystem — request/response files in the shared workspace. If your agent runtime sandboxes tool execution, test this matrix before designing anything.

Second dogfood lesson: an agent with shell access will **route around your gate** if you let it. My first run ignored the CLI, read the config to find the server module path, imported it directly, and burned 62k tokens freelancing. A policy gate only governs the path through the gate — sandbox and least-exposure config (the client must never see the server's command line) are the outer boundary.

## What this means

1. **Catalog size decides the interface.** Small → native tools. Large → progressive disclosure, whoever provides it.
2. **If your client has tool search, CLI-first adds nothing.** The platform ate that layer.
3. **If your client doesn't, CLI-first saves ~31%** — and policy gating (read-only allowlists, mutation rejection, metadata-only audit) is a second, independent reason to put a CLI between agents and MCP servers.
4. **Warm sessions are non-negotiable** for interactive use.

## What I built

mcpgate — warm daemon + policy gate. Dogfood verified: same scenario inside Codex's *default* workspace-write sandbox via the file bridge — 12,010 tokens (CLI-first economics, −17% vs naive's 14,520), 19.6 s wall (vs 41.3 s cold mcp2cli, vs 15.5 s naive), correct answer, metadata-only audit trail, read-only policy enforced daemon-side. And it's the only one of the three that runs in the default sandbox at all.

## Methodology & caveats

One model, one provider, synthetic fixtures, small rep counts — no cross-model significance. Token accounting differs per client (Hermes input/output counters vs Codex total); I only compare within-client. All fixtures read-only; traces metadata-only. Lab repo with all traces and the full decision doc: [link pending public release].
