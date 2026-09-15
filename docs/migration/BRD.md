# BRD — Angular 9 → Angular 20 Migration (angular2-hn)

## 1. Background

`angular2-hn` is a Hacker News PWA (App Shell + Angular service worker, SCSS themes,
Firebase hosting). It is pinned to Angular 9.0.x with a legacy toolchain (View Engine
defaults, TSLint + codelyzer, Protractor e2e, `rxjs-compat`, TypeScript 3.7).
The toolchain no longer installs cleanly on supported Node versions and receives no
security updates.

## 2. Objective

Bring the application to the latest stable Angular (20.x) with a supported toolchain,
without changing user-visible behaviour: feeds (news/newest/show/ask/jobs), item
details with nested comments, user profiles, settings/theme engine, offline PWA.

## 3. Current vs target state

| Concern | Current (as-is) | Target (to-be) |
|---|---|---|
| @angular/* | ~9.0.1 | ^20.x |
| @angular/cli, @angular-devkit/build-angular | ~9.0.2 / ~0.900.2 | ^20.x |
| TypeScript | ~3.7.5 | ~5.8.x |
| RxJS | ~6.5.4 + `rxjs-compat` ^6.5.2 | ~7.8.x, `rxjs-compat` removed |
| zone.js | ~0.10.2 (`zone.js/dist/zone`) | ~0.15.x (`zone.js`) |
| tslib | ^1.10.0 | ^2.x |
| @types/node | ^12 | ^20/^22 |
| Node runtime | Node 6.9 in CI (!) | ^20.19 \|\| ^22.12 \|\| ^24 |
| Lint | TSLint 5 + codelyzer 5 (`tslint.json`) | angular-eslint (`.eslintrc.json`) |
| Unit tests | Karma 4 + Jasmine 3.4, `browsers: ['Chrome']` | Karma (angular-devkit builder) + Jasmine, ChromeHeadlessNoSandbox |
| E2E | Protractor 5.4 (`e2e/protractor.conf.js`) | Protractor removed (deleted in v12–15); Playwright |
| Build target | `@angular-devkit/build-angular:browser` (`aot`, `extractCss`) | `:application` builder, `browser` + `outputPath` object form |
| Compiler | View Engine (Ivy opt-in) | Ivy only |
| Config | `angular.json` v1, `defaultProject` | `angular.json` v1 with `cli.defaultProject` removed |
| Ops | `.travis.yml` (Node 6.9), `firebase.json` public `dist` | Node 22 CI, `dist/angular-hnpwa/browser` |

## 4. Breaking changes by major version

### 9 → 10
- `browserslist` + `.browserslistrc` consolidated; `browserslist` file still read but
  the CLI expects `.browserslistrc`.
- TypeScript 3.9; stricter `tsconfig` (`"module": "esnext"` unchanged), solution-style
  `tsconfig.base.json` introduced (CLI migration rewrites `tsconfig.json`).
- `@angular-devkit/build-angular:browser` drops `extractCss` default change
  (CSS extracted in production by default; option deprecated).
- `styles`/`scripts` `lazy` → `inject`/`bundleName`.
- Node 8 support dropped; `entryComponents` deprecated.

### 10 → 11
- TypeScript 4.0; Node 10.13+ required.
- `TestBed.get()` deprecated in favour of `TestBed.inject()`.
- `async()` test helper deprecated → `waitForAsync()`.
- Default browser support drops IE 9/10 and IE mobile.
- Webpack 5 opt-in; `tslint`/`codelyzer` deprecated (ESLint is the recommended path).

### 11 → 12
- **View Engine deprecated; Ivy is the default and only supported compiler** for apps
  (`enableIvy` in `tsconfig` no longer needed; `angular.json` `aot: true` is default).
- Production builds default to `--prod`-equivalent (`ng build` = production).
- `IE11 support deprecated`; `strictTemplates`/`strict` mode recommended.
- TypeScript 4.2; Sass module system (`@use`) — legacy `node-sass` removed in favour of
  `sass` (dart-sass).
- `Protractor` no longer added to new projects.
- `emitDecoratorMetadata` no longer required.

### 12 → 13
- **View Engine removed.** All libraries must be Ivy-compatible; `ngcc` legacy path
  removed for libs that ship View Engine metadata.
- **IE11 support removed** — polyfills for IE deleted from `polyfills.ts`.
- TypeScript 4.4; `target: es2017`/`es2020`; `lib` updated.
- Node 12 dropped (12.20+/14.15+/16.10+).
- `$localize` / i18n `extract-i18n` changes; `ng build` outputs ES2020 only.
- Angular Package Format changes; `karma` 6.
- `RouterLinkWithHref` merged behaviour begins.

### 13 → 14
- TypeScript 4.6/4.7; **strict typing for forms** (`FormControl<T>` — typed forms);
  untyped aliases `UntypedFormControl`/`UntypedFormGroup` provided by a migration.
- Standalone components/directives/pipes introduced (developer preview).
- `ng completion`; `Protractor` builder deprecated; `ng e2e` requires a third-party
  builder.
- Node 12/14.15 dropped (14.15+/16.10+).
- Optional `inject()` in field initialisers; `ComponentFactoryResolver` deprecated.

### 14 → 15
- **Protractor support removed** (`@angular-devkit/build-angular:protractor` deleted).
- Node 14 dropped (14.20/16.13/18.10+).
- TypeScript 4.8; `@angular/localize` / `@angular/platform-server` API cleanups.
- `enableIvy`, `entryComponents`, `relativeLinkResolution`, `initialNavigation` legacy
  options removed; `ngcc` removed entirely.
- Sass `@import` of Angular Material theming deprecated (n/a here).
- Stable standalone APIs (`bootstrapApplication`, `provideRouter`, `importProvidersFrom`).

### 15 → 16
- TypeScript 4.9/5.0; **`zone.js` 0.13**; Node 16.14+/18.10+.
- Signals & `takeUntilDestroyed` introduced; `Router` guards can be functional.
- `RouterEvent`/`Router` public field cleanups; `ngcc` gone from the pipeline.
- Standalone migration schematics available (`ng g @angular/core:standalone`).
- `@Directive`/`@Component` `entryComponents` removed; `ReflectiveInjector` removed.

### 16 → 17
- **New `application` builder + Vite dev server** (`@angular-devkit/build-angular:application`);
  `browser` builder still available. `browserTarget` → `buildTarget` in serve/extract-i18n.
- Output path becomes `dist/<project>/browser`.
- **Built-in control flow** (`@if` / `@for` / `@switch`) — schematic
  `ng g @angular/core:control-flow`.
- `RouterLinkWithHref` removed (use `RouterLink`).
- Node 16 dropped (18.13+/20.9+); TypeScript 5.2; zone.js 0.14.
- `.browserslistrc` no longer needed (baseline from `browsers` in `angular.json`).

### 17 → 18
- **`standalone` defaults change direction**: schematics generate standalone; NgModule
  components must be explicit (`standalone: false`) —
  `ng g @angular/core:explicit-standalone-flag`.
- `HttpClientModule` deprecated → `provideHttpClient()`.
- Zoneless change detection (experimental); `provideExperimentalZonelessChangeDetection`.
- `ng build` requires Node 18.19/20.11+; TypeScript 5.4.
- `karma` builder moves under `@angular-devkit/build-angular:karma` with `builderMode`.

### 18 → 19
- **`standalone: true` is the default** — every NgModule-declared component/directive/pipe
  must carry `standalone: false` (migration is mandatory, not optional).
- `TestBed.get()` removed (use `TestBed.inject()`).
- `provideExperimentalZonelessChangeDetection` renamed; `afterRender` API changes.
- Node 18.19+/20.11+/22.0+; TypeScript 5.5/5.6.
- Unused standalone imports reported as errors by the language service.
- `@angular/platform-browser-dynamic` deprecated for standalone bootstrap.

### 19 → 20
- Node ^20.19 || ^22.12 || ^24 required (Node 18 dropped).
- TypeScript ~5.8; `zone.js` 0.15.
- `@angular-devkit/build-angular:browser` deprecated (`application`/`browser-esbuild`
  preferred); `dist/<project>/browser` output confirmed.
- Removals: `InjectFlags`, `ExperimentalPendingTasks`, `ngPreserveWhitespaces` cleanups,
  `TestBed.flushEffects`, deprecated `Router` fields, `DATE_PIPE_DEFAULT_TIMEZONE`
  behaviour, `provideServerRendering` moves.
- Structural directives still supported but control flow is the documented default.

## 5. Cross-cutting workstreams

1. **RxJS 6 → 7**: delete `rxjs-compat`; replace deep imports
   (`rxjs/Subscription`, `rxjs/Observable`) with `rxjs` root imports; `toPromise()`
   deprecated; `Observable.prototype` patch operators unavailable.
   Affected: `src/app/user/user.component.ts`,
   `src/app/item-details/item-details.component.ts`,
   `src/app/shared/services/hackernews-api.service.ts`.
2. **zone.js**: `import 'zone.js/dist/zone'` → `import 'zone.js'`; polyfills eventually
   move from `src/polyfills.ts` into `angular.json` `polyfills: []`.
3. **TypeScript 3.7 → 5.8**: `target`/`lib`/`module` updates, `useDefineForClassFields`
   implications, stricter template type-checking if strict mode is adopted.
4. **Lint**: `tslint.json` + `codelyzer` → `ng add @angular-eslint/schematics`
   (performed at v13+ where the schematic is stable), `angular.json` `lint` target
   switches to `@angular-eslint/builder:lint`.
5. **E2E**: Protractor is removed in v15 — `e2e/` (protractor.conf.js, app.po.ts,
   app.e2e-spec.ts, e2e/tsconfig.json) is deleted and replaced with Playwright specs
   driving the dev server.
6. **Ops config**: `.travis.yml` Node 6.9 → 22, `firebase.json` `public` path follows
   the new build output, `ngsw-config.json` schema/asset globs verified against the
   esbuild output, README build instructions rewritten (the README still documents the
   old *ejected webpack* flow).

## 6. Constraints & assumptions

- No functional/UI change is in scope; SCSS, templates and component logic change only
  where the compiler/API forces it.
- Migration must be strictly sequential (`9→10→…→20`); Angular does not support skipping
  majors.
- Node 22.12 is used locally (`nvm use 22.12`); older CLI versions (9–13) emit engine
  warnings under Node 22 and are executed with `npm install --legacy-peer-deps` where
  peer ranges conflict.
- The repo has no `*.spec.ts` files at the start, so "existing specs pass" means the
  Karma target must still start, compile and exit 0.

## 7. Acceptance criteria (programme level)

- `npm install` completes; no `rxjs-compat`, `tslint`, `codelyzer`, `protractor` in
  `package.json`.
- `ng build --configuration production` succeeds and emits the Angular service worker.
- `ng test --watch=false` exits 0 headlessly.
- `ng lint` runs through angular-eslint with no errors.
- App renders feeds, item details, user page and settings identically to the v9 build.
