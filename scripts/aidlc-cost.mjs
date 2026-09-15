#!/usr/bin/env node
/**
 * Turns per-task Claude API usage records into the AIDLC cost table.
 *
 * Input: a JSON file (default docs/migration/aidlc-usage.json) shaped as
 *   {
 *     "model": "claude-sonnet-4-5",
 *     "rates_per_mtok": { "input": 3, "cache_write": 3.75, "cache_read": 0.3, "output": 15 },
 *     "tasks": [
 *       { "phase": "Inception", "task": "A1 Read repo config",
 *         "input_tokens": 0, "cache_creation_input_tokens": 0,
 *         "cache_read_input_tokens": 0, "output_tokens": 0 }
 *     ]
 *   }
 *
 * Output: a markdown table on stdout (write it into docs/migration/aidlc-metrics.md).
 * Tasks whose usage fields are null are rendered as "not captured" and excluded from totals.
 *
 * Usage: node scripts/aidlc-cost.mjs [path/to/usage.json]
 */
import { readFileSync } from 'node:fs';

const path = process.argv[2] ?? new URL('../docs/migration/aidlc-usage.json', import.meta.url).pathname;
const { model, rates_per_mtok: rates, tasks } = JSON.parse(readFileSync(path, 'utf8'));

const FIELDS = [
  ['input_tokens', 'input'],
  ['cache_creation_input_tokens', 'cache_write'],
  ['cache_read_input_tokens', 'cache_read'],
  ['output_tokens', 'output']
];

const money = (n) => `$${n.toFixed(4)}`;
const num = (n) => n.toLocaleString('en-US');

const cost = (task) =>
  FIELDS.reduce((sum, [field, rate]) => sum + ((task[field] ?? 0) / 1e6) * rates[rate], 0);

const captured = tasks.filter((t) => FIELDS.every(([f]) => typeof t[f] === 'number'));

const rows = tasks.map((task) => {
  const cells = FIELDS.map(([f]) => (typeof task[f] === 'number' ? num(task[f]) : 'not captured'));
  const total = captured.includes(task) ? money(cost(task)) : 'not captured';
  return `| ${task.phase} | ${task.task} | ${cells.join(' | ')} | ${total} |`;
});

const totals = FIELDS.map(([f]) => num(captured.reduce((s, t) => s + t[f], 0)));
const grand = captured.reduce((s, t) => s + cost(t), 0);

console.log(`Model: ${model}`);
console.log(
  `Rates per MTok: input ${money(rates.input)}, cache write ${money(rates.cache_write)}, ` +
    `cache read ${money(rates.cache_read)}, output ${money(rates.output)}\n`
);
console.log('| Phase | Task | input_tokens | cache_creation_input_tokens | cache_read_input_tokens | output_tokens | Cost |');
console.log('|---|---|---:|---:|---:|---:|---:|');
console.log(rows.join('\n'));
console.log(`| **Total** | ${captured.length}/${tasks.length} tasks with captured usage | ${totals.join(' | ')} | ${money(grand)} |`);
