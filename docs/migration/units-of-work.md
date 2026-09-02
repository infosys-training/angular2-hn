# Units of Work — Angular 9 → 20 Migration

Each unit is an independent AIDLC task: it has a scope, the changes expected, and
acceptance criteria that are verified **before** the next unit starts.

Standard acceptance criteria (SAC) applied to every construction unit:

- SAC1 `npm install` completes without unresolved peer errors.
- SAC2 `npx ng build` succeeds (production configuration once it is the default).
- SAC3 `npx ng test --watch=false` exits 0 (Karma compiles and runs headlessly).
- SAC4 `@angular/*` versions in `package.json` all match the target major.
- SAC5 No new runtime `console` errors on the feeds route (spot-checked at the end).

## Phase A — Inception

| ID | Unit | Deliverable | Acceptance |
|---|---|---|---|
| A1 | Read current config + `src/app` structure | inventory in BRD §3 | BRD lists every version and config file |
| A2 | Enumerate breaking changes 9→20 | BRD §4 | one subsection per major, cross-cutting items in §5 |
| A3 | Decompose into units of work | this document | every breaking change maps to ≥1 unit |

## Phase B — Construction: per-major bumps

| ID | Unit | Key breaking changes handled | Acceptance |
|---|---|---|---|
| B1 | `ng update @angular/core@10 @angular/cli@10` | `.browserslistrc`, TS 3.9, `extractCss`, tsconfig solution style | SAC1–4 |
| B2 | `…@11` | TS 4.0, `TestBed.inject`, `waitForAsync`, IE9/10 drop | SAC1–4 |
| B3 | `…@12` | Ivy default, production-by-default build, dart-sass, TS 4.2 | SAC1–4 |
| B4 | `…@13` | View Engine removed, IE11 polyfills removed, TS 4.4, karma 6 | SAC1–4 |
| B5 | `…@14` | typed forms (n/a — no forms), `Protractor` deprecation, TS 4.7 | SAC1–4 |
| B6 | `…@15` | **Protractor removed** → delete `e2e/`, drop `ng e2e` target, TS 4.8 | SAC1–4 + `ng e2e` no longer references protractor |
| B7 | `…@16` | zone.js 0.13, TS 5.0, `RouterEvent` cleanups | SAC1–4 |
| B8 | `…@17` | control-flow availability, `browserTarget`→`buildTarget`, `RouterLinkWithHref` removal, zone.js 0.14, TS 5.2 | SAC1–4 |
| B9 | `…@18` | explicit `standalone: false`, `provideHttpClient` opportunity, karma builder move | SAC1–4 |
| B10 | `…@19` | `standalone: true` default (explicit flags mandatory), `TestBed.get` removal | SAC1–4 |
| B11 | `…@20` | Node ^20.19/^22.12/^24, TS 5.8, zone.js 0.15, `application` builder output layout | SAC1–4 |

## Phase C — Construction: cross-cutting breaking changes

