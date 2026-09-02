# AIDLC cost metrics — Devin ACUs (Angular 9 → 20 migration)

Devin bills in **ACUs** (Agent Compute Units), not Claude API tokens. This document is the
ACU counterpart of <a href="./aidlc-metrics.md">aidlc-metrics.md</a>, populated with the real
usage of the session that performed this migration.

- Session: `devin-b089339539c84cfb8fe4913619e49d66`
  (https://infosys.devinenterprise.com/sessions/b089339539c84cfb8fe4913619e49d66)
- Pull request: https://github.com/infosys-training/angular2-hn/pull/35
- Migration window (UTC): `2026-08-28T17:06:16Z` → `2026-08-28T17:52:44Z` (35m 26s of agent work)

## Measured totals

| Metric | Value | Source |
|---|---|---|
| ACUs at session start | 0.0 | `acu_consumption_at_last_user_interaction` event |
| ACUs at end of migration work | **20.2524** | `acu_consumption_at_last_user_interaction` event at the next user message |
| ACUs attributable to the migration | **20.2524** | difference of the two checkpoints |

Only the session-level figure is measured — Devin does not expose a per-task ACU counter.

## Per-task attribution

Task rows are **derived**, not measured: the measured 20.2524 ACUs are attributed pro rata by
each task's wall-clock duration, using the commit timestamps on
`devin/1787936828-ng9-to-ng20-migration` as task boundaries.

| Unit | Task | Duration (mm:ss) | ACUs | Cost @ $2.25/ACU |
|---|---|---|---|---|
| A1-A3 | Inception: read repo config, BRD, units of work + acceptance criteria | 03:04 | 1.7528 | $3.94 |
| B1 | Angular 9 → 10 (npm package manager, headless karma launcher) | 01:56 | 1.1050 | $2.49 |
| B2 | Angular 10 → 11 (+ first unit specs, legacy-peer-deps) | 01:44 | 0.9907 | $2.23 |
| B3 | Angular 11 → 12 | 01:13 | 0.6954 | $1.56 |
| C1 | RxJS 7 imports, drop rxjs-compat, sass `math.div` | 01:07 | 0.6382 | $1.44 |
| B4 | Angular 12 → 13 | 00:44 | 0.4191 | $0.94 |
| C5 | TSLint/codelyzer → angular-eslint + fix violations | 01:14 | 0.7049 | $1.59 |
| B5 | Angular 13 → 14 | 00:54 | 0.5144 | $1.16 |
| B6 | Angular 14 → 15 (+ Protractor removal) | 01:05 | 0.6192 | $1.39 |
| B7 | Angular 15 → 16 | 00:47 | 0.4477 | $1.01 |
| B8 | Angular 16 → 17 | 00:48 | 0.4573 | $1.03 |
| B9 | Angular 17 → 18 | 00:49 | 0.4668 | $1.05 |
| C9+B10 | Standalone migration, `provideRouter`/`provideServiceWorker` bootstrap, Angular 19 | 02:33 | 1.4575 | $3.28 |
| B11+C6-C8 | Angular 20, application builder, control flow, `inject()`, Playwright e2e, ops config | 03:55 | 2.2386 | $5.04 |
| E1-E2 | AIDLC prompt-prefix generator, cost tooling, final unit status | 02:45 | 1.5718 | $3.54 |
| D-PR | PR #35 creation and summary | 00:58 | 0.5525 | $1.24 |
| V1 | Post-PR verification (prod build, service worker/manifest check), test plan, testing handoff | 09:50 | 5.6204 | $12.65 |
| **Total** | **Angular 9 → 20 migration** | **35:26** | **20.2524** | **$45.57** |

## Cost

```
total_cost = 20.2524 ACUs × price_per_ACU
           = $45.57  at the $2.25/ACU list rate
```

`$2.25/ACU` is Devin's published list price and is the default in
<a href="../../scripts/aidlc-acu-cost.mjs">scripts/aidlc-acu-cost.mjs</a>. This deployment's
contracted enterprise rate was not exposed to the session; re-render with the real rate:

```bash
node scripts/aidlc-acu-cost.mjs --rate 2.00
```

Raw data lives in <a href="./acu-usage.json">acu-usage.json</a>.

## Notes

- The 38-minute gap between `17:52` and `18:30` was a suspension (usage limit) and consumed no ACUs;
  it is excluded from the window above.
- ACUs consumed after `17:52:44` belong to this metrics task itself and are excluded from the
  migration total.
- Claude-token metrics (`input_tokens`, `cache_creation_input_tokens`, `cache_read_input_tokens`,
  `output_tokens`) remain "not captured" in <a href="./aidlc-metrics.md">aidlc-metrics.md</a> —
  Devin does not expose the underlying model usage objects.

## Prompt cache / context reuse

ACU billing has **no cache dimension** — Devin charges compute, not tokens, so a cache hit shows
up only as fewer ACUs, never as a separate line item. Devin also does not expose Claude's
`cache_read_input_tokens` / `cache_creation_input_tokens`.

What *is* observable is the session's context telemetry (`context_growth_update`:
`current_context_tokens` per agent iteration). The stable prefix re-sent on iteration N is exactly
what a prompt cache serves as a read, and the growth is what it writes:

```
cache_read(N)     ≈ context_tokens(N-1)
cache_creation(N) ≈ context_tokens(N) - context_tokens(N-1)
```

| Scope | Iterations | Prompt tokens processed | Cache-read tokens | Cache-creation tokens | Hit rate |
|---|---|---|---|---|---|
| Measured (41 samples, interpolated) | 1–59 | 4,687,264 | 4,583,352 | 103,912 | 97.8% |
| Full session (extrapolated at 1,193 tokens/iteration) | 1–150 | 19,136,288 | 18,923,832 | 212,456 | 98.9% |

Context grew from 34,730 tokens (iteration 1) to 103,912 (iteration 59) — ~1,193 tokens per
iteration, consistent with the stable prompt prefix in
<a href="./prompt-prefix.md">prompt-prefix.md</a> being reused rather than rebuilt. Telemetry stops
at iteration 59 (17:19:39, the Angular 15 unit); rows beyond that are an extrapolation, not a
measurement. Per-iteration figures are on the "Prompt cache" sheet of the workbook and under
`prompt_cache` in <a href="./acu-usage.json">acu-usage.json</a>.

## Spreadsheet

<a href="./aidlc-acu-metrics.xlsx">aidlc-acu-metrics.xlsx</a> holds the same table (regenerate with `python3 scripts/aidlc-acu-xlsx.py --rate <usd>`).
