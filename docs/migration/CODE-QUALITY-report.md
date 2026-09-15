# Code Quality Assurance of the Migrated Angular 20 Codebase

Repository: infosys-training/angular2-hn — PR #35 (branch `devin/1787936828-ng9-to-ng20-migration`)
Date of measurement: 15 September 2026. All figures below were produced by running the tooling on the migrated branch; anything not executed is labelled as such.

---

## 1. The question this answers

"The migration ran in 35 minutes. How do we know the code is good?"

The answer is a single quality gate — one command, `npm run verify` — that must pass before any change merges, plus two hosted scanners wired into CI for security and maintainability. Four layers were implemented in this piece of work:

1. Test coverage measurement (was not measured before).
2. SonarQube / SonarCloud configuration for maintainability, complexity, duplication and security hotspots.
3. Snyk for dependency vulnerabilities (SCA) and source-code security scanning (SAST).
4. One unified gate, `npm run verify`, wired into Travis CI so it runs on every push.

---

## 2. What runs, and what it caught

| Layer | Command | Status on the migrated branch | What it protects against |
|---|---|---|---|
| Lint (angular-eslint) | `npm run lint` | Pass — 0 errors, 0 warnings | Anti-patterns, unsafe Angular usage, dead code |
| Unit tests + coverage | `npm run test:ci` | Pass — 6/6 specs | Regressions in logic |
| Production build | `npm run build --configuration production` | Pass — 309.83 kB initial, 84.34 kB transferred | Compile and template type errors, bundle bloat |
| End-to-end (Playwright) | `npm run e2e` | Pass — 3/3 tests | Broken routing, broken rendering, broken settings panel |
| Runtime dependency audit | `npm run audit:deps` | Pass — 0 vulnerabilities in shipped dependencies | Known CVEs reaching production |
| Full dependency audit (informational) | `npm run audit:all` | 6 findings, all build-time only | Awareness of tooling debt |
| Unified gate | `npm run verify` | Pass end to end | Anything above regressing silently |
| SonarQube | `npm run sonar` | Configured, not executed — needs `SONAR_TOKEN` and a server | Maintainability rating, cognitive complexity, duplication, security hotspots |
| Snyk SCA | `npm run snyk:deps` | Configured, not executed — needs `SNYK_TOKEN` | Deeper CVE database than npm audit, plus fix advice |
| Snyk Code (SAST) | `npm run snyk:code` | Configured, not executed — needs `SNYK_TOKEN` | Injection, unsafe DOM writes, secret handling |

### A real defect this work found and fixed

Adding the runtime dependency audit surfaced a **high-severity CVE in a shipped dependency**: `node-fetch` below 2.6.7 forwards secure headers to untrusted sites (GHSA-r683-j2x4-v87g, CVSS 8.8). Investigation showed the package was never used at runtime — only its TypeScript type definitions were needed by `unfetch`. It was moved out of the shipped dependency list and replaced with the types-only package, taking the production dependency tree to **zero known vulnerabilities**. This is exactly the class of issue a gate is meant to catch, and it was invisible before this work.

---

## 3. Test coverage — the honest picture

Coverage is now measured and published in the formats SonarQube and CI consume (`lcov.info`, `cobertura-coverage.xml`, plus a browsable HTML report).

**Coverage of the code that has tests:** 87.09% of statements, 86.66% of lines, 91.66% of functions, 61.53% of branches.

**Coverage of the application as a whole: low.** Only 2 of 24 source files are exercised by the 6 unit specs — the comment pipe and the settings service. The 11 components and the Hacker News API service have no unit tests; they are covered only indirectly by the 3 Playwright end-to-end tests.

This is the codebase's genuine weak spot, and it is inherited, not introduced: **the repository had zero tests before the migration.** The recommendation is to treat 87% as a floor for the tested files, require coverage on new and changed code only (Sonar's "new code" quality gate), and add specs for the API service and the feed/item components as the next increment. Failing the build on whole-codebase coverage today would simply mean a permanently red build that everyone learns to ignore.

---

## 4. Why each tool is in the set, in one line each