| ID | Unit | Scope | Acceptance |
|---|---|---|---|
| C1 | RxJS 6 → 7 | remove `rxjs-compat`; `rxjs/Subscription`, `rxjs/Observable` deep imports → `rxjs`; verify `map` pipe usage | build+test pass with `rxjs@~7.8` and no `rxjs-compat` in `package.json` |
| C2 | zone.js modernisation | `zone.js/dist/zone` → `zone.js`; polyfills moved to `angular.json` | build passes with empty `src/polyfills.ts` removed from build options |
| C3 | tslib / @types/node / TypeScript | `tslib@^2`, `@types/node@^22`, `typescript@~5.8` | `tsc` clean via `ng build` |
| C4 | Ivy / strict template settings | `tsconfig.json` `strictTemplates` + Angular compiler options reviewed | build passes with the settings the CLI migration produced |
| C5 | TSLint → ESLint | `ng add @angular-eslint/schematics`; delete `tslint.json`, drop `tslint`/`codelyzer`; port relevant rules (`component-selector`, `directive-selector`, quotes, max-line-length) | `npm run lint` exits 0 through angular-eslint |
| C6 | Karma headless | `karma.conf.js` `ChromeHeadlessNoSandbox` custom launcher, `singleRun` via CLI | `npm test -- --watch=false` exits 0 in CI/container |
| C7 | E2E replacement | delete Protractor assets; add Playwright config + smoke spec, `e2e` npm script | `npm run e2e` runs Playwright against the dev server |
| C8 | Application builder + output layout | `angular.json` build target → `:application`, `browser`/`outputPath`, `polyfills` array, `buildTarget` | `dist/angular-hnpwa/browser/index.html` + `ngsw.json` produced |
| C9 | Standalone architecture | converted every component/pipe to standalone and pruned all NgModules instead of stamping `standalone: false` (angular-eslint's `prefer-standalone` rejects the opt-out); routing via `provideRouter` + lazy route files, bootstrap via `bootstrapApplication` | build+test+lint pass on v19/20 with no NgModule left |
| C10 | Control flow + `inject()` | `ng generate @angular/core:control-flow` and `@angular/core:inject`; `CommonModule` no longer needed anywhere | no `*ngIf`/`*ngFor`/`*ngSwitch` or constructor injection remains; lint clean |

## Phase D — Operation config

| ID | Unit | Scope | Acceptance |
|---|---|---|---|
| D1 | `.travis.yml` | Node 22, `npm ci`, `npm run lint`, `npm test -- --watch=false`, `npm run build` | file reflects the new toolchain |
| D2 | `firebase.json` / `.firebaserc` | `public: dist/angular-hnpwa/browser`, SPA rewrite, service-worker/`index.html` cache headers | paths match the v20 build output |
| D3 | `ngsw-config.json` | schema path + asset globs valid for esbuild output (hashed `.js`/`.css`, `manifest.webmanifest`) | `ngsw.json` generated on production build |
| D4 | `README.md` | replace ejected-webpack instructions with Angular CLI 20 commands, Node requirement, test/lint/e2e commands | instructions reproduce the build from a clean clone |

## Phase E — Metrics

| ID | Unit | Scope | Acceptance |
|---|---|---|---|
| E1 | Per-task token/cost capture | log `input_tokens`, `cache_creation_input_tokens`, `cache_read_input_tokens`, `output_tokens` per unit, multiply by per-million rates | `aidlc-cost-table.md` populated for every unit above |
| E2 | Prompt-cache discipline | stable byte-identical prefix (package.json + angular.json + tsconfigs + file tree + conventions) with only the task instruction varying | prefix template committed in `prompt-prefix.md`, cache-read tokens non-zero from task 2 onward |

## Final state

| Check | Command | Result |
|---|---|---|
| install | `npm install` | clean (`legacy-peer-deps=true` in `.npmrc`) |
| lint | `npm run lint` | angular-eslint, all files pass |
| unit tests | `npm test -- --watch=false` | 6/6 pass on ChromeHeadlessNoSandbox |
| dev build | `npm run build -- --configuration development` | succeeds |
| prod build | `npm run build` | succeeds; emits `ngsw-worker.js` + `ngsw.json` into `dist/angular-hnpwa/browser` |
| e2e | `npm run e2e` | 3/3 Playwright specs pass |

Deviations from the plan:

- C9 became a full standalone conversion rather than explicit `standalone: false` flags (see above).
- `@angular/core:explicit-standalone-flag` does not exist in the installed Angular versions; the
  `standalone-migration` schematics were used instead.
- `src/polyfills.ts` and `src/test.ts` were deleted: the `@angular/build` builders take
  `polyfills: ["zone.js"]` / `["zone.js", "zone.js/testing"]` from `angular.json` and initialise
  the test environment themselves.
- `manifest.webmanifest` never existed in this repo (only `src/manifest.json`), so `ngsw-config.json`
  and the asset lists now point at `manifest.json` and the duplicate `<link rel="manifest">` in
  `src/index.html` was removed.
- E1 token counts are recorded as `not captured`, not estimated — see [`aidlc-metrics.md`](aidlc-metrics.md).
