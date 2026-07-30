---
title: "Build the world before you test the agent"
description: "How simulated worlds turn plausible agent behavior into reproducible bugs, and what one structured-decision lab found: 55 failures that action-only grading missed."
pubDate: 2026-07-30
tags: [ai, agents, testing]
dek: "A practical way to turn plausible agent behavior into reproducible bugs, safer flows, and better CLI tools."
hero:
  src: "/images/blog/simulation-worlds/hero-paired-worlds.svg"
  alt: "Diagram of two almost identical test worlds fed to the same agent with the same task. The only difference between them is one highlighted fact: the trigger is two days old in world A and forty-five days old in world B."
  caption: "Same agent. Same task. One changed fact."
---

<aside class="tldr">
<span class="tldr-label">TL;DR</span>

One good demo tells you an agent *can* work, not that it *does*. I build small simulated worlds: synthetic states with rules, a task, and a hidden expected outcome, judged by a checker outside the agent. Worlds that differ by one designed fact turn "the output felt off" into a named, reproducible bug. The case study below used the smallest version of the idea: one-turn structured decisions against a hidden contract, with executable tool worlds as the broader extension. On one fixed authored corpus of 140 attempts, 55 valid outputs chose an acceptable action and still failed at least one other scored condition. That gap is the point of the method.
</aside>

A polished demo is a terrible test. Give an agent one clean situation and it can look thoughtful, careful, even wise. That proves possibility, not reliability. An agentic workflow is a model plus instructions, tools, state, and feedback; the demo exercises one path through all five at once, usually the one chosen to look good.

What I wanted was a place where failure is cheap, visible, and repeatable. This post is the method, and what it caught the first time I ran it for real.

## What a world is

A **world** is a small, self-contained test situation: visible initial conditions, rules, a task, a hidden truth (the outcome a competent operator would reach), and a result you can check from the outside. Worlds come in layers, from a frozen decision fixture up to an executable environment with tools and observable state you can diff before and after the agent acts.

The case study here runs at the smallest useful layer: frozen inputs, hidden expected constraints, one structured JSON proposal, a deterministic checker. Nothing executed and no state changed while the model worked; the executable layers are part of the recommendation, not evidence this benchmark produced.

Two design rules hold at every layer. The agent never sees the expected decision or the judging criteria, only the material it would see during normal work; a visible answer key tests reading comprehension, not judgment. And **volume does not fix a badly designed world**: synthetic worlds are cheap, safe, high-volume, and full of rare cases on demand, but they say nothing about prevalence in the wild and they inherit their author's blind spots.

## Change one fact

The useful move is not generating a pile of scenarios. It is building **paired worlds**: two worlds identical in every visible respect except one material fact. The trigger is fresh, then stale. The evidence is verified, then dubious.

A clean pair gives you a **designed contrast**. If the decision should track the changed fact and doesn't, you have found insensitivity. If it flips when nothing material changed, you have found jumpiness. That turns vague unease into a named bug.

Two honest limits, learned by auditing my own suite. Even a perfect contrast shows behavioral sensitivity, not an internal mechanism. And most of my pairs are not perfect: only one of fourteen has a complete structural test proving the visible projections differ only in the intended fact. World and case IDs also differ by design, and only three pairs share identical visible scenario tags. The rest are designed contrasts, not controlled experiments.

Pair results deserve the right counting unit too. Counting each pair under one repeat index as a single unit, rather than copying one verdict onto both peers, 63 of 70 units passed the pair-consistency check and 7 failed, one because a peer output was schema-invalid and unavailable for comparison. The audit gap is itself useful: the lab also tests whether the world design is strong enough. Right now: one pair proven, thirteen to go.

## Repetition and seeds

Language models vary from run to run, so one run says almost nothing. My core set repeats each world five times as parallel, independent sessions. Independent is the load-bearing word: the runs are **samples, not a committee**, and voting would hide the instability I am looking for.

A word about seeds. Where a provider supports them, matched seeds across paired peers are good noise control. My reported runs used none: no provider seed was passed or recorded, the repeat index served only to group peers, and invocation order was not randomized. Those controls belong to the next run, not this one.

What five repeats do buy is a per-world stability read: the action was stable across repeats in 21 of 28 worlds, the complete scored outcome in only 10. Seven worlds passed every scored check 0 of 5 times; three passed 5 of 5. The pooled average hides that spread. These 28 worlds are a fixed, purposively authored corpus, not a random sample. I report the numbers as descriptive corpus results, not population estimates.

