# Recorded AI review

Read-only AI reviewer in this Codex session, 7 October 2026. The response below was recorded before applying the proposed repair.

The captured failure is a stale locator caused by the demo’s deliberate label change. It is not evidence of a production-site defect or a slow mortgage API.

Direct observations:

- Setup completed successfully: consent was dismissed and all four mortgage values were filled.
- The fixture proved the original button matched once, changed its `aria-label` to `Find mortgage results`, then proved the old locator matched zero controls and the new name matched one. This step completed successfully in 88.6ms.
- The saved DOM shows `button "Find mortgage results": Get results` at [error-context.md:263](/C:/Repos/MABAssignment2/test-results/ai-repair-locator-before/selfHealing-Controlled-sea-b8c1a--the-mortgage-result-checks-chrome/error-context.md:263).
- The trace’s `call@42` still attempted to click the purchase form’s button named exactly `Get results`. It waited approximately 20 seconds and timed out.
- The trace contains **zero requests** to `/umbraco/surface/quickquoteresults/getresults`. The reported response timeout occurred while the click was also waiting for its missing target.
- Both current and trace-saved source contain the stale name in `reviewedGetResultsButton`.

The causal inference is straightforward: the reviewed getter no longer matches the button after the fixture changes its accessible name. Consequently, no submission occurs and no results response arrives. Increasing timeouts would not resolve that mismatch.

The smallest justified patch changes only [mortgageCalculatorPage.ts:40](/C:/Repos/MABAssignment2/pages/mortgageCalculatorPage.ts:40):

```diff
-    private get reviewedGetResultsButton() { return this.purchaseForm.getByRole('button', { name: 'Get results', exact: true }); }
+    private get reviewedGetResultsButton() { return this.purchaseForm.getByRole('button', { name: 'Find mortgage results', exact: true }); }
```

This preserves the purchase-form scope, exact role/name matching, strict click, response synchronization, criteria and all product assertions. The normal `getResultsButton` getter remains unchanged.

Confidence is **high** in the diagnosis and proposed repair. The repair has not been executed or verified by this analyst. The captured failure establishes no conclusion about backend correctness or response speed because no search request was sent. The earlier consent-handling failure is a separate run and should remain separately recorded.

Required verification:

1. Confirm the source diff changes only this getter; preserve the failed artifacts.
2. Run type-checking and rerun the unchanged `@ai-repair` scenario into separate output/report directories.
3. Inspect its trace for the successful strict click, matching POST criteria and successful execution of all existing API/UI assertions.
4. Run the full suite to verify normal searches and recovery rejection cases remain intact.

No files were edited or tests run. This is a recorded AI-assisted developer review, not runtime AI healing or Playwright native-healer execution.
