---
title: "Don’t ask an LLM to draw BPMN. Ask it for a process model."
description: "A practical architecture for turning uncertain source material into validated process semantics, human questions, and deterministic BPMN."
pubDate: 2026-09-08
tags: [ai, bpmn, engineering]
draft: false
dek: "Let the model interpret evidence. Make ordinary code own structure, validation, layout, and export."
---

One practical failure mode when asking a language model to draw a BPMN diagram is optimization for the most visible target: a plausible-looking diagram. That is also the least useful definition of success.

A box can be in the right lane and still name an invented owner. Two arrows can meet neatly while hiding a required merge gateway. A branch labelled “exception” can look perfectly reasonable even though nobody has defined what an exception is. Once the result is rendered, visual polish makes these semantic guesses harder to notice.

The safer architecture is to separate interpretation from compilation:

1. Give the model source evidence and ask for a typed process model.
2. Validate the model’s shape, references, and graph invariants with ordinary code.
3. Send unresolved meaning to a person as explicit questions.
4. Compile accepted process semantics into BPMN XML and lay them out deterministically.

The LLM still does the part it is good at: turning messy notes, transcripts, images, or tables into a proposed structure. It does not get to decide whether its proposal is structurally sound, visually convenient, or approved as truth.

<figure>
<img src="/assets/blog/process-foundry/demo-evidence.webp" alt="Process Foundry’s separate fictional retail-returns demo. The BPMN gateway ‘Policy requirements met?’ is selected, and the evidence panel highlights linked returns-policy notes stating that returns are accepted within 30 days when the order and item condition can be verified." loading="lazy" />
<figcaption>This is a separate fictional retail-returns demo—not the invoice fixture or a live AI generation. Selecting “Policy requirements met?” links that gateway to the highlighted returns-policy evidence. The screenshot demonstrates the review relationship, not invoice extraction, production deployment, or AI accuracy. The <a href="https://github.com/maxjustships/process-foundry/blob/511ae9efdf65f3d80dc3c430dcbe817614909a5e/app/demo/fixture.ts">demo fixture is public source</a>.</figcaption>
</figure>

## One invoice, one undefined branch

Consider a fictional note from an accounts-payable handbook:

> Finance handles every invoice. When an invoice arrives, Finance checks whether it is standard. Standard invoices under $5,000 may be auto-approved. Finance reviews every other invoice.

The note explicitly supports Finance as the owner and the $5,000 threshold. It is still not enough to finish the process. What makes an invoice “standard”? Does “may” describe permission or the default path?

Those are not layout questions. Moving a gateway or rerouting a connector cannot answer them. They belong in a reviewable intermediate representation (IR) alongside the proposed gateway, its evidence, and a question for a human.