## The score lives outside the agent

The separation of judging from doing is the whole game. The agent's final message is a *claim*; the checkable outcome is *evidence*. A model grading its own judgment gives you fluent self-praise.

In this benchmark the evidence was the proposal itself. The checker, a deterministic program outside the agent, evaluated the parsed fields against the hidden contract: action, buyer role, channel, evidence references, timing and expiry, pair behavior, hard safety gates.

An executable world keeps a fuller trace: tool calls, evidence IDs touched, timing, state diffs, rejection reasons. This benchmark kept no such trace. The retained report stores parsed decisions, failure codes, and runtime metadata, not raw model outputs or rendered prompts. The cost is real: once a checker defect is found, old runs cannot be independently rescored.

The checker has limits too. Supporting evidence nested inside account-fit factors is collected after the top-level overlap check runs, so some cross-field contradictions can slip through. Free-text fidelity and any real side effect sit outside the score entirely. A full pass means exactly "every implemented scored check passed." It does not certify semantic fidelity or execution correctness.

## What the worlds caught

Here is the proof block, from a decision agent I built for B2B outreach. It proposes a next action (proceed to human review, wait, reject, or research more) under a strict business contract, and nothing sends without exact human approval. The case is narrow, but it gives the method concrete evidence. The core corpus is 28 authored worlds repeated five times: 140 attempts, 139 schema-valid proposals, one invalid.

<figure>
<img src="/images/blog/simulation-worlds/proposal-outcome-decomposition.svg" alt="Chart decomposing all 140 attempted runs on one denominator: 66 valid outputs passed the action check and every scored proposal-contract check, 55 chose an acceptable action but failed at least one other scored condition, 18 failed the action check, and 1 output was schema-invalid. Grading the action alone would have called the 55 fine." loading="lazy" />
<figcaption>All 140 attempts on one denominator. The orange 55 are the finding: acceptable action, failed contract. Fixed authored corpus, scored proposal-contract checks; not production reliability.</figcaption>
</figure>

<p class="callout proof-callout">Action-only grading accepts 121 of 139 valid outputs. Fifty-five of those 121 fail another scored condition.</p>

<aside class="methods-box">
<span class="methods-label">How these numbers were produced</span>
<dl>
<div><dt>Corpus</dt><dd>28 authored core worlds × five repeats: 140 attempts, 139 schema-valid. One model and provider alias.</dd></div>
<div><dt>Protocol</dt><dd>One request per attempt, max one turn, one structured JSON proposal. No application tools executed.</dd></div>
<div><dt>Versions</dt><dd>Prompt v5, evaluator v1, adapter v1. Declared reasoning high, concurrency two.</dd></div>
<div><dt>Controls</dt><dd>No provider seed passed or recorded; invocation order not randomized; peers grouped by repeat index only.</dd></div>
<div><dt>Sample</dt><dd>Fixed purposive corpus, not a random sample. Scores describe this corpus only.</dd></div>
<div><dt>Retention</dt><dd>The report keeps parsed decisions, scores, runtime metadata, and the suite hash. Raw model outputs were not preserved.</dd></div>
<div><dt>Compound suite</dt><dd>A separate six-world challenge suite had prior exposure under prompt v3 before its v5 rerun.</dd></div>
</dl>
</aside>

For orientation: every scored check passed in 66 of 140 attempts (47%); the action check alone passed in 121 of 139 valid outputs (87%). Different denominators, nested criteria. Behind the contract, over the 139 valid outputs: buyer role 133, required evidence 135, channel 123, timing and expiry 111. Timing was the weakest measured dimension, the kind of failure a headline score hides. Fifty-five valid proposals passed action-only grading while failing another scored condition.

Three cases, in plain English:

- **Seductive signal.** Faced with compelling but forbidden evidence, the action check passed in 5 of 5 runs, and a forbidden ID appeared in at least one scored reference field in 5 of 5. Full pass: 0 of 5. The ID alone does not prove reliance, but the contract forbids referencing it, and the reference is right there in the output.
- **Right headline, broken details.** In an abstain-and-reject scenario, the action check passed in 5 of 5 runs while timing failed in 5 of 5, with expiry and unknown-reference failures in subsets of runs. Full pass: 0 of 5.
- **Freshness stop.** The correct move was to wait for fresher data. The action check passed in 5 of 5 runs; timing failed in 5 of 5. Full pass: 0 of 5. The proposal got *what* to do right, but not *when*.

