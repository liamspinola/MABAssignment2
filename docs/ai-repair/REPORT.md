# Recorded AI-assisted locator repair

7 October 2026. This is a completed developer-assisted repair exercise using a deliberately changed label in one test's browser page. The production site was not changed. AI analysed a captured failure and proposed a POM patch; the test runner does not call an AI model.

## What happened

1. Added a strict search scenario tagged `@ai-repair`, using the existing fixture, mortgage data, response matcher and product checks.
2. Used the demo fixture to set the search button's accessible name to `Find mortgage results`. The stale POM getter still expected `Get results`.
3. Ran the scenario and preserved its real failed report, screenshot, trace and error context.
4. Asked a read-only AI reviewer to investigate those artifacts. The [actual prompt](analysis-prompt.md) and [actual response](analysis-response.md) are recorded.
5. Reviewed the proposed change and applied only the new demo getter's accessible-name repair.
6. Checked that the spec, fixture, data, main scenarios and configuration had identical SHA-256 hashes before and after the repair. Comparing the full POM source also confirmed that only the approved getter line changed.

## Why the test failed

The reported error was a **results-response timeout**. The trace showed a more useful cause: the strict click was still waiting for a button named `Get results`, while the snapshot showed its accessible name was `Find mortgage results`. All four form inputs were filled, the label-change step completed, and no results-endpoint request was recorded.

The AI review classified this as a locator mismatch. Increasing the API wait would have delayed the same failure. The visible button caption still said `Get results`, so the screenshot alone could not establish the accessible-name change.

The repair changed only `reviewedGetResultsButton` in [pages/mortgageCalculatorPage.ts](../../pages/mortgageCalculatorPage.ts):

```diff
- name: 'Get results'
+ name: 'Find mortgage results'
```

Form scope, button role, exact matching and the strict click remain. The same loan, API-error, product-count/order, payment, rate and fee assertions execute after submission.

The normal search locator still uses the site's original label. The separate fallback demonstration remains available; this repaired scenario uses its strict locator directly.

## Runs and evidence

| Run | Result | Output folder |
|---|---|---|
| Preliminary attempt | Failed during consent handling, before the demo | `test-results/ai-repair-before/` |
| Stale locator | Failed after the label change | `test-results/ai-repair-locator-before/` |
| Repaired locator | Passed: 19.7-second test, 21.5-second run | `test-results/ai-repair-after/` |
| Full eight-test suite | Verification in progress | `test-results/ai-repair-full/` |

The preliminary consent failure was preserved separately. The unchanged rerun reached the intended failure. No consent code or time limits were changed, and the preliminary failure was not attributed to the label change.

The focused command is:

```powershell
npm test -- --grep @ai-repair
```

The recorded runs used `--reporter=list,html,json`, separate `--output` folders and these report paths:

- `playwright-report/ai-repair-before/`
- `playwright-report/ai-repair-locator-before/`
- `playwright-report/ai-repair-after/`
- `playwright-report/ai-repair-full/`

Open a report with `npx playwright show-report <report-folder>`. The generated outputs are local evidence and should be left out of the submission. Keep this report, the prompt, response and [integrity record](evidence.json) with the source.

To reproduce the failure, temporarily restore only this demo getter's old `Get results` name and run the focused case; then restore the recorded repair. The default source contains the repaired version.

## Files changed

- [tests/selfHealing.spec.ts](../../tests/selfHealing.spec.ts): added the strict repair scenario and `@ai-repair` tag.
- [pages/mortgageCalculatorPage.ts](../../pages/mortgageCalculatorPage.ts): added the isolated demo getter and `assertGetResultsAfterReviewedLocatorRepair()`, which reuses the existing submission and comparison helper.
- [README.md](../../README.md): added the recorded AI example, commands and current coverage.
- `docs/ai-repair/`: this report, recorded AI exchange and integrity evidence.

Type checking and the unchanged focused scenario passed after the repair. The passing trace confirms a strict click on `Find mortgage results`, one matching mortgage POST, HTTP 200, loan amount £280,000 and ten products. It records ten product-code checks and payment/rate/fee reads for all ten cards, with no assertion failures or retries.