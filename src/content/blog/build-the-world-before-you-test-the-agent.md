---
title: "Build the world before you test the agent"
description: "A practical way to turn plausible agent behavior into reproducible bugs, safer flows, and better CLI tools using executable worlds, paired scenarios, and an external scorecard."
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

One good demo tells you an agent *can* work, not that it *does*. I build small executable worlds: synthetic states with tools, rules, a task, and a hidden expected outcome. I run independent agent sessions against them and score only what the world shows afterward, never what the agent claims. Worlds that differ by exactly one fact turn "the output felt off" into a named, reproducible bug. In my first full lab, the agent picked the correct high-level action in 87% of valid runs but passed the complete execution contract in 47% of attempted runs. That gap is the point of the method.
</aside>

A polished demo is a terrible test. Give an agent one clean situation and it can look thoughtful, careful, even wise. That proves possibility, not reliability. An agentic workflow is a model plus instructions, tools, state, and feedback. Each part fails in its own way, and the demo exercises one path through all five at once. Usually the path chosen to look good.

What I wanted instead was a place where failure is cheap, visible, and repeatable. This post is the method I ended up with, and what it caught the first time I ran it for real.

## What a world is

A **world** is a small executable environment: an initial state, a set of tools, the rules the agent operates under, a task, a hidden truth (the outcome a competent operator would reach), and an observable result. Executable is the key word. The world is not a prompt with a gold answer attached; it is a thing the agent acts on, and you can diff the state before and after.

The hidden truth matters as much as the state. The agent never sees the expected decision or the judging criteria, only the material it would see during normal work. If the agent can see the answer key, you are testing reading comprehension.

## Synthetic data is a lever, not a compromise

There is a reflex that synthetic data is what you use when you cannot afford real data. I find that backwards for this job. Synthetic worlds are unusually strong where live testing is weakest:

- **Cheap and safe.** Nobody's inbox, data, or budget is involved when the agent does something dumb. Failures happen where they cost nothing.
- **High volume.** You can run hundreds of sessions before lunch, which is what it takes to see variance instead of anecdotes.
- **Controlled comparison.** You decide exactly which facts exist, so you can change one of them and mean it.
- **Rare cases on demand.** You don't have to wait for reality to produce the expired trial, poisoned evidence, or budget that ran out yesterday.

The weaknesses are just as real. Synthetic worlds tell you nothing about how often a situation occurs in the wild, how a real user responds, whether your live integrations behave, what rate limits do to your retry logic, or which failure classes you simply failed to imagine. They inherit the blind spots of whoever wrote them. And one hard rule: **volume does not fix a badly designed world.** A thousand runs of a world that doesn't capture the decision you care about is a thousand confirmations of nothing.

## Change one fact

The useful move is not generating a pile of scenarios. It is building **paired worlds**: two worlds identical in every visible respect except one material fact. The trigger is fresh, then stale. The contact has buying authority, then doesn't. The evidence is verified, then dubious. The research budget exists, then is spent.

A pair gives you a causal question. If the agent's decision should flip and doesn't, you have found insensitivity to a fact that matters. If it shouldn't flip and does, you have found jumpiness. Either way you can point at exactly one changed variable and say: this caused that. That is what turns a vague unease about quality into a named bug.

Once the pairs work, add **compound worlds** with several pressures at once, conflicting sources, and partial information. Real situations never arrive one variable at a time. Pairs diagnose; compounds add realism.

## Seeds and samples

Language models vary from run to run, so one run says almost nothing. Where the provider supports it, a **seed** pins the sampling configuration of a run. Treat seeds as best-effort noise control, not a determinism guarantee. Identical seeds can still diverge. My practice is to run both peers of a pair under the same seed and config to reduce sampling noise, then repeat the pair across several seeds to check that the difference is robust rather than one lucky draw. If seeds are unavailable, match everything you can, including config, tool order, and prompts, then run more repeats.

Those repeats should be parallel, independent sessions. Independent is the load-bearing word: the runs are **samples, not a committee**. A majority of correlated runs can be confidently wrong, and voting hides the instability you are looking for. You are measuring a distribution, not electing an answer.

## The score lives outside the agent

Every run produces a **trace**: the full record of tool calls, arguments, intermediate outputs, and the resulting world state. Judging happens afterward. A **scorecard**, implemented as a deterministic checker outside the agent, reads the trace and the world and verifies the contract: Was the action right? Was it allowed, evidenced, well-timed, executed once, and sent through an acceptable channel?

The separation is the whole game. The agent's final message is a *claim*; the observable state of the world is *evidence*. A model grading its own judgment gives you fluent self-praise. An external checker can show that the agent chose the right action and then executed it wrong: sent twice, cited a forbidden source, or missed the deadline it correctly identified. Correct high-level action is not safe execution, and only an outside view can see the difference.

## What the worlds caught

Here is the proof block, from a decision agent I built for B2B outreach. It proposes a next action (proceed to human review, wait, reject, or research more) under a strict business contract. Nothing sends without exact human approval. The product doesn't matter here; the numbers do. The main set had 140 attempted runs and 139 valid outputs; one model output failed schema validation. On headline action alone, it looked strong. On the whole contract, it didn't.

<figure>
<img src="/images/blog/simulation-worlds/action-vs-strict-execution.svg" alt="Bar chart comparing the same runs measured two ways: correct high-level action passes 87 percent, 121 of 139 valid runs; full strict execution passes 47 percent, 66 of 140 attempted runs." loading="lazy" />
<figcaption>A correct answer can hide a broken workflow. The two bars measure different things, and that is the point.</figcaption>
</figure>

