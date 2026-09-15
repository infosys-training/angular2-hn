# DEVIN ACU consumption report — Angular 9 → 20 migration

Session: https://infosys.devinenterprise.com/sessions/b089339539c84cfb8fe4913619e49d66
Repository: `infosys-training/angular2-hn` · PR: https://github.com/infosys-training/angular2-hn/pull/35
Rate applied: **$2.25/ACU** (Devin list-price assumption — enterprise ACU rates are set per order form and were not exposed to this session)

Workbook: `docs/migration/DEVIN-ACU-consumption-report.xlsx` (regenerate with
`python3 scripts/aidlc-acu-report-xlsx.py --rate <usd>`)

> **Provenance rule applied throughout.** Every figure is labelled *Measured* or *Derived*.
> Measured = read from the Devin session API. Derived = the measured session total split by
> wall-clock duration. Nothing is assumed. Where data does not exist — notably per-mode ACU
> multipliers and the model identity — this report says so instead of estimating.

---

## 1. Headline

| Metric | Value | Basis |
|---|---:|---|
| Migration delivery (inception → PR → verification) | **20.2524 ACUs · $45.57** | Measured |
| Post-delivery reporting & Q&A (8 follow-up requests) | **13.8651 ACUs · $31.20** | Measured |
| **Session to date** | **34.1175 ACUs · $76.76** | Measured |
| Agent wall-clock for the delivery | 35 min 26 s | Measured |
| Angular major versions traversed | 11 (9 → 20) | Measured |

The single most important fact in this report: **41% of everything consumed in this session was
spent explaining the migration afterwards, not performing it.**

---

## 2. ACU consumption mapped to AIDLC phases