That third case comes from a separate six-world compound suite, and its history matters. It was evaluated once under an earlier prompt version (9 of 30 full passes), then versioned and revised alongside prompt and evaluator changes, and rerun under the current one: 30 attempts, 25 acceptable actions, 15 full passes, timing again weakest at 22 of 30 while required evidence held at 30 of 30. It stayed process-separated through the current cycle, but it had seen prior exposure, so I will not call it a holdout. A genuinely fresh sealed suite remains on the to-do list.

None of these failures show up if you grade the headline action. Each would matter if the proposal governed an unsupervised flow.

## Two buckets of bugs

Honesty requires splitting the findings. **Bucket one: agent proposal defects**, like the cases above. **Bucket two: harness defects**, bugs in my own lab, found with mutation tests (feed the checker deliberately broken inputs and demand it fails), structural invariants, and independent review. Conflating the buckets is how you "fix the model" when the test was broken, and a broken judge can make a broken agent look good. The harness bugs were not hypothetical:

- Invented proof IDs were accepted as evidence → unknown proof references now fail closed.
- Timezone-less and impossible timestamps passed → strict RFC3339 validation.
- A run could skip its counterfactual peer and still "pass the pair" → incomplete pairs fail closed.
- Weak secondary evidence could carry a decision → explicit source-authority semantics, with fact-specific gates.
- `research_more` could be vague, unaffordable, or uncited → the step must be named, costed, bounded, and referenced.
- One supposedly paired case differed in *more* than the intended fact → a full projection invariant now guards that pair; the same audit is still open for the other thirteen.

Every one of these was a way the lab could have lied to me. Fixing them hardened detection; it did not, by itself, improve the agent, and I ran no frozen before-and-after intervention that could have measured improvement. Detection is the claim.

## The next layer: executable worlds and the CLI

This benchmark stopped at the proposal. Nothing here executed a tool, retried a request, or sent anything, so it says nothing about CLI idempotency, dry runs, exit codes, or side effects. Those questions live one layer up, where an agent is your CLI's least forgiving user: it does exactly what your interface invites and brings no common sense to a bad error message. Executable worlds can surface the bugs humans step over: errors that don't say what failed or what to do next; exit status 0 on failure; non-idempotent commands that double-execute on retry; no `--dry-run` for an irreversible action; output a human can skim but a parser can't; hidden side effects. The same interface flaws can trip up a hurried human. Executable worlds make them easier to reproduce.

## The loop

<figure>
<img src="/images/blog/simulation-worlds/method-loop.svg" alt="Vertical diagram of the testing loop in its full form: build the world, run parallel independent sessions, read the observable trace, let an external scorecard check world state, name a reproducible bug, fix the flow CLI or gate, then rerun so the world becomes a regression test." loading="lazy" />
<figcaption>The loop in its full form. Worlds that caught a bug are never deleted; they become the regression suite.</figcaption>
</figure>

In practice: create a world, reproduce a failure, name the bug, change the flow or the CLI or the gate, rerun the *same* worlds, and keep them forever as regression tests. My run completed the first half of that loop, detection plus harness hardening; the rerun-after-fix half is the next cycle.

## The honest boundary

A **sealed world** is one the tuning process never touches, so it stays an honest exam rather than becoming training data. None of my current suites qualifies: the compound suite had prior exposure, and the core corpus informed the fixes. The trust ladder, in order, with no skipping: paired synthetic worlds for diagnosis → compound worlds for realism → a genuinely fresh sealed suite → shadow mode on real inputs with no actions → one controlled live run behind a human gate → gradual dogfooding.

So here is exactly what this study shows. On one fixed, authored corpus of structured outreach decisions, action-only grading missed many proposal-contract failures that an external deterministic checker caught, and attacking the checker made detection sharper. That is detection and evaluator hardening: not measured agent improvement, not real-world prevalence, not general reliability or production readiness. A good score, when I earn one, will mean the agent passed the worlds I thought to build. Nothing more.

What the worlds give you is more modest and more valuable than a launch signal: every failure they surface is one that didn't happen to a real person. Good simulation does not make the agent look capable. It makes failure legible, reproducible, and fixable.
