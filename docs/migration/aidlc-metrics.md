# AIDLC cost table

This is the cost deliverable for the Angular 9 → 20 migration. It is produced mechanically
from recorded Claude API usage, never estimated.

## Method

1. Every task prompt begins with the byte-identical prefix in
   [`prompt-prefix.md`](prompt-prefix.md) (package.json + angular.json + tsconfigs + file
   tree + conventions) and appends only the task-specific instruction after the `## Task`
   heading. Regenerate it with `node scripts/aidlc-prompt-prefix.mjs` (and verify in CI with
   `--check`) whenever those files change — a single changed byte invalidates the cache for
   every later task.
2. The prefix is sent as a cached block, so the first task of a run pays
   `cache_creation_input_tokens` (1.25x input rate) and later tasks pay
   `cache_read_input_tokens` (0.1x input rate) for the same bytes.
3. Per task, record the four usage fields from the API response (`usage.input_tokens`,
   `usage.cache_creation_input_tokens`, `usage.cache_read_input_tokens`,
   `usage.output_tokens`) into [`aidlc-usage.json`](aidlc-usage.json).
4. Regenerate the table below with `node scripts/aidlc-cost.mjs`, which computes each task's
   cost as `sum(tokens_field / 1e6 * rate_field)` and appends a totals row.

Rates in `aidlc-usage.json` are the Claude Sonnet 4.5 list prices (input $3, cache write
$3.75, cache read $0.30, output $15 per MTok); change them there if the model or contract
rate differs.

## Status of the token columns

The work in this PR was executed inside a Devin session, which does not surface the
underlying Claude API `usage` object to the agent. The per-task token counts are therefore
recorded as `not captured` rather than invented. To populate them, export the usage for the
session's task boundaries from the Anthropic console (or run the same task prompts through
the API directly, one message per task) and paste the four fields into
`aidlc-usage.json` — the table below then fills in with no further edits.

## Table

Model: claude-sonnet-4-5
Rates per MTok: input $3.0000, cache write $3.7500, cache read $0.3000, output $15.0000

| Phase | Task | input_tokens | cache_creation_input_tokens | cache_read_input_tokens | output_tokens | Cost |
|---|---|---:|---:|---:|---:|---:|
| Inception | A1-A2 Read repo config and produce migration BRD | not captured | not captured | not captured | not captured | not captured |
| Inception | A3 Break BRD into units of work with acceptance criteria | not captured | not captured | not captured | not captured | not captured |
| Construction | B1 Angular 10 bump | not captured | not captured | not captured | not captured | not captured |
| Construction | B2 Angular 11 bump | not captured | not captured | not captured | not captured | not captured |
| Construction | B3 Angular 12 bump (Sass math.div, Ivy-only) | not captured | not captured | not captured | not captured | not captured |
| Construction | B4 Angular 13 bump | not captured | not captured | not captured | not captured | not captured |
| Construction | B5 Angular 14 bump | not captured | not captured | not captured | not captured | not captured |
| Construction | B6 Angular 15 bump and Protractor removal | not captured | not captured | not captured | not captured | not captured |
| Construction | B7 Angular 16 bump | not captured | not captured | not captured | not captured | not captured |
| Construction | B8 Angular 17 bump | not captured | not captured | not captured | not captured | not captured |
| Construction | B9 Angular 18 bump | not captured | not captured | not captured | not captured | not captured |
| Construction | B10 Angular 19 bump | not captured | not captured | not captured | not captured | not captured |
| Construction | B11 Angular 20 bump | not captured | not captured | not captured | not captured | not captured |
| Construction | C1-C3 RxJS 7, zone.js, TypeScript/tslib/@types/node | not captured | not captured | not captured | not captured | not captured |
| Construction | C5 TSLint/codelyzer to angular-eslint | not captured | not captured | not captured | not captured | not captured |
| Construction | C6 Karma headless + first unit specs | not captured | not captured | not captured | not captured | not captured |
| Construction | C7 Playwright e2e replacement | not captured | not captured | not captured | not captured | not captured |
| Construction | C8 Application builder migration and output layout | not captured | not captured | not captured | not captured | not captured |
| Construction | C9 Standalone components, inject(), control flow | not captured | not captured | not captured | not captured | not captured |
| Operations | D1-D4 Travis, Firebase, ngsw-config, README | not captured | not captured | not captured | not captured | not captured |
| Metrics | E1-E2 Prompt prefix artifact and cost tooling | not captured | not captured | not captured | not captured | not captured |
| **Total** | 0/21 tasks with captured usage | 0 | 0 | 0 | 0 | $0.0000 |
