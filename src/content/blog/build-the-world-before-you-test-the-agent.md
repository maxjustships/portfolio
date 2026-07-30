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

What I wanted was a place where failure is cheap, visible, and repeatable. This post is the method, and what the reported lab cycle caught.

## What a world is

A **world** is a small, self-contained test situation: visible initial conditions, rules, a task, a hidden, author-defined expected outcome under a written policy contract, and a result you can check from the outside. Worlds come in layers, from a frozen decision fixture up to an executable environment with tools and observable state you can diff before and after the agent acts.

The case study here runs at the smallest useful layer: frozen inputs, hidden expected constraints, one structured JSON proposal, a deterministic checker. Nothing executed and no state changed while the model worked; the executable layers are part of the recommendation, not evidence this benchmark produced.

Two design rules hold at every layer. The agent does not receive the fixture-specific expected decision or hidden evaluator labels; it does receive the public methodology, output schema, and operating rules. A visible answer key would test reading comprehension, not judgment. And **volume does not fix a badly designed world**: synthetic worlds are cheap, safe, high-volume, and full of rare cases on demand, but they say nothing about prevalence in the wild and they inherit their author's blind spots.

## Change one fact

The useful move is not generating a pile of scenarios. It is building **paired worlds**: two worlds identical in every visible respect except one material fact. The trigger is fresh, then stale. The evidence is verified, then dubious.

A clean pair gives you a **designed contrast**. If the decision should track the changed fact and doesn't, you have found insensitivity. If it flips when nothing material changed, you have found jumpiness. That turns vague unease into a named bug.

One changed fact is the ideal, not something I can assume. I mechanically proved that isolation for only one of my fourteen pairs. The others also expose different IDs or scenario tags, so I treat them as designed contrasts, not controlled experiments. Auditing the pairs found seven failed comparisons across seventy repeated checks, including one where a peer returned invalid output. The lab has to test its worlds too.

## Run the same world more than once

Language models vary from run to run, so one run says almost nothing. I ran each world in five fresh sessions. Those runs are **samples, not a committee**: a majority vote would hide the instability I want to see.

This was not laboratory-grade replication. I did not lock the provider's randomness or shuffle the run order. The repeats show the variation I observed, nothing more.

The spread was the useful part. Among valid replies, only ten of twenty-eight worlds produced the same pass/fail result every time. Seven worlds never cleared every applicable check; three cleared them in every run. One polished demo would have hidden all of that.

## The score lives outside the agent

The separation of judging from doing is the whole game. The agent's final message is a *claim*; the checkable outcome is *evidence*. A model grading its own judgment gives you fluent self-praise.

In this benchmark the proposal itself was the evidence. A fixed program outside the agent checked the proposed action and the details around it: buyer role, channel, evidence references, timing, expiry, paired behavior, and hard safety rules.

A tool-using world should keep a fuller trace: what the agent called, what evidence it touched, what changed, and why a gate rejected it. This smaller benchmark did not. Its report saved key fields and pass/fail reasons, not the complete model reply. When I later found a checker bug, I could not rerun the improved checker against those old replies.

The checker had limits of its own. One review found that the same evidence could appear as both support and contradiction in different parts of a proposal without always being caught. Free-form wording and real side effects were not scored either. A pass means only that every implemented check passed. It does not mean the full workflow was correct.

## What the worlds caught

I tested the smallest useful version of this method on a B2B decision agent. It reads a situation and proposes what should happen next. It does not send anything, call tools, or change state. That narrow setup is enough to reveal the pattern.

<p class="proof-thesis">The headline decision can look right while the workflow underneath is wrong.</p>

### One world, end to end

<ol class="proof-steps">
<li><strong>Write the trap.</strong> Make the obvious answer break one important rule.</li>
<li><strong>Ask the agent.</strong> Give it normal visible facts, but no answer key.</li>
<li><strong>Check from the outside.</strong> Test the action and its details against the world's rules.</li>
<li><strong>Keep the failure.</strong> Repeat it, name it, and save the world as a regression test.</li>
</ol>

Here is what that looks like in practice. In one freshness-sensitive world, the proposal passed the action check in all five runs. It failed the timing check in all five. An action-only demo would call all five runs successful. The outside timing check showed that all five were still broken.

Across the full set, that same kind of false green appeared 55 times: an acceptable headline action with another contract condition failing underneath it.

<figure>
<img src="/images/blog/simulation-worlds/proposal-outcome-decomposition.svg" alt="Chart decomposing all 140 attempted runs on one denominator: 66 valid outputs passed the action check and every scored proposal-contract check, 55 chose an acceptable action but failed at least one other scored condition, 18 failed the action check, and 1 output was schema-invalid. Grading the action alone would have called the 55 fine." loading="lazy" />
<figcaption>All 140 attempts on one denominator. The orange 55 are false greens: the headline action passed, but another required condition did not. These are results from a fixed synthetic test set, not a production reliability estimate.</figcaption>
</figure>

<p class="callout proof-callout">The useful finding is not “the agent scored 47%.” It is “action-only testing would have waved through 55 broken proposals.” Now there is something concrete to fix.</p>

### What those false greens looked like

- **Good signal, forbidden proof.** The proposed action looked acceptable in all five runs, but every proposal carried an evidence reference the policy explicitly forbade. The output exposed the reference; I do not need to guess what happened inside the model.
- **Right action, broken deadline.** The action passed in all five runs. The timing failed in all five, with invalid expiry details appearing along the way.
- **Freshness mismatch.** The action passed in all five runs. The timing failed in all five. Same headline, same hidden weakness, reproducible on demand.

