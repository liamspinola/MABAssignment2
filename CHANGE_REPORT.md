# Assignment review changes

7 October 2026. This report covers the requested improvements: **1, 2, 3 and 6**.

The later optional recovery demo is documented in [OPTIONAL_SELF_HEALING.md](OPTIONAL_SELF_HEALING.md).

The recorded AI failure investigation and locator repair are in [docs/ai-repair/REPORT.md](docs/ai-repair/REPORT.md).

## File locations

Line numbers reflect the current source, including the later optional demo.

| Change | File and starting lines |
|---|---|
| Criteria, filter and pagination types | `pages/mortgageCalculatorPage.ts`: 4, 11, 16 |
| Form filling and response matching | `pages/mortgageCalculatorPage.ts`: 73, 80, 87 |
| Initial search, update and sorting calls | `pages/mortgageCalculatorPage.ts`: 136, 311, 420 |
| Pagination baseline, named steps and identity checks | `pages/mortgageCalculatorPage.ts`: 200, 217, 286 |
| Shared API checks and preserved UI comparisons | `pages/mortgageCalculatorPage.ts`: 325, 353 |
| Filter readiness, first response and final dropdown checks | `pages/mortgageCalculatorPage.ts`: 43, 451, 457 |
| Updated scenario calls and update-step wording | `tests/search.spec.ts`: 8, 14, 28, 43, 53 |
| Coverage, method explanation and latest run | `README.md`: 27, 37, 65 |
| Historical handoff notice and opening | `HANDOFF.md`: 1, 3, 5 |

The sections below explain each change and name the affected methods.

## 1. Finish the first filter update before applying the second

**Where:** [pages/mortgageCalculatorPage.ts](pages/mortgageCalculatorPage.ts), `resultsFilterForm`, `assertResultsResponse()`, `waitForFiltersReady()` and `filterResultsByFixedTermAndPaymentMethod()`.

Previously, the test captured the fixed-term response but discarded it and immediately changed the payment method. Receiving response headers does not mean the application has finished updating. The application's filter form uses `js-form-submitting` to prevent another submission during that update.

The flow now:

1. Waits for the filter form to be visible and ready before selecting the fixed term.
2. Captures the fixed-term response and checks HTTP 200, JSON content, the expected loan amount, no API error and a non-empty product array.
3. Checks that the response contains the requested fixed term.
4. Waits for the form to lose `js-form-submitting` before selecting Interest Only.
5. Waits for the final update to finish before checking the final dropdown values.

The existing response checks were moved into `assertResultsResponse()` and reused by the product comparison helper. This avoids duplicating the API checks. No fixed delays or extra server requests were added.

## 2. Check both dropdowns after the combined filter update

**Where:** [pages/mortgageCalculatorPage.ts](pages/mortgageCalculatorPage.ts), the end of `filterResultsByFixedTermAndPaymentMethod()`.

Previously, the fixed-term dropdown was checked before applying the payment filter. Only the payment dropdown was checked afterwards, so a final update could reset the fixed-term selection without failing that assertion.

The final checks now require both `Fixed term = 24` and `Payment method = 3` in the dropdowns. The final request must still include both settings, the response's `formModel` must contain both settings, and the displayed products must match that response.

These are checks of the selected options and submitted settings. They do not assume that every product must have exactly 24 months or contain a `paymentMethod` field.

## 3. Verify that pagination changes and restores products

**Where:** [pages/mortgageCalculatorPage.ts](pages/mortgageCalculatorPage.ts), `PaginationBaseline`, `getAndAssertPaginatedResults()`, `navigateAndAssertResultsPage()` and `assertPaginationNavigation()`; [tests/search.spec.ts](tests/search.spec.ts), the pagination scenario.

The initial search now returns the page count and a copied list of page 1 product codes. The spec passes this baseline to the navigation helper. It is local to the scenario, with read-only TypeScript fields; the page object does not store a last-response variable.

The route remains **page 1 → page 2 → page 1 → last page → page 1**, using five server requests in total.

- Page 2's codes must differ from page 1's. Comparing sorted copies means merely reordering the same products cannot satisfy this check.
- Returning with Previous must restore the original page 1 codes in their original order.
- Returning with the numbered page 1 button must restore the same codes and order.
- Every navigation response must keep the original total page count.

All existing checks remain: response page number, displayed product count/order/details, numbered controls, current-page indicator and Previous/Next visibility at the boundaries.

No fixed product codes or page count are hardcoded. The test assumes the catalogue stays stable during this short scenario. It does not require pages to be disjoint, visit every page or prove the missing overall result count.

## 6. Simplify the methods and improve the report labels

**Where:** [pages/mortgageCalculatorPage.ts](pages/mortgageCalculatorPage.ts) and [tests/search.spec.ts](tests/search.spec.ts).

All initial-search, update, sorting and filter calls now take the same criteria object containing `propertyValue`, `deposit`, `mortgageTerm` and `income`. This also applies to the private response and product helpers. The eight-argument filter call is now `(criteria, filters)`, using the existing shared data.

The response matcher still checks the POST endpoint, all four mortgage values, mortgage purpose/type and any requested sort, filter or page settings. Its request-body variable is named `requestCriteria` to keep it distinct from the expected criteria.

The misleading step "Update the search results with no mortgage data" is now "Change the property value, deposit, income and mortgage term". Each pagination action also runs inside its own named `test.step`, so failures identify Next, Previous or the numbered destination. The spec's statement endings were made consistent.

Documentation changes:

- [README.md](README.md): updated the filter and pagination coverage, explained the shorter object-based calls, refreshed the verification result and linked this report.
- [HANDOFF.md](HANDOFF.md): labelled the document as historical, changed its opening to describe an earlier snapshot and linked the current README and this report. The earlier investigation remains available.
- [CHANGE_REPORT.md](CHANGE_REPORT.md): added this record of the changes, locations and verification.

No `.gitignore` was created, as requested. These four improvements did not change the fixtures, test data, package files or Playwright/TypeScript configuration. No Git repository, submission archive or self-healing setup was created as part of this work; the later optional demo is recorded separately.

## Verification

- `npm run typecheck`: passed.
- Full Chrome suite: **all four tests passed in 2.1 minutes**, with one worker and zero retries.
- Independent source review: passed; no missed callers or regressions found in the criteria migration, retained assertions, filter waits or pagination checks.

| Scenario | Result | Duration |
|---|---|---:|
| Search and update | Passed | 25.1 seconds |
| Pagination | Passed | 52.9 seconds |
| Sorting | Passed | 24.8 seconds |
| Combined filters | Passed | 22.8 seconds |

This run used separate output folders to preserve the earlier reports:

```powershell
$env:PLAYWRIGHT_HTML_OUTPUT_DIR = 'playwright-report/review-improvements'
npm test -- --output=test-results/review-improvements
```

The HTML report is at `playwright-report/review-improvements/index.html`. Open it with:

```powershell
npx playwright show-report playwright-report/review-improvements
```

The run status is recorded in `test-results/review-improvements/.last-run.json` as `passed`, with no failed tests. These outputs are generated locally and should be left out of the submission.

This verification covered the four main mortgage scenarios before the optional demo was added. No assertions were removed to obtain a pass, and no tests were skipped or marked as expected failures.

The missing `totalCount`, unconfirmed product-level filter rules and known filtered-pagination issue remain documented in the README. Review items 4 and 5 were outside this request.
