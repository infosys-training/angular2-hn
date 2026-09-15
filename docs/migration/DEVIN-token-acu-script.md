# DEVIN token & ACU consumption — Angular 9 → 20 migration

Companion script for **`DEVIN-AIDLC-token-ACU-metrics.xlsx`** (same column layout as the Anthropic AIDLC
workbook: *AIDLC Phases | Task | Model | Token | Dollar Value | Input | Cache Write | Cache Read | Output*,
plus the two columns Devin actually bills and audits on: *ACUs* and *Basis*).

Everything below comes from this session: `devin-b089339539c84cfb8fe4913619e49d66`, repo
`infosys-training/angular2-hn`, PR
[#35](https://github.com/infosys-training/angular2-hn/pull/35).

---

## 1. The one structural difference to state up front

| | Claude workbook | Devin workbook |
|---|---|---|
| Billable unit | tokens (input / cache write / cache read / output) | **ACU (Agent Compute Unit)** |
| Dollar Value column | Σ tokens × per-million rate | **ACUs × $2.25** |
| Tokens | priced | **measured but not priced** |
| What the price covers | model inference | inference **+** VM, browser, npm installs, builds, the agent loop |

So the Devin sheet keeps every Claude column, but the money column is driven by ACUs. The token columns are
real measurements from the session's `context_growth_update` telemetry — they are there to show *efficiency*
(how much context was reused rather than re-sent), not to compute a bill.

---

## 2. The headline numbers

| Scope | ACUs | Dollar Value @ $2.25/ACU | Tokens processed | Basis |
|---|---:|---:|---:|---|
| Migration delivery (Angular 9 → 20) | **20.2524** | **$45.57** | 12.75 M | ACUs measured |
| Post-delivery reporting / Q&A (7 requests) | **13.8651** | **$31.20** | 15.15 M | ACUs measured |
| **Session total** | **34.1175** | **$76.76** | **27.90 M** | ACUs measured |

Delivery wall-clock: 35 min 26 s (17:06:16Z → 17:52:44Z on 2026-08-28).

---

## 3. How each column is produced (this is the justification)

**ACUs.** Read directly from the Devin session API: `acus_consumed` and the
`acu_consumption_at_last_user_interaction` checkpoints. Session start = 0.0000, end of migration work =
20.2524, end of session so far = 34.1175. Nothing modelled.

**Dollar Value.** `ACUs × $2.25`, written as a live formula in every row, so changing the rate cell
recomputes the sheet. $2.25 is Devin's list price — the enterprise rate is set on your order form. If your
contracted rate differs, regenerate: `python3 scripts/devin-token-acu-xlsx.py --rate <your rate>`.

**Cache Read.** Devin does not expose Claude's `cache_read_input_tokens`. What it does expose, per agent
iteration, is `current_context_tokens`. The context already resident when iteration *N* starts is exactly the
prefix a prompt cache serves as a cache read. That is the proxy used, and it is measured, not assumed.

**Cache Write.** The positive delta of `current_context_tokens` between iterations = tokens newly written
into the cached prefix. Negative deltas (context compaction) are excluded rather than counted as writes.

**Input.** The share of those new tokens attributable to tool results: delta in `total_tool_output_bytes`
divided by that iteration's measured bytes-per-token.

**Output.** New tokens minus tool-result tokens — i.e. model-generated text and tool invocations.

**Token.** `Cache Read + Cache Write`, a formula in the sheet.

**Model.** `Devin agent (mode not exposed)` — see §6. This cell is deliberately not filled with a model name.

**Per-row token values.** Each row's tokens = *that row's ACUs* × *the measured token rate for its region*.
The rates are themselves measured, from the two fully sampled telemetry windows:

| Region | Telemetry window | Iterations | ACUs in window | Cache read / ACU | Cache write / ACU | Input / ACU | Output / ACU |
|---|---|---:|---:|---:|---:|---:|---:|
| Construction | 17:06:25Z → 17:18:47Z (iter 1–57, 40 samples) | 56 | 7.0588 | 620,093 | 9,650 | 4,544 | 5,107 |
| Reporting | 09-01 10:57:22Z → 11:04:31Z (iter 200–225, 7 samples) | 25 | 2.7049 | 1,062,315 | 29,888 | 15,784 | 14,103 |

---

## 4. What the cache numbers prove

| Window | Prompt tokens | Cache read (reused) | Cache write (new) | Hit rate | New tokens / iteration |
|---|---:|---:|---:|---:|---:|
| Construction, iter 1–57 | 4,445,242 | 4,377,122 | 68,120 | **98.47 %** | 1,216 |
| Reporting, iter 200–225 | 2,954,304 | 2,873,461 | 80,843 | **97.26 %** | 3,234 |

Three facts leadership can act on:

1. **98.47 % reuse during construction.** The AIDLC instruction to keep a byte-identical prompt prefix
   (package.json + angular.json + tsconfigs + file tree + conventions) worked — only 1.5 % of tokens
   processed were new. There is no further saving available on the token side; it is already saturated.
2. **Explaining costs more per iteration than building.** Reporting turns wrote 3,234 new tokens per
   iteration versus 1,216 during construction — 2.7× denser.
3. **Two context compactions** (iterations 197→200 and 221→225, peak 148,037 tokens) discarded context and
   forced the prefix to be rebuilt. Long sessions pay for this; short, scoped sessions do not.

---

## 5. Where the money went

| AIDLC phase | ACUs | Dollar Value | Share |
|---|---:|---:|---:|
| Inception (BRD, units of work) | 1.7528 | $3.94 | 5 % |
| Construction (11 majors + RxJS 7, eslint, standalone, control flow, builder, Playwright, ops) | 10.7549 | $24.20 | 32 % |
| Operation (PR #35) | 0.5525 | $1.24 | 2 % |
| Validation (prod build, service worker, test plan, testing handoff) | 5.6204 | $12.65 | 16 % |
| Governance / AIDLC tooling (prompt prefix + cost scripts) | 1.5718 | $3.54 | 5 % |
| **Reporting / Q&A after delivery** | **13.8651** | **$31.20** | **41 %** |

The uncomfortable headline is the last row: **41 % of the session was spent explaining the migration, not
performing it**, spread over seven separate follow-up requests. A single up-front request specifying the
report format would have collapsed most of that.

Within the migration itself, verification (5.6204 ACUs / $12.65) cost more than any upgrade, and the eleven
version bumps cost roughly $1–2.50 each.

---

## 6. What the report deliberately does not claim

- **Model / agent mode.** The session API returns no model identity or agent mode for a completed session,
  and Devin publishes no per-mode ACU multiplier. An Ultra-vs-Normal comparison would therefore be invented.
  To get it factually: re-run one identical unit of work (e.g. Angular 15→16) from the same baseline in
  separate sessions, one per mode, and read `acus_consumed` from each. Cost of that experiment: ~3–6 ACUs.
- **Per-task ACUs are derived**, not measured: the measured migration total is split pro rata by each task's
  wall-clock duration using commit timestamps as boundaries, because Devin has no per-task ACU counter. The
  subtotals and the session total are exact; individual task rows are attribution.
- **Token counts are proxies** derived from context telemetry, not billing fields.
- **Browser end-to-end testing was not completed** — the testing-agent run was suspended with
  `usage_limit_exceeded`. Lint, 6/6 unit specs, dev and prod builds and 3/3 Playwright e2e all passed
  locally; there is no recording.

---

## 7. The "if tokens were billed" comparison — how to use it safely

Priced at the rate card in your own Anthropic workbook, Devin's measured token volume would come to
**$26.48 at Opus rates** or **$15.13 at Sonnet 4.6 rates**, against the actual **$76.76** ACU bill.

Say this out loud when you show that sheet: the two are **not** like-for-like. The token figure prices model
inference only. The ACU figure prices inference *plus* the VM, the browser, eleven `npm install` cycles,
every build and test run, and the agent loop that decided what to do next — work that, in the Claude column,
a human engineer is doing unpaid-for-in-this-sheet alongside the model. The honest framing is: *for $45.57 of
delivery cost we obtained an eleven-major-version Angular upgrade with a green build, tests, e2e and an open
PR, in 35 minutes of wall-clock.*

---

## 8. The optimal approach for the next migration

Ranked by measured evidence, not opinion:

1. **Ask for the report format once, up front.** Measured avoidable spend: the 13.8651 ACUs / $31.20 of
   post-delivery Q&A, most of which was re-formatting the same numbers.
2. **Script verification instead of stepping through it.** Validation was 5.6204 ACUs; a single
   `build && serve && curl && playwright` chain, or CI doing it, removes most of that.
3. **Pre-provision the environment in the blueprint** — Node 22, npm (not yarn), a warm npm cache,
   `legacy-peer-deps`, headless-Chrome flags. Roughly a full ACU in row B1 went to discovering these.
4. **Checkpoint verification** (after 12, 15, 18, 20) rather than after every single version bump, accepting
   that a failure then spans three versions.
5. **Keep the byte-stable prompt prefix.** It is the reason for the 98.47 % cache hit rate; do not change it.
6. **Keep sessions short and scoped** to avoid the context compactions seen at iterations 197 and 221.
7. **Reuse the assets already produced**: the BRD, the units-of-work plan, the Angular knowledge note, the
   prompt-prefix generator and these cost scripts. Inception (1.7528 ACUs) is a one-time cost.
8. **Only then consider a lighter agent mode** for the mechanical bumps — and validate it with the A/B in §6
   before quoting a saving.

A realistic optimised re-run of the same scope lands around **13 ACUs (~$30)** versus the measured 20.25
(~$45.57). That is an estimate, clearly labelled as such — the 20.2524 is the only measured figure.

---

## 9. Files

| File | Contents |
|---|---|
| `docs/migration/DEVIN-AIDLC-token-ACU-metrics.xlsx` | Claude-layout workbook (6 sheets) |
| `docs/migration/token-telemetry.json` | 50 measured context-telemetry samples + region constants |
| `docs/migration/acu-usage.json` | measured ACUs + per-task wall clock |
| `docs/migration/acu-consumption-report.json` | measured per-interaction ACU deltas |
| `scripts/devin-token-acu-xlsx.py` | regenerates the workbook (`--rate` to change the ACU price) |
