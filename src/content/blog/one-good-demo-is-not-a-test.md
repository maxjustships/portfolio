---
title: "One good demo is not a test"
description: "How paired fictional worlds and parallel independent runs showed where an outreach agent was unstable before it interacted with real people."
pubDate: 2026-07-29
tags: [ai, agents, testing]
---

A polished AI demo proves very little. Give an agent one clean situation, and it can look thoughtful, careful, even surprisingly good. Change one detail and the same agent may make a decision that no sensible operator would accept.

I ran into that while working on Outreach Quality Engine, where an agent proposes the next action for B2B outreach. It is not allowed to send messages on its own. Strict external rules and a human still decide what happens. That boundary made the weak spots easier to see: if we could not trust a proposed action, we should not make the system look more autonomous than it was.

The obvious alternative was to test with real prospects. I did not want to learn by making mistakes with real people, their data, or their inboxes. So we built fictional worlds instead: companies, contacts, evidence, and situations that looked like the work the agent would see, without using prospects or personal data. Synthetic email addresses used reserved `.invalid` domains.

The useful part was not making a pile of examples. It was changing one fact at a time.

In one world, a trigger was fresh; in its paired world, it was stale. A contact had the right buyer role, then the wrong one. The evidence supported a claim, then became dubious. A safe channel existed, then did not. The seller could honestly make a promise, then could not. Research budget was available, then exhausted. Two sources agreed, then remained in conflict.

Sometimes that one change should flip the next action. Sometimes the correct action should stay the same. The pair gave us a concrete question: did the agent react to the fact that mattered, or did it produce an answer that merely sounded plausible?

The proposing agent never saw the hidden expected decision or the criteria used to judge it. It received only the material it would receive during normal work. An external checker compared the proposal with the business rules afterward. That separation mattered. A model should not grade its own judgment.

We also ran the same worlds through many independent agent sessions in parallel. They were not a committee voting on truth. A majority can be confidently wrong. The point was to collect independent attempts quickly, because language models vary from run to run. One lucky answer says almost nothing about whether the next run will make the same call.

The results were uncomfortable in the useful way. On the main set, full compliance with the strict business contract appeared in 47.14% of runs. On a separate sealed set, it was 50%.

That does not mean half of all proposed messages were obviously bad. It means roughly half of the runs contained at least one material business mistake. That is enough to rule out unsupervised operation. It also told us where the gates and human judgment belonged.

The deterministic checker passed all of its own fixed cases: 28 out of 28 cases and 14 out of 14 paired worlds. Good. That establishes that the test system behaved consistently on its scenarios. It says nothing about whether the product is ready for live use.

This setup works because it keeps the actor and judge separate, tests decisions instead of polish, and makes cause and effect visible by changing one factor at a time. Repeated runs expose instability. A sealed set makes it harder to tune the agent to familiar examples. Most importantly, failures happen in a place where nobody receives an unwanted message.

It still has a hard limit. Virtual worlds inherit the assumptions of the people who design them. They do not prove that live sources are good, integrations behave, a promised service gets delivered, or a buyer reacts as expected. They will miss failure modes we did not think to write down. Synthetic success is not battle readiness.

The next step is smaller and less glamorous: shadow mode, one controlled live cycle, human approval, and gradual dogfooding. Virtual worlds helped us find the places where the agent needed restraint. They did not earn it the right to operate alone.