- **ESLint (angular-eslint)** — the fastest feedback loop and the only one that understands Angular idioms; it replaced the deprecated TSLint/codelyzer during the migration and is already green.
- **Coverage** — SonarQube's maintainability and reliability ratings are close to meaningless without it, and it makes "is this tested?" an objective question.
- **SonarQube / SonarCloud** — the metrics ESLint does not produce: cognitive complexity, duplication, security hotspots, and a trend line over time that management can actually track. It consumes the coverage and ESLint reports rather than duplicating them.
- **Snyk SCA (`snyk test`)** — the migration jumped roughly 11 major versions of every direct and transitive dependency; this is precisely the moment to take a fresh vulnerability baseline. Broader database and better fix guidance than `npm audit`.
- **Snyk Code (`snyk code test`)** — static application security testing on our own source, which no linter or dependency scanner does.
- **`npm audit`** — free, zero setup, no vendor dependency; used as the blocking check for shipped dependencies so security coverage never depends on a token being present.

---

## 5. How it is wired into CI

Travis CI now runs two jobs:

**Job 1 — the gate (blocking).** `npm ci` → lint → unit tests with coverage → production build → Playwright e2e → runtime dependency audit (fails on high or critical) → full audit for information. This is the same sequence as `npm run verify`, so what a developer runs locally is exactly what CI runs. Firebase deployment happens only after this job succeeds.

**Job 2 — code quality (separate stage).** Produces the ESLint JSON report and coverage, then runs SonarQube, Snyk SCA, Snyk Code, and `snyk monitor` on master. Scanner versions are pinned for reproducibility. If a token is missing the job **fails loudly** rather than passing with a skip message — a silent skip is how security gates quietly stop existing. This job does not deploy.

Recommended next step: make Job 1 a required status check on the branch, so nothing merges without it.

---

## 6. What is not yet proven

Stated plainly, so nobody is surprised in a follow-up review:

- **SonarQube has not been run.** The configuration is committed and validated (correct source and test paths, coverage and ESLint report paths resolved against files that exist), but no scan has executed because no server URL and `SONAR_TOKEN` are available. There is therefore **no quality gate result, no maintainability rating, and no duplication figure** yet.
- **Neither Snyk scan has been run**, for the same reason: `SNYK_TOKEN` is not provisioned. The npm audit result stands on its own and is genuine.
- **Whole-codebase test coverage is low** (2 of 24 source files). See section 3.
- **CI has not executed this configuration yet.** Travis is configured for `master` only; every command in it was run locally on this machine and passed, and the YAML parses, but the first real CI run will happen on merge.
- **Six build-time dependency vulnerabilities remain** (3 moderate, 3 high) in test and build tooling — `minimatch`, `brace-expansion`, `tmp`, `ajv`, `qs`, `body-parser`, all transitive. None ship to users. They were deliberately not force-resolved, because doing so would mean overriding Angular's own pinned tooling versions; the correct fix is the next Angular CLI patch release.

---

## 7. Recommended rollout

1. Provision `SONAR_TOKEN` and `SNYK_TOKEN` in CI, then run both scanners to establish the baseline. This is the single highest-value next action and takes minutes.
2. Make the gate a required check on the default branch.
3. Set Sonar's quality gate on **new code** — clean as you go, rather than failing on a decade of inherited debt.
4. Add unit specs for the API service and the feed and item components; ratchet the coverage floor upward as they land.
5. Enable stricter TypeScript settings incrementally — the highest-value quality change still outstanding, and one no scanner can substitute for.
6. Re-examine `legacy-peer-deps=true` in `.npmrc`, which was required during the migration and may no longer be needed.

---

## 8. One-slide summary

The migrated Angular 20 codebase passes a single automated gate — lint, unit tests with coverage, production build, end-to-end tests, and a dependency vulnerability check — and that gate now runs in CI on every push. The work found and eliminated a high-severity CVE in a shipped dependency; the production dependency tree has zero known vulnerabilities. SonarQube and Snyk are configured and ready but have not yet run, because they need credentials. The remaining known weakness is test breadth: the codebase had no tests at all before the migration, and it now has 6 unit specs and 3 end-to-end tests, which is a starting point rather than a finish line.