Here is a shortened but schema-valid `ProcessIR` object from a hand-authored fictional fixture. It is an example of the [public `ProcessIR` contract](https://github.com/maxjustships/process-foundry/blob/511ae9efdf65f3d80dc3c430dcbe817614909a5e/domain/process-ir.ts), not the output of a claimed model run.

```ts
const ref = [{ sourceId: "source_ap_note", locator: "paragraph 3" }];

const invoiceApproval = {
  title: "Invoice approval",
  participants: [{
    id: "company",
    name: "Company",
    lanes: [{ id: "finance", name: "Finance" }],
  }],
  nodes: [
    { id: "received", type: "startEvent", name: "Invoice received",
      participantId: "company", laneId: "finance", sourceRefs: ref,
      confidence: 1, assumptions: [] },
    { id: "classify", type: "exclusiveGateway", name: "Standard invoice?",
      participantId: "company", laneId: "finance", sourceRefs: ref,
      confidence: 0.45,
      assumptions: ["The definition of ‘standard’ is not present in the note."] },
    { id: "autoApprove", type: "task", name: "Auto-approve invoice",
      participantId: "company", laneId: "finance", sourceRefs: ref,
      confidence: 0.55,
      assumptions: ["‘May’ is not treated as a mandate until confirmed."] },
    { id: "manualReview", type: "task", name: "Review exception",
      participantId: "company", laneId: "finance", sourceRefs: ref,
      confidence: 0.6, assumptions: [] },
    { id: "autoDone", type: "endEvent", name: "Invoice auto-approved",
      participantId: "company", laneId: "finance", sourceRefs: ref,
      confidence: 0.55, assumptions: [] },
    { id: "reviewDone", type: "endEvent", name: "Finance review complete",
      participantId: "company", laneId: "finance", sourceRefs: ref,
      confidence: 0.6, assumptions: [] },
  ],
  flows: [
    { id: "f1", sourceId: "received", targetId: "classify", sourceRefs: ref },
    { id: "f2", sourceId: "classify", targetId: "autoApprove",
      condition: "Standard and under $5,000", sourceRefs: ref },
    { id: "f3", sourceId: "classify", targetId: "manualReview",
      condition: "Not standard or $5,000 and above", sourceRefs: ref },
    { id: "f4", sourceId: "autoApprove", targetId: "autoDone", sourceRefs: ref },
    { id: "f5", sourceId: "manualReview", targetId: "reviewDone", sourceRefs: ref },
  ],
  annotations: [],
  questions: [{
    id: "q_exception_rule",
    text: "What defines a standard invoice, and when should Finance use the permitted auto-approval path?",
    relatedElementIds: ["classify", "f2", "f3"],
    severity: "blocking",
  }],
} satisfies ProcessIR;
```

Notice what this object does and does not claim. The source text remains evidence; `sourceId` and `locator` make each interpretation traceable back to it. Finance ownership and the threshold split come directly from the fictional note. The IR also records confidence and assumptions around the undefined word “standard” and the permissive “may.” The question records exactly where a person must intervene. The branch labels are reviewable formalizations of the note, not proof of a real company policy.

A compiler can compile this object because it is structurally coherent. It cannot determine whether the proposed threshold logic is the company’s real policy. In the current implementation, a low-confidence gateway must have a related question, but the validator does not answer that question or treat its `blocking` label as a universal publication gate. That last decision belongs in the surrounding workflow.

## Validate more than JSON

Structured output is useful, but schema adherence is only the first layer. OpenAI’s [Structured Outputs guide](https://developers.openai.com/api/docs/guides/structured-outputs) distinguishes schema-constrained output from plain JSON mode. A strict schema can require every node to have an ID, a supported type, source references, a confidence value, and an assumptions array. It cannot prove that the graph makes sense.

A process-model pipeline needs at least three mechanical gates.

**Schema validation** checks the vocabulary and bounds. In this implementation, the supported subset includes start and end events, tasks, exclusive and parallel gateways, and intermediate message and timer events. Unknown object fields and unsupported node types fail rather than leaking into the compiler.

**Reference validation** checks identity and containment. IDs must be unique. Flow endpoints, lane assignments, annotation targets, and question targets must exist. A sequence flow cannot quietly cross participant pools in this supported subset.

**Invariant validation** checks graph meaning that a type system alone cannot express. A process needs start and end events. Non-terminal nodes cannot be orphaned. An exclusive split needs distinct, non-empty condition labels and distinct targets. Parallel branches must not invent conditions. Reconverging branches need an explicit merge gateway instead of several incoming flows hidden on a task. Evidence is required for intermediate message and timer events. A low-confidence gateway needs a related review question.

These checks are deliberately deterministic. Given the same IR, they return the same issues. If any issue remains, the compiler throws before producing BPMN. A repair attempt, if a product chooses to make one, should receive the exact issue codes and be constrained to structural repair; it should not use “repair” as permission to invent business meaning.

Schema-valid is not process-valid, and process-valid is not human-approved. Keeping those verdicts separate makes error messages useful and prevents one green check from standing in for all three.

## BPMN semantics are not BPMN-DI

BPMN files contain both the process definition and information about how to draw it. The [BPMN 2.0.2 specification page](https://www.omg.org/spec/BPMN/) publishes separate normative machine-readable artifacts for the semantic model and BPMN Diagram Interchange (BPMN-DI). That distinction is practical, not academic.

Semantic elements say that a task exists, a sequence flow connects two nodes, or a gateway selects a branch. BPMN-DI supplies shapes, bounds, and edge waypoints so a tool knows where to render them. A beautifully routed edge cannot repair a dangling reference or justify an unsupported decision. Conversely, correct process semantics without DI may import but have no useful saved layout.

The [compiler](https://github.com/maxjustships/process-foundry/blob/511ae9efdf65f3d80dc3c430dcbe817614909a5e/domain/bpmn-compiler.ts) therefore owns both serialization and layout. It sorts model elements, assigns stable horizontal levels and lane positions, escapes XML, emits BPMN shapes and edges, and produces the same bytes even when the same logical input arrives with its node, flow, and annotation arrays reordered. [Focused compiler tests](https://github.com/maxjustships/process-foundry/blob/511ae9efdf65f3d80dc3c430dcbe817614909a5e/tests/unit/compiler.test.ts) parse the result with `bpmn-moddle`, require no import warnings, check that nodes stay inside their lanes, and check that shapes do not overlap. The [bpmn-js walkthrough](https://bpmn.io/toolkit/bpmn-js/walkthrough/) explains the same boundary from the editor side: `bpmn-moddle` reads the BPMN object tree, while `bpmn-js` renders visible shapes and connections.

Those tests establish deterministic, parseable artifacts for the covered fixtures. They do not establish that a model extracted from real evidence is correct, readable in every case, or accepted by every BPMN tool.

## Keep the evidence record beside the diagram

The IR is also the natural place for traceability that does not fit neatly into portable BPMN:

- `sourceRefs` connect nodes and flows to opaque source IDs and precise locators;
- `assumptions` expose interpretations instead of hiding them in prompt text;
- questions point back to the affected nodes, flows, or annotations;
- confidence can prioritize review, but it is a model signal, not proof;
- versioned IR can preserve what changed after a human answer.

The current compiler does not serialize every one of these fields into BPMN XML. It emits process elements, conditions, text annotations, associations, and DI; source references, confidence, assumptions, and open questions remain application-level data. So the exported `.bpmn` file should not be treated as the complete audit record. Keep the source manifest, reviewed IR, questions and answers, compiler version, and resulting XML together.

Human correction should happen at the semantic layer. In the invoice example, a reviewer might define “standard” as “matched purchase order, known supplier, no tax discrepancy” and decide that auto-approval is optional. That answer should create a new IR version, update the gateway conditions and assumptions, rerun validation, and only then recompile the diagram. Dragging the existing gateway ten pixels to the left changes none of the facts.

## Self-hosted is not offline AI

One deployment boundary is easy to describe incorrectly. Self-hosting means the application runs on infrastructure controlled by its owner. It does not mean model inference is local or offline.

In this architecture, the configured model provider—in the [current provider module](https://github.com/maxjustships/process-foundry/blob/511ae9efdf65f3d80dc3c430dcbe817614909a5e/ai/provider.server.ts), OpenAI—receives the relevant source content over its APIs for extraction and transcription. The application can avoid shipping source text to unrelated services and can configure provider-side controls, but its data-flow documentation and threat model must still include the model provider. If a workflow requires fully local inference, that is a separate provider and engineering decision—not a property conferred by self-hosting the web application.

## The division of labour

The useful rule is simple: let probabilistic software propose meaning; let deterministic software enforce structure; let a person resolve authority and ambiguity.

Code can prove that IDs resolve, the supported subset is respected, exclusive branches have distinct labels, merges are explicit, and the same accepted IR produces the same BPMN and DI. It cannot prove what “exception” meant in a hurried meeting note, whether one policy supersedes another, or whether the named owner agrees that the diagram describes reality.

That is why the model should not draw the final answer. It should produce a process proposal with enough structure, evidence, and uncertainty for the rest of the system—and a human—to judge.