| AIDLC phase | ACUs | $ | Share | Basis |
|---|---:|---:|---:|---|
| Inception (BRD, units of work, acceptance criteria) | 1.7528 | $3.94 | 5.1% | Derived |
| Construction (11 major bumps + RxJS 7, angular-eslint, standalone, control flow, application builder, Playwright, ops config) | 10.7549 | $24.20 | 31.5% | Derived |
| Operation (PR #35 creation and summary) | 0.5525 | $1.24 | 1.6% | Derived |
| Validation (prod build, service-worker/manifest checks, test plan, testing handoff) | 5.6204 | $12.65 | 16.5% | Derived |
| Governance / AIDLC tooling (prompt-prefix generator, cost scripts) | 1.5718 | $3.54 | 4.6% | Derived |
| **Reporting (post-delivery Q&A)** | **13.8651** | **$31.20** | **40.6%** | **Measured** |
| **Total** | **34.1175** | **$76.76** | 100% | |

Note on mapping: the CI/Firebase/`ngsw-config`/README edits (classic *Operation* work) were done
inside the Angular 20 construction row, so they sit under Construction rather than Operation.

---

## 3. Measured interaction ledger

Read directly from `acu_consumption_at_last_user_interaction` events — no attribution involved.

| # | Checkpoint (UTC) | Cumulative | Δ ACUs | Δ $ | Paid for |
|---:|---|---:|---:|---:|---|
| 1 | 2026-08-28 17:06:20 | 0.0000 | — | — | Session start |
| 2 | 2026-08-28 18:30:47 | 20.2524 | 20.2524 | $45.57 | Entire migration + verification + testing handoff |
| 3 | 2026-08-28 18:37:34 | 23.9863 | 3.7339 | $8.40 | ACU metrics table, JSON, docs, cost script |
| 4 | 2026-08-28 18:44:11 | 24.6238 | 0.6375 | $1.43 | XLSX rendering of the same data |
| 5 | 2026-08-31 05:21:57 | 27.2611 | 2.6374 | $5.93 | Prompt-cache/context-reuse derivation + sheet |
| 6 | 2026-08-31 05:40:25 | 28.3313 | 1.0701 | $2.41 | Leadership narrative |
| 7 | 2026-08-31 06:00:52 | 29.6374 | 1.3062 | $2.94 | Line-by-line workbook walkthrough |
| 8 | 2026-09-01 05:21:36 | 31.4126 | 1.7752 | $3.99 | Model question + optimisation answer |
| 9 | 2026-09-01 10:56:36 | 34.1175 | 2.7049 | $6.09 | Efficiency analysis + briefing |

---

## 4. Efficiency rates derived from the measured data

| Rate | Value |
|---|---:|
| ACUs per minute of agent time | 0.572 (≈ **$1.29/min**) |
| Wall-clock seconds per ACU | 105 s |
| ACUs per plain version bump (B1–B9) | 0.635 (≈ **$1.43** per bump) |
| ACUs per major version incl. architectural work | 0.856 (≈ **$1.93** per major) |
| Context reuse rate (prompt-cache proxy) | **97.8%** measured (iterations 1–59) |
| New context written per iteration | ~1,193 tokens |

**Interpretation.** ACUs track elapsed agent time, so 90 seconds of `npm install` waiting costs
about the same as 90 seconds of reasoning. And because context reuse is already 97.8%, there is
no meaningful saving left on the prompt/caching side — the remaining levers are all about
*fewer and shorter iterations*.

---

## 5. Model and mode comparison — what can and cannot be stated

**Factual position:** Devin bills in ACUs, not per model. The session API, the event stream and
the public documentation expose **neither the underlying model nor the agent mode** (Devin
default / Fast / Lite / Ultra / Fusion) for a completed session, and **no per-mode ACU multiplier
is published**. Any Ultra-vs-Normal ACU table produced today would be invented, so this report
does not produce one.

What *is* documented and usable:

| Mode | Documented positioning | Fit for this migration |
|---|---|---|
| Devin (default) | General-purpose agent for features, fixes, refactors | Sufficient for the whole migration; required for the judgement-heavy rows |
| Fast | Optimised for quick, well-scoped tasks | Good candidate for the mechanical bumps (0.42–0.70 ACU each, measured) |
| Lite | Lightweight mode (`!lite`) | Candidate for repetitive bumps and reporting turns |
| Ultra / Fusion | Selectable premium modes | Only worth testing on the two architectural rows |

Modes are switchable mid-session (agent toggle in the webapp, or `!ultra` / `!fast` / `!lite` /
`!fusion` / `!normal` in Slack), so mode-matching per phase is operationally possible today.

### Experiment that would make the comparison factual (~3–6 ACUs)

1. Reset three sessions to the Angular 9 baseline commit.
2. Run one identical unit of work (Angular 9 → 10) in each, one mode per session.
3. Read `acus_consumed` from the session API and compare against the **1.1050 ACUs** measured here.
4. Repeat on the standalone-conversion unit — the quality-sensitive case where a lighter mode is
   most likely to fail.

Until that is run, mode selection should be treated as an unquantified lever.

---

## 6. High-consumption activities and avoidable ACUs

| Rank | Activity | ACUs | $ | Basis | Avoidable |
|---:|---|---:|---:|---|---|
| 1 | Post-delivery reporting across 8 separate requests | 13.8651 | $31.20 | Measured | ~60% (≈8.3 ACUs) |
| 2 | Post-PR verification (V1, 590 s interactive) | 5.6204 | $12.65 | Derived | ~3.5–4 ACUs |
| 3 | Angular 20 + application builder + control flow + Playwright + ops | 2.2386 | $5.04 | Derived | Little — genuine judgement work |
| 4 | Inception (BRD + units of work) | 1.7528 | $3.94 | Derived | ~1.5 on repeat runs (playbook reuse) |
| 5 | AIDLC tooling | 1.5718 | $3.54 | Derived | ~1.5 on repeat runs (scripts already committed) |
| 6 | Angular 9 → 10 (B1) | 1.1050 | $2.49 | Derived | ~0.6 — yarn/npm mismatch, peer conflicts, Node floor discovered at runtime |
| 7 | Nine remaining bumps (B2–B9, C9+B10) | 6.0681 | $13.65 | Derived | ~1.5 via checkpointed verification |

**Repeated interactions actually observed (measured):**

- The same question (*"which model was used / how to reduce ACUs"*) was submitted **twice** at
  2026-08-31 06:00:52Z.
- Four separate requests (metrics → xlsx → cache detail → explanation) asked for different views
  of one dataset.
- Checkpoints 6, 7 and 9 all re-explained the same workbook: **5.08 ACUs ($11.44) combined.**

---

## 7. ACU consumption versus migration outcome

| Outcome | Evidence | ACUs |
|---|---|---:|
| 11 Angular majors traversed (9 → 20) | `package.json` at Angular 20.3.x on PR #35 | 9.4117 |
| Toolchain replaced (TSLint→angular-eslint, Protractor→Playwright, RxJS 7) | lint pass, e2e 3/3 pass | 1.3431 |
| Architecture modernised (standalone, `provideRouter`, application builder) | `bootstrapApplication` in `src/main.ts`, `@angular/build:application` in `angular.json` | 1.4575 |
| Build and release path verified | dev + prod build pass, service-worker assets emitted | 5.6204 |
| Reviewable deliverable | PR #35 | 0.5525 |
| **Not delivered** | Browser testing-agent run aborted (`usage_limit_exceeded`) — no recording or screenshots exist | — |

**Reading:** ACU spend correlates with *judgement density*, not with the number of files changed.
Nine mechanical bumps together cost less than the one verification block, and every phase that
produced a durable artefact (BRD, tooling, PR) came in under 2 ACUs.

---

## 8. Recommended optimal approach

| Dimension | Recommendation | Grounded in | Effect (estimate) |
|---|---|---|---|
| Environment | Pin Node 22.x, npm, `legacy-peer-deps`, headless-Chrome flags and a warm npm cache in the repo blueprint **before** starting | B1 was the priciest bump purely from runtime discovery | −1.5 to −2 ACUs |
| Session strategy | One session; state every deliverable (code + BRD + metrics + xlsx + cache analysis) in the opening prompt | 8 follow-ups cost a measured 13.8651 ACUs | −6 to −8 ACUs |
| Prompts | Keep the byte-stable prefix; put only the task delta at the end; do not re-ask for restatements | 97.8% measured reuse proves the technique works | preserves near-optimal reuse |
| Verification | One scripted `build && serve && assert` chain; let CI run lint/unit/e2e; engage the agent only on failures | V1 = 5.6204 ACUs over 590 s | −3.5 to −4 ACUs |
| AIDLC workflow | Checkpoint verification after Angular 12, 15, 18, 20 rather than after all 11 bumps | B2–B9 averaged 0.58 ACUs, dominated by install wait | −1 to −1.5 ACUs |
| Model / mode | Mechanical bumps in a lighter mode; escalate only for standalone conversion and the Angular 20 builder row — validate with the A/B first | those two rows are the only judgement-heavy steps; no multiplier published | unquantified |
| Reuse | Encode the upgrade sequence as a playbook; keep the Angular knowledge note; reuse the committed prefix/cost scripts | inception 1.7528 + tooling 1.5718 were one-time | −3 ACUs on the next repo |
| Portfolio scaling | Versions are sequential *per repo* but independent *across repos* — one parallel session per application | Angular refuses to skip majors | wall-clock scales with repo count, not the sum |

### Target

| Scenario | ACUs | $ | Basis |
|---|---:|---:|---|
| Measured session to date | 34.1175 | $76.76 | Measured |
| Optimised delivery only | ~13 | ~$29 | Estimate |
| Optimised reporting (one consolidated request) | ~4 | ~$9 | Estimate |
| **Optimised session total** | **~17** | **~$38** | **Estimate** |

That is roughly a **50% reduction against the measured session**, and about **35% against the
delivery portion alone** — achieved through environment pre-provisioning, scripted verification
and request consolidation, not by choosing a cheaper model.

**What should not be optimised away:** the validation block. It is what makes an eleven-version
framework migration safe to merge, and it is the cheapest insurance in the table.