<p class="callout">A naive check reports 87%. Complete execution passes 47%. The 39.9-point gap is where the bugs live.</p>

The supporting dimensions show what the stricter definition checked:

- Correct buyer role: 133/139 (96%)
- Acceptable channel: 123/139 (88%)
- Required evidence present: 135/139 (97%)
- Timing and expiry respected: 111/139 (80%)
- Consistent across pairs: 126/139 (91%)

To be precise about what 47% means: not that half the outputs were obviously bad. It means roughly half the attempted runs contained at least one material contract failure. The decision could be right while the reasoning was contaminated, the timing was wrong, or a rule was quietly bent. A naive reviewer reading final messages would have signed off on most of them.

A second, sealed-and-compound set (30 runs, held out from any tuning) landed in the same place: correct action 83%, full strict pass 50%, and timing the weakest dimension at 73%. Required evidence remained at 100%, so that dimension held up even while timing failed.

Three cases, in plain English:

- **Seductive signal.** Faced with a compelling but forbidden signal, the agent correctly chose `reject` in 5 of 5 runs but referenced the forbidden evidence in all 5. Strict pass: 0/5. Right outcome, contaminated reasoning.
- **Right headline, broken details.** In an abstain-and-reject scenario, the action was `reject` in 5 of 5 runs, but the timing expectation failed in all 5, alongside expiry and evidence defects. Strict pass: 0/5.
- **Freshness stop (sealed).** A holdout case where the correct move was to wait for fresher data: action `wait` in 5 of 5, timing failed in 5 of 5. Strict pass: 0/5. The agent knew *what* to do, not *when*.

None of these show up if you grade the headline action. All of them matter the moment the flow runs unsupervised.

## Two buckets of bugs

Honesty requires splitting the findings. **Bucket one: agent-behavior defects**, like the cases above, observed in repeated world runs and reproducible on demand. **Bucket two: harness defects**, bugs in my own lab found by attacking it with mutation tests (feed the checker deliberately broken traces and demand it fails), structural invariants, and independent review. Conflating the buckets is how you "fix the model" when the test was broken. The harness bugs were not hypothetical:

- Invented proof IDs were accepted as evidence → unknown proof references now fail closed.
- Timezone-less and impossible timestamps passed → strict RFC3339 validation.
- A run could skip its counterfactual peer and still "pass the pair" → incomplete pairs fail closed.
- Weak secondary evidence could carry a decision → explicit source-authority semantics, with fact-specific gates.
- `research_more` could be vague, unaffordable, or uncited → the step must be named, costed, bounded, and referenced.
- One supposedly paired case differed in *more* than the intended fact → visible projections are now structurally compared after removing only the changed fact.

Every one of these was a way the lab could have lied to me. Fix the harness first; its verdicts are the foundation everything else stands on.

## The CLI is part of the test surface

The same worlds exercise more than the model. If your agent drives CLI tools, as most useful agents do, the tools get tested by their least forgiving user. An agent does exactly what your interface invites; it brings no common sense to a bad error message. World runs can surface CLI bugs that humans step over: errors that don't say what failed or what to do next; exit status 0 on failure; commands that aren't idempotent, so a retry double-executes; no `--dry-run` for an irreversible action; output a human can skim but a parser can't; hidden side effects; retry semantics that punish the polite caller. If a careful agent misuses your tool, a hurried human will too. The agent just reports it more reliably.

## The loop

<figure>
<img src="/images/blog/simulation-worlds/method-loop.svg" alt="Vertical diagram of the testing loop: build the world, run parallel independent sessions, read the observable trace, let an external scorecard check world state, name a reproducible bug, fix the flow CLI or gate, then rerun so the world becomes a regression test." loading="lazy" />
<figcaption>The loop. Worlds that caught a bug are never deleted; they become the regression suite.</figcaption>
</figure>

In practice: create a world, reproduce a failure, name the bug, change the flow or the CLI or the gate, rerun the *same* worlds, then keep those worlds forever as regression tests. New worlds come from bugs found in the wild; old worlds guard the bugs already fixed. A sample of the ledger:

| Verified defect | System change |
| --- | --- |
| Right action, forbidden evidence cited | Evidence gate hard-fails regardless of action |
| Unknown proof ID accepted as evidence | Unknown proof references fail closed |
| Timezone-less or impossible date passed validation | Strict RFC3339 validation |
| Missing counterfactual peer escaped comparison | Incomplete pairs fail closed |
| Vague or unaffordable research step | Exact named, costed, bounded, referenced step |
| Paired worlds diverged in two facts | Structural diff of visible projections per pair |

## The honest boundary

A **sealed world** is one the tuning process never touches. No prompt edits or gate changes are informed by it, so it stays an honest exam rather than becoming training data. The trust ladder, in order, with no skipping: paired synthetic worlds for diagnosis → compound synthetic worlds for realism → sealed worlds for an untainted check → shadow mode on real inputs with no actions → one controlled live run behind a human gate → gradual dogfooding.

And hold two truths about scores. A bad strict score becomes useful only after the scorecard itself has been tested. Then it exposes failures that were already there and invisible. A good strict score is not a launch signal; it means the agent passed the worlds you thought to build. Synthetic success is not battle readiness, and no world replaces live dogfooding. What the worlds give you is more modest and more valuable: every failure they surface is one that didn't happen to a real person.

Good simulation does not make the agent look capable. It makes failure legible, reproducible, and fixable.