That is the methodology in miniature: design the trap, let the agent walk through it, judge the result outside the model, and turn the repeated failure into a named test case.

<aside class="methods-box">
<span class="methods-label">What this test actually did</span>
<dl>
<div><dt>The scenarios</dt><dd>Twenty-eight synthetic decisions, each attempted five times. That produced 140 attempts from one model.</dd></div>
<div><dt>One attempt</dt><dd>The model read one scenario and returned one structured proposal. No tools ran, no message was sent, and no external state changed.</dd></div>
<div><dt>The outside check</dt><dd>A fixed program checked the action and the details around it. Sixteen earlier worlds used the core checks; twelve newer worlds also checked methodology and source authority. A pass meant every check applicable to that world passed.</dd></div>
<div><dt>Why repeat</dt><dd>The model can answer differently each time. Five fresh sessions reveal whether a failure is repeatable instead of hiding it behind one lucky demo.</dd></div>
<div><dt>What the numbers mean</dt><dd>They describe this deliberately constructed test set only. They are not an estimate of production reliability or failure frequency in the wild.</dd></div>
<div><dt>Who wrote the truth</dt><dd>I wrote the worlds, expected outcomes, and checker from a policy contract. No independent second reviewer adjudicated the labels.</dd></div>
<div><dt>What was saved</dt><dd>The report kept selected decision fields, pass/fail signals, failure reasons, and run metadata, but not the complete raw proposals. That limits later rescoring.</dd></div>
<div><dt>The extra challenge set</dt><dd>Six messier scenarios came from an earlier testing cycle and were revised before reuse. They are useful regression cases, not a fresh holdout exam.</dd></div>
</dl>
</aside>

## Two buckets of bugs

Honesty requires splitting the findings. **Bucket one: agent proposal defects**, like the cases above. **Bucket two: harness defects**, bugs in my own lab, found by deliberately feeding the checker broken inputs, comparing paired worlds, and asking for independent review. Conflating the buckets is how you "fix the model" when the test was broken, and a broken judge can make a broken agent look good. The harness bugs were not hypothetical:

- The agent could cite evidence that did not exist → unknown references now fail immediately.
- Impossible dates and times without a timezone could pass → both are now rejected.
- One side of a pair could be missing while the pair still "passed" → an incomplete pair now fails.
- A weak source could carry an important decision → the checker now asks whether that source is strong enough for the specific claim.
- "Research more" could mean almost anything → the proposal must name the question, source, cost, and stopping point.
- One supposedly paired case changed more than one thing → a test now compares the full visible inputs for that pair; the other thirteen pairs still need the same audit.

Every one of these was a way the lab could have lied to me. Fixing them hardened detection; it did not, by itself, improve the agent, and I ran no frozen before-and-after intervention that could have measured improvement. Detection is the claim.

## The next layer: executable worlds and the CLI

This benchmark stopped at the proposal. Nothing here executed a tool, retried a request, or sent anything, so it says nothing about CLI idempotency, dry runs, exit codes, or side effects. Those questions live one layer up, where an agent is your CLI's least forgiving user: it does exactly what your interface invites and brings no common sense to a bad error message. Executable worlds can surface the bugs humans step over: errors that don't say what failed or what to do next; exit status 0 on failure; non-idempotent commands that double-execute on retry; no `--dry-run` for an irreversible action; output a human can skim but a parser can't; hidden side effects. The same interface flaws can trip up a hurried human. Executable worlds make them easier to reproduce.

## The loop

<figure>
<img src="/images/blog/simulation-worlds/method-loop.svg" alt="Vertical diagram of the testing loop in its full form: build the world, run parallel independent sessions, read the observable trace, let an external scorecard check world state, name a reproducible bug, fix the flow CLI or gate, then rerun so the world becomes a regression test." loading="lazy" />
<figcaption>The loop in its full form. Worlds that caught a bug are never deleted; they become the regression suite.</figcaption>
</figure>

In practice: create a world, reproduce a failure, name the bug, change the flow or the CLI or the gate, rerun the *same* worlds, and keep them forever as regression tests. This lab established detection and hardened the evaluator. A frozen, prespecified rerun after an agent or flow intervention remains for a future cycle, and until it runs, there is no improvement percentage to report.

## The honest boundary

A **sealed world** is one the tuning process never touches, so it stays an honest exam rather than becoming training data. None of my current suites qualifies: the compound suite had prior exposure, and the core corpus informed the fixes. The trust ladder, in order, with no skipping: paired synthetic worlds for diagnosis → compound worlds for realism → a genuinely fresh sealed suite → shadow mode on real inputs with no actions → one controlled live run behind a human gate → gradual dogfooding.

So here is exactly what this study shows. On one fixed, authored corpus of structured outreach decisions, action-only grading missed many proposal-contract failures that an external deterministic checker caught, and attacking the checker made detection sharper. That is detection and evaluator hardening: not measured agent improvement, not real-world prevalence, not general reliability or production readiness. A good score, when I earn one, will mean the agent passed the worlds I thought to build. Nothing more.

What the worlds give you is more modest and more valuable than a launch signal: every failure they surface is one that didn't happen to a real person. Good simulation does not make the agent look capable. It makes failure legible, reproducible, and fixable.
