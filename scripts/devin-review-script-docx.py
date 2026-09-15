#!/usr/bin/env python3
"""Generate the leadership review script (.docx) for the Devin ACU metrics.

Content lives in this file so the .docx is reproducible without shipping a
markdown copy. Rendering is done by scripts/md-to-docx.py.

Usage: python3 scripts/devin-review-script-docx.py
"""
import subprocess
import sys
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "docs/migration/DEVIN-ACU-review-script.docx"

DOC = r"""
# Devin ACU & token metrics — leadership review script

Companion to **DEVIN-AIDLC-ACU-metrics-v2.xlsx**. Session `devin-b089339539c84cfb8fe4913619e49d66`,
repository `infosys-training/angular2-hn`, PR #35. Every figure below is either **measured** from the Devin
session API, **derived** from a measured total by a stated rule, or explicitly flagged as an assumption.

---

## 1. The 60-second version

- Angular **9 → 20**, eleven sequential major upgrades plus the cross-cutting refactors, delivered in
  **35 minutes 26 seconds** of agent wall-clock.
- Cost: **20.2524 ACUs = $45.57** at Devin's $2.25/ACU list rate. Excluding the optional reusable AIDLC
  tooling, the migration itself was **18.6806 ACUs = $42.03**.
- Outcome: lint clean, 6/6 unit specs (the repo previously had none), dev and production builds green with
  service-worker assets emitted, 3/3 Playwright e2e passing, PR #35 open.
- Devin bills **ACUs, not tokens**. Token columns in the workbook are real measurements, but they are an
  efficiency indicator, not a price.

---

## 2. How to read the AIDLC token & ACU sheet

Three rows, in delivery order:

| Row | ACUs | Dollar Value | Why it is one row |
|---|---:|---:|---|
| Inception | 1.7528 | $3.94 | Planning only: repo read, BRD, units of work, acceptance criteria. |
| Construction *(includes Operation and Validation)* | 16.9277 | $38.09 | The build itself. Raising PR #35 (0.5525) and verifying the result (5.6204) are part of delivering the change, so they sit inside Construction, mirroring the Claude sheet. |
| Governance / AIDLC tooling *(optional, last)* | 1.5718 | $3.54 | Prompt-prefix generator and cost tooling. Not required to migrate the app; a reusable asset that should be amortised across future migrations. |
| **Migration total** | **20.2524** | **$45.57** | Measured. |

The **What is covered** column spells out, per phase, exactly which activities Devin performed. The **Basis**
column states, per row, what is measured and what is derived. Totals are live `=SUM()` formulas and every
Dollar Value is `=ACUs × rate`, so changing the rate cell re-prices the whole sheet.

---

## 3. Metric-by-metric justification

Use this section when someone asks "where does that number come from?".

### ACU (Agent Compute Unit) — the only billed unit
Devin's billing meter. It covers the **whole agent**, not just model inference: the VM, the browser, every
`npm install`, every build and test run, and the reasoning loop that decides the next action. Read directly
from the session API (`acus_consumed` and the `acu_consumption_at_last_user_interaction` checkpoints): 0.0000
at session start, 20.2524 when the migration work ended. **Measured.**

### Dollar Value
`ACUs × $2.25`. The $2.25 is Devin's **list price** — your enterprise rate is set on the order form. Flagged
as an assumption in the workbook; regenerate at your contracted rate with
`python3 scripts/devin-aidlc-acu-metrics-v2.py --rate <your rate>`. **Measured × assumption.**

### Cache Read — the reused prompt prefix
Every agent iteration re-sends the conversation so far. The part that was already there when the iteration
started is exactly what a prompt cache serves as a *cache read*. Devin does not expose Claude's
`cache_read_input_tokens`, but it does expose `current_context_tokens` per iteration, so the context resident
at the start of iteration *N* (= the size at *N-1*) is the measurement used. During construction this totalled
**4,377,122 tokens over 56 iterations**. **Measured proxy.**

Why it matters: a cache read is the cheap path. High cache read relative to cache write means the agent is
re-using an identical prefix instead of re-processing new material.

### Cache Write — newly cached tokens
The **positive delta** in `current_context_tokens` between consecutive iterations: the tokens newly written
into the cached prefix. During construction: **68,120 tokens, i.e. 1,216 per iteration**. Negative deltas
(context compaction, observed twice at iterations 197→200 and 221→225) are excluded rather than counted as
writes. **Measured proxy.**

### Hit rate — 98.47 %
`Cache Read ÷ (Cache Read + Cache Write)` over the construction window. Only 1.5 % of everything the model
processed was new material. This is the direct evidence that the AIDLC instruction — keep a byte-identical
prompt prefix of package.json + angular.json + tsconfigs + file tree + conventions, and put only the
task-specific instruction at the end — was honoured. **There is no further saving available on the token
side; it is already saturated.**

### Input
The share of the newly written tokens that came from **tool results** (file reads, command output, build
logs): the delta in `total_tool_output_bytes` converted at that iteration's measured bytes-per-token.
Construction: **32,074 tokens**. **Measured proxy.**

### Output
The remainder of the new tokens — **model-generated** text and tool invocations. Construction:
**36,046 tokens**. **Measured proxy.**

### Token
`Cache Read + Cache Write` — the total volume processed. A formula in the sheet, not a typed number.

### Per-phase token cells
Each phase row's token figures = *that phase's ACUs* × *the measured token rate per ACU*. The rate is not
assumed: it is the telemetry of a fully sampled window divided by the ACUs consumed in that same window
(construction: 620,093 cache-read, 9,650 cache-write, 4,544 input, 5,107 output tokens per ACU).

### Model
Left as **"Devin agent (mode not exposed)"** on purpose. The session API returns no model identity or agent
mode for a completed session, and Devin publishes no per-mode ACU multiplier. Filling this cell would be
fabrication.

### Basis
Every row carries one of: **MEASURED** (read from the API), **DERIVED** (measured total split by a stated
rule — here, wall-clock duration of the 17 underlying tasks), **ASSUMPTION** (the $2.25 rate), or
**NOT AVAILABLE**.

---

## 4. Where the effort actually went

| Activity | ACUs | Dollar | Comment |
|---|---:|---:|---|
| Inception (BRD + units of work) | 1.7528 | $3.94 | One-time; reusable for the next migration. |
| 11 major version bumps + cross-cutting refactors | 10.7548 | $24.20 | ~$1–2.50 per major version. |
| Operation — PR #35 | 0.5525 | $1.24 | |
| Validation — prod build, service worker, test plan | 5.6204 | $12.65 | Largest single activity; 28 % of the migration. |
| Governance / AIDLC tooling (optional) | 1.5718 | $3.54 | Reusable asset. |

The mechanical upgrades were cheap. The expensive parts were **judgement** (standalone conversion, the
Angular 20 builder change) and **verification** — which is the part that makes the migration trustworthy.

---

## 5. Anticipated questions and the answers

**Q1. Why are there no token prices, when the Claude sheet has them?**
Because Devin does not sell tokens. ACUs are the contracted unit and they bundle inference with the machine
time — VM, browser, installs, builds. Pricing tokens as well would double-count.

**Q2. Then why show token columns at all?**
Two reasons: comparability with the Claude AIDLC sheet, and because cache efficiency is the one lever that
demonstrably worked (98.47 % reuse). It proves the prompt engineering was correct even though it never
appears as a line on the invoice.

**Q3. Are the per-phase numbers measured?**
The **totals** are measured — 20.2524 ACUs for the migration, from Devin's own billing checkpoints. The
**split** across phases is derived: the measured total apportioned by each task's wall-clock duration, using
commit timestamps as boundaries, because Devin exposes no per-task ACU counter. That is stated on every row.

**Q4. Is $2.25 per ACU what we actually pay?**
It is Devin's list price and is labelled an assumption. Our contracted enterprise rate is on the order form;
the workbook re-prices in one command if it differs.

**Q5. Which model was used — Opus, Sonnet, Ultra, Normal?**
Not exposed for a completed session, and there is no published per-mode ACU multiplier, so any comparison
would be invented. To answer it factually: re-run one identical unit of work (say Angular 15→16) from the
same baseline in separate sessions, one per mode, and read `acus_consumed` from each. Cost of the experiment:
roughly 3–6 ACUs.

**Q6. $45.57 — is that good?**
The comparison is not "$45 versus a cheaper model", it is "$45 versus the human effort of eleven sequential
Angular major upgrades with a lint migration, a standalone-architecture refactor and a new e2e suite". The
delivery took 35 minutes of wall-clock and produced a reviewable PR.

**Q7. Could the same work have been done for less?**
Yes, and the evidence points at four things, none of which is a cheaper model: (a) script the verification
instead of stepping through it — Validation alone was 5.62 ACUs; (b) pre-provision the environment in the
Devin blueprint (Node 22, npm rather than yarn, warm npm cache, `legacy-peer-deps`, headless-Chrome flags) —
roughly a full ACU went to discovering these; (c) verify at checkpoints (12, 15, 18, 20) rather than after
every bump, accepting a wider blast radius on failure; (d) ask for the reporting format once, up front —
post-delivery reporting and Q&A cost a further 13.8651 measured ACUs / $31.20 across seven separate requests,
which is not migration cost at all. A realistic optimised re-run lands near **13 ACUs (~$30)**; that figure is
an estimate, and it is labelled as one.

**Q8. Why is Validation inside Construction now?**
To mirror the Claude AIDLC sheet, where build, test and PR-review sit under Construction. The detail is
preserved on the "AIDLC Phases" sheet, which shows Operation (0.5525) and Validation (5.6204) as their own
lines inside the merged row.

**Q9. Why is Governance marked optional?**
Because the application would have migrated without it. It is the AIDLC instrumentation — the prompt-prefix
generator and cost scripts — and it is reusable. The sheet therefore also shows the delivery total excluding
it: 18.6806 ACUs / $42.03.

**Q10. What was NOT completed?**
Browser-driven end-to-end testing. The persistent testing-agent run was suspended with
`usage_limit_exceeded`, so there is no recording and no screenshots. What *did* pass locally: lint, 6/6 unit
specs, dev and production builds with service-worker assets, and 3/3 Playwright e2e.

**Q11. Two context "compactions" appear in the telemetry — is that a problem?**
It means the session grew long enough (peak 148,037 tokens) that context had to be pruned, which resets part
of the cached prefix and costs some re-reading. It happened during the *reporting* conversation, not during
the migration. The mitigation is operational: keep sessions short and scoped.

**Q12. Why did reporting cost so much relative to building?**
Reporting turns are token-dense — 3,234 new tokens per iteration versus 1,216 during construction — and each
new question restarts the loop. Seven separate follow-up requests cost more than half of what the migration
itself cost.

**Q13. How do we govern this going forward?**
Three controls: agree the deliverable and report format in the initial prompt; keep the byte-stable prompt
prefix (it is the reason for the 98.47 % reuse); and move routine verification into CI so the agent only
looks at failures.

**Q14. Can these numbers be audited?**
Yes. `docs/migration/token-telemetry.json` holds the 50 raw telemetry samples with timestamps, and the
"Raw telemetry" sheet reproduces them. `acu-usage.json` and `acu-consumption-report.json` hold the measured
ACU checkpoints. The workbook is regenerated from those files by a script in the repo — nothing is typed by
hand.

**Q15. What would you do differently on the next Angular migration?**
Reuse the BRD and the units-of-work plan, start from a pre-provisioned blueprint, run a scripted verification
harness after each bump, request the cost report in the same breath as the migration, and keep the session
scoped to one migration.

---

## 6. Can we have a harness running throughout the migration?

Yes — and most of it already exists in this repository. A "harness" here means an automated quality gate that
runs after **every** version bump instead of a human deciding when to check.

**What the harness runs (all four already pass on the branch):**

1. `npm run lint` — angular-eslint, replacing the retired TSLint/codelyzer.
2. `npm test` — Karma in headless Chrome with the sandbox-free launcher committed in `karma.conf.js`
   (6 specs; these were written during the migration because the repo had none).
3. `npm run build` and the production build — including service-worker asset emission.
4. `npx playwright test` — 3 end-to-end specs that replaced Protractor.

**How to run it continuously:**

- **One gate command.** Add a single `npm run verify` chaining lint → test → build → e2e, and run it after
  each `ng update`. One command per bump instead of an interactive inspection is the single biggest ACU
  saving available (Validation was 5.62 ACUs).
- **In CI.** `.travis.yml` was updated for Node 22 and the new build output; the same four steps run there on
  every push, so eleven bumps produce eleven independent CI verdicts without consuming agent time. Devin then
  only reads failures.
- **In the Devin environment blueprint.** Node 22, npm as the package manager, warm npm cache,
  `legacy-peer-deps`, and the headless-Chrome flags can be baked into the snapshot so no ACUs are spent
  rediscovering them.
- **Acceptance criteria per unit.** `docs/migration/units-of-work.md` already defines pass/fail criteria per
  version bump — that document is what the harness enforces.
- **Browser-level harness.** Devin's persistent testing agent drives the real UI (feeds, pagination, item
  details, user pages, themes, offline service worker) and records the run. That is the one layer that did not
  complete here (`usage_limit_exceeded`), and it is the piece to schedule deliberately — ideally once at the
  end rather than per bump.

**Honest limitation:** a harness raises confidence and lowers cost, but it does not make the migration
free — the per-bump build and test cycle *is* most of the machine time an ACU pays for. Its real value is
that failures surface at the version that caused them, instead of eleven versions later.

---

## 7. Source files

| File | Contents |
|---|---|
| `docs/migration/DEVIN-AIDLC-ACU-metrics-v2.xlsx` | The workbook (7 sheets) |
| `docs/migration/token-telemetry.json` | 50 measured context-telemetry samples |
| `docs/migration/acu-usage.json` | Measured ACUs and per-task wall clock |
| `docs/migration/acu-consumption-report.json` | Measured per-interaction ACU deltas |
| `scripts/devin-aidlc-acu-metrics-v2.py` | Regenerates the workbook (`--rate` to re-price) |
| `scripts/devin-review-script-docx.py` | Regenerates this document |
| `docs/migration/units-of-work.md` | Acceptance criteria the harness enforces |
"""


def main():
    with tempfile.NamedTemporaryFile("w", suffix=".md", delete=False) as fh:
        fh.write(DOC.strip() + "\n")
        md = fh.name
    subprocess.run([sys.executable, str(ROOT / "scripts/md-to-docx.py"), md, str(OUT)], check=True)


if __name__ == "__main__":
    main()
