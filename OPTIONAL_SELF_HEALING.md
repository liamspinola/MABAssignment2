# Optional self-healing demo

The assignment mentions self-healing as an optional example of maintainability. This work includes a [recorded AI-assisted locator repair](docs/ai-repair/REPORT.md) and a separate controlled fallback demo. The AI reviewed a real failed run and proposed a POM fix during development. Tests do not call an AI model or rewrite themselves.

## Run

```powershell
npm test -- --grep @self-healing
npm test -- --grep @ai-repair
```

The first command runs all four optional cases; the second runs just the reviewed-repair scenario. All four also run with normal `npm test`, bringing the suite to eight tests.

## What the tests prove

| Test | Check |
|---|---|
| Reviewed AI repair | Use the repaired strict locator and retain every existing mortgage result check; the failed run, AI diagnosis and one-line patch are recorded separately |
| Changed button label | Rename the accessible label, recover the same search submit control and check real results against the API |
| Missing replacement | Reject recovery when no approved control exists inside the purchase form, even if one exists elsewhere |
| Ambiguous replacement | Reject recovery when two approved controls exist; confirm the form was not submitted |

Both live scenarios use the existing page fixture and mortgage criteria. Their demo fixture sets `aria-label="Find mortgage results"`, overriding the button's original accessible name, `Get results`. It checks the original locator matched one button before the change and none afterwards.

The reviewed-repair scenario originally failed with a stale strict locator. The AI examined its trace and snapshot and proposed changing only the demo getter's accessible name. The recorded repair preserves the spec, fixture, data, response matcher and product assertions. The rerun passed; [the report](docs/ai-repair/REPORT.md) contains the actual AI exchange, diff and integrity checks.

The POM then uses `button[type="submit"].js-submit-form-button` inside the initial purchase form. This selector was checked against the live page and identified the same button as the original locator. Recovery requires exactly one visible, enabled control that is not marked as loading or disabled. Missing or ambiguous matches stop before clicking.

The primary role/name locator follows [Playwright's locator guidance](https://playwright.dev/docs/locators#locate-by-role). The fallback is specific to this form and is enabled only by the demo's explicit recovery method.

The recovered control performs the actual click. The same response matcher and assertions used by the main search test then check the mortgage criteria, loan amount, API errors, product count/order, payments, rates and fees. API or product failures still fail the test.

The two safety tests use local HTML. They check the rejection reason and a form submission counter of zero. They do not need the website or an API response.

## Where the work lives

- [tests/selfHealing.spec.ts](tests/selfHealing.spec.ts): four scenarios, named report steps, `@self-healing` / `@ai-repair` tags and trace capture.
- [fixtures/selfHealingFixtures.ts](fixtures/selfHealingFixtures.ts): isolated label change and local HTML for the safety cases.
- [pages/mortgageCalculatorPage.ts](pages/mortgageCalculatorPage.ts): repaired demo locator, approved fallback, candidate checks and recovery evidence. `submitAndAssertGetResults()` shares the existing response and product checks between strict search and both demos.
- [README.md](README.md): run command, coverage and reporting notes.
- [CHANGE_REPORT.md](CHANGE_REPORT.md): updated source locations and a link to this separate optional-task report.
- [docs/ai-repair/](docs/ai-repair/REPORT.md): actual failure investigation, AI prompt/response, repair diff and file-integrity record.

No dependency or configuration-file changes were needed. The normal search/update/sort/filter/navigation scenarios keep their existing locators and checks. The DOM change exists only in the demo's browser page and ends with that test.

## Evidence and verification

The live fallback test adds a `locator-recovery` annotation and a `get-results-locator-recovery` JSON attachment to the HTML report. The JSON records the original and recovered selectors, their match counts and the changed accessible label. Traces are retained for all four optional tests, including passes; ordinary tests retain their existing failure-only capture.

**Earlier run, 7 October 2026:** `npm run typecheck` passed and all **seven Chrome tests passed in 2.6 minutes**, with zero retries, before adding the recorded AI-repair scenario. The new focused repair run passed in 21.5 seconds; full eight-test verification is in progress.

| Optional test | Result | Duration |
|---|---|---:|
| Changed button label | Passed | 15.6 seconds |
| Missing replacement | Passed | 316 ms |
| Ambiguous replacement | Passed | 292 ms |

The verification run saved its report separately to preserve earlier results:

```powershell
$env:PLAYWRIGHT_HTML_OUTPUT_DIR = 'playwright-report/optional-self-healing'
npm test -- --output=test-results/optional-self-healing
```

Open it with `npx playwright show-report playwright-report/optional-self-healing`. Traces are in `test-results/optional-self-healing/`; `.last-run.json` records `passed` and no failed tests. Leave these generated outputs out of the submission.

The first run stopped during test loading because the trace option was inside `describe`. Moving that option to file level fixed the setup error before any browser tests ran. Independent source review found no blocking issues.
