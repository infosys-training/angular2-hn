#!/usr/bin/env node
// Renders the Devin ACU cost table for the Angular 9 -> 20 migration.
//
//   node scripts/aidlc-acu-cost.mjs [--rate <usd-per-acu>]
//
// Reads docs/migration/acu-usage.json and writes the table to stdout.

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const usage = JSON.parse(readFileSync(resolve(root, 'docs/migration/acu-usage.json'), 'utf8'));

const rateFlag = process.argv.indexOf('--rate');
const rate = rateFlag === -1 ? usage.rate.price_per_acu : Number(process.argv[rateFlag + 1]);
if (!Number.isFinite(rate) || rate <= 0) {
  console.error('--rate must be a positive number of USD per ACU');
  process.exit(1);
}

const money = n => `$${n.toFixed(2)}`;
const hms = s => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

const rows = usage.tasks.map(t => [
  t.id,
  t.task,
  hms(t.duration_seconds),
  t.acus.toFixed(4),
  money(t.acus * rate)
]);

const totalAcus = usage.tasks.reduce((a, t) => a + t.acus, 0);
const totalSeconds = usage.tasks.reduce((a, t) => a + t.duration_seconds, 0);
rows.push(['**Total**', '**Angular 9 → 20 migration**', `**${hms(totalSeconds)}**`, `**${totalAcus.toFixed(4)}**`, `**${money(totalAcus * rate)}**`]);

const header = ['Unit', 'Task', 'Duration (mm:ss)', 'ACUs', `Cost @ ${money(rate)}/ACU`];
const out = [
  `| ${header.join(' | ')} |`,
  `|${header.map(() => '---').join('|')}|`,
  ...rows.map(r => `| ${r.join(' | ')} |`)
];

console.log(out.join('\n'));
console.log('');
console.log(`Measured session ACUs at end of migration work: ${usage.measured.migration_acus}`);
console.log(`Total cost: ${money(usage.measured.migration_acus * rate)} at ${money(rate)}/ACU`);
