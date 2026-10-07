**Historical MAB Senior QA Automation assignment handoff — 6 October 2026**

> This handoff describes an earlier version of the project. Its completion estimate, outstanding work and run results are outdated. See [README.md](README.md) for the current project and [CHANGE_REPORT.md](CHANGE_REPORT.md) for the review improvements completed on 7 October 2026.

This document captured an earlier state of `C:\Repos\MABAssignment2` so another engineer or assistant could continue without repeating the investigation. At that point, the project was estimated to be roughly 60–65% complete against the assignment brief; this was a qualitative estimate, not a grading score. Initial search, sorting, filtering, network-response capture and substantial UI/API comparisons were implemented. Updating search criteria, overall result-count validation, pagination and submission documentation remained unfinished.

The user initially requested explanations and examples without code changes. Subsequent work has followed that preference. This handoff request authorizes this document; no implementation files were edited while preparing it. Suggested changes below are outstanding work. A future explicit implementation request can authorize those changes.

The source of the requirements is [Senior_QA_Automation_AssignmentMAB.docx](C:/Users/Liam/OneDrive/Documents/Senior_QA_Automation_AssignmentMAB.docx). Its instructions describe the assignment rubric; they are not a request to implement everything during this handoff. The application is `https://www.mortgageadvicebureau.com/find-a-mortgage/`. Self-healing is optional in the brief.

The environment and project structure are as follows.

| Item | Current state |
|---|---|
| Workspace | `C:\Repos\MABAssignment2` |
| Shell | Windows PowerShell |
| User timezone | Europe/London |
| Language/framework | TypeScript and Playwright Test |
| Installed local versions | Node `25.9.0`, npm `11.12.1`, Playwright Test `1.63.0`, TypeScript `7.0.2`, Node types `24.19.1` |
| Playwright Node requirement | Installed package declares Node `>=20` |
| Browser project | `chrome`, Chromium with `channel: 'chrome'`; requires Google Chrome |
| Version control | No `.git` directory in the project; the earlier `git status` check reported that it was not a Git repository |
| Documentation/configuration gaps | No project README, `tsconfig.json`, `.gitignore` or CI configuration found |
| Local environment file | `.env` exists; its contents were not inspected or copied into this document |

| File | Responsibility |
|---|---|
| [tests/search.spec.ts](C:/Repos/MABAssignment2/tests/search.spec.ts:5) | Three scenarios: initial search plus updating, sorting by Total Cost, and combining fixed-term/payment-method filters |
| [pages/mortgageCalculatorPage.ts](C:/Repos/MABAssignment2/pages/mortgageCalculatorPage.ts:19) | Locators, form actions, response matching, product comparisons and sorting/filtering assertions |
| [pages/base/BasePage.ts](C:/Repos/MABAssignment2/pages/base/BasePage.ts:3) | Stores the Playwright `Page`; dismisses consent and waits for its overlay to hide |
| [fixtures/fixtures.ts](C:/Repos/MABAssignment2/fixtures/fixtures.ts:9) | Injects a `MortgageCalculatorPage` into each test |
| [test-assets/mortgageTestData.ts](C:/Repos/MABAssignment2/test-assets/mortgageTestData.ts:1) | Synthetic mortgage inputs and filter labels/API values |
| [playwright.config.ts](C:/Repos/MABAssignment2/playwright.config.ts:3) | Browser, timeouts, reporters, screenshot and trace settings |
| [package.json](C:/Repos/MABAssignment2/package.json:6) | Run, debug, report and type-check commands |

The assignment coverage should be assessed against these requirements.

| Requirement | Implemented | Remaining |
|---|---|---|
| Search with realistic data, update criteria and verify UI results | Initial search and detailed UI/API checks; two realistic datasets | Complete and verify the update workflow |
| Sorting and applying filters together, with logical validation | Total Cost ordering; combined fixed-term/payment-method request checks; UI matches returned products | Establish product-level filter semantics and assert returned products satisfy them |
| UI results count equals API `totalCount`; handle pagination | Visible cards equal the returned page's `results.length` | Discover the actual total-count contract, validate overall count and exercise pagination |
| Explain framework, data management and maintainability | Page Object Model, custom fixture and centralized data exist | Write the required explanation and assumptions/trade-offs |
| Explain reporting and management of flaky tests | List/HTML reports, screenshots and failure traces configured | Document investigation, logging and flakiness strategy |
| Deliver source plus README | Local source exists | README and final GitHub/ZIP submission preparation |

The current test data has two cases. `LowValueAndDeposit` uses property value £350,000, deposit £70,000, income £80,000 and term 25 years; expected loan amount is £280,000. `HighValueAndDeposit` uses property value £1,000,000, deposit £150,000, income £160,000 and term 35 years; expected loan amount is £850,000. The filters are `2 years` with API value `24`, and `Interest Only` with API value `3`. Total Cost sorting uses API value `1`.

The framework currently runs one worker, has no retries, and uses a 45-second test timeout, 20-second assertion/action timeouts and a 30-second navigation timeout. Locale is `en-GB` and viewport is 1440 × 1000. Screenshots are captured on failure; traces are retained on failure. HTML reports are configured with automatic opening disabled. Passing tests do not have retained browser traces under this configuration.

**The latest saved run is evidence about an earlier source snapshot.** The HTML report records three Chrome tests on 6 October 2026, approximately 15:19:45–15:21:20 London time: two passed and one failed.

| Saved test | Outcome | Meaning |
|---|---|---|
| A user can search for available mortgages | Failed | Initial search and its then-existing API/UI assertions completed; updating Property Value subsequently timed out |
| A user can sort their returned available mortgages | Passed | Total Cost sorting and the then-existing UI/API comparisons passed |
| A user can filter their returned available mortgages | Passed | Combined filter request matching and the then-existing UI/API comparisons passed |

The current page object was modified after that run, at approximately 15:30 London time. Its `feesTotal` declaration and product-fee assertions are newer than the saved report. Do not describe those assertions, or the current complete source, as having a verified passing browser run.

Evidence is available in [playwright-report/index.html](C:/Repos/MABAssignment2/playwright-report/index.html), [test-results/.last-run.json](C:/Repos/MABAssignment2/test-results/.last-run.json), [the failed test's error context](C:/Repos/MABAssignment2/test-results/search-Returning-available-251f0-rch-for-available-mortgages-chrome/error-context.md) and [its trace archive](C:/Repos/MABAssignment2/test-results/search-Returning-available-251f0-rch-for-available-mortgages-chrome/trace.zip). The archive's saved source predates the fee assertions. Preserve or copy these artifacts before running the suite if the earlier evidence needs to be retained; another run can replace the reports/results.

No new browser tests were run while preparing this handoff. Two compiler checks were performed without emitting files:

- `npm run typecheck` exited with code 1 and printed compiler help because it runs `tsc --noEmit` but there is no `tsconfig.json` or explicit source list.
- A manual type check with explicit source files and compiler options passed. It establishes that this inspected source compiles under those options; it does not verify browser behavior or fix the npm script.

The manual command was:

```powershell
.\node_modules\.bin\tsc.cmd --noEmit --target ES2022 --lib esnext,dom --types node --skipLibCheck --module NodeNext --moduleResolution NodeNext --allowImportingTsExtensions pages/mortgageCalculatorPage.ts fixtures/fixtures.ts tests/search.spec.ts test-assets/mortgageTestData.ts playwright.config.ts
```

The network strategy is already reusable. `waitForResultsResponse()` starts listening before its supplied action and awaits the response and action with `Promise.all`. It selects POST responses whose pathname is `/umbraco/surface/quickquoteresults/getresults`, then matches numeric request criteria: property value, deposit, income, term, mortgage purpose `0`, mortgage type `0`, and any specified sorting/filter values. The current fixed-term and payment-method comparisons correctly use their respective fields. Keep this listener-before-action ordering when adding an update or pagination action.

`assertProductsMatchResponse()` checks HTTP 200, JSON content type, loan amount, zero API error, a nonempty product array, visible card count and product-code order. It compares each displayed monthly payment and initial rate with its API product. The current source additionally compares fees, pending a fresh browser run. Monthly-payment/rate selectors correctly start from the current card's direct `.product-data` child, which excludes repeated details/popout values. Sorting then checks nondecreasing `trueCostFullTerm` across the returned page; matching UI card codes to the response order makes that an assertion about displayed order as well.

The saved initial-search response has this observed structure:

```text
body
  formModel
    pageNumber: 1
    totalPages: 4
  resultsViewModel
    id
    results: 10 products in the first returned page
    errorType: 0
    error: ""
  loanAmount: 280000
```

These are selected observed fields, not a complete schema for `formModel` or each product. One captured response is stored inside the trace as `resources/b0357b29ed6575b473fd1532abb52221559edd2a.json`. Product `I60` has numeric `feesTotal: 1014`. Products expose fields such as `initialRatePeriodMonths`, `initialRatePeriod`, `mortgageclass` and `productType`; the saved initial-search objects do not expose a `paymentMethod` property. These observations are from initial search, not a retained filtered-response trace.

**The count requirement has an unresolved contract mismatch.** The assignment describes API `totalCount`, but that property was absent from the captured response and saved JSON resources. The saved UI snapshot shows navigation named `Quick quote result pages` with buttons `1`, `2`, `3`, `4` and `>`; no overall count label was identified in that snapshot. Existing assertions compare the ten visible cards with the ten products in the current response, which does not satisfy an overall count comparison. Inspect the relevant current UI/network contract before choosing a field or inventing an assertion. If another endpoint supplies the required count, capture that deliberately. If the available application differs from the brief, document the discrepancy and the limits of any alternative. `totalPages * pageSize` cannot establish the exact total because the last page can be partial.

The outstanding work should be approached in this order.

1. **Repair and verify updating search criteria.** The current `updatedPurchaseForm` getter at line 22 uses `form.js-product-results-update update-results__purchase`. Its space starts a descendant search and the second token lacks the `.` needed for a class selector, so it matches no intended update form. The saved DOM verifies a stable form selector:

   ```ts
   this.page.locator('form.js-product-results-update')
   ```

   Use that form as the root for its fields. The update income label is `Income`, whereas the initial form's label is `Income of all applicants`; correct the update getter at line 30 accordingly. The update test at `tests/search.spec.ts:31` currently reuses `assertGetResults()`, which always clicks the initial purchase form's `Get results` button. Add an update-specific submission/assertion path using the update form's `Update results` button, the existing response helper and the existing product comparison helper. Rename the step `Update the search results with no mortgage data` to reflect that it supplies the HighValueAndDeposit dataset. Accept this work when the updated request matches that dataset, its loan amount is £850,000 and the displayed products match the updated response.

2. **Scope the new product-fee locator before claiming current tests pass.** At page-object line 219, `card.locator('.js-product-result-productFee')` searches the full card subtree. The saved DOM contains six fee spans per card across summary/details/responsive variants. Its direct `.product-data` child contains exactly one matching span. Use the same summary scope as the monthly-payment/rate assertions:

   ```ts
   const productFees = card
       .locator(':scope > .product-data')
       .locator('.js-product-result-productFee');
   ```

   The observed summary span contains `1,014`; the `£` symbol is outside it. Removing commas before numeric conversion matches this observed formatting. `feesTotal: number` is already declared in `MortgageProduct`, and the explicit compiler check passed. The locator concern is supported by the saved DOM; an actual current-run fee failure has not been recorded. Accept after current browser tests execute these fee assertions successfully.

3. **Resolve overall count and pagination coverage.** Discover the count contract described above, then compare the displayed count with the appropriate API value. Exercise page navigation, match the requested/returned page number, and compare each page's UI products with its response. Add page-number matching to the response helper if necessary so an unrelated response cannot satisfy a pagination wait. Check behavior on the last page and describe which ordering/count guarantees cover all pages versus only one page. If a documented alternative derives a total by traversing pages, label it as that alternative rather than an API `totalCount` assertion. Accept when the count strategy is justified by the observed contract and pagination is actually covered.

4. **Strengthen filter meaning checks.** The current test proves that both selected filter values are sent and that the UI renders the returned API products. It does not independently prove that each returned product satisfies the intended filters. Capture filtered response evidence and establish the product-level mapping before adding assertions. Do not assume `apiProduct.paymentMethod` exists or blindly equate the request's fixed-term value with a product field. The initial-search data includes rate periods from 24 to 27 months; the application's interpretation needs verification. Accept when both controls remain selected and returned products meet their documented filter semantics.

5. **Make the standard type-check command usable.** Add a suitable `tsconfig.json` consistent with this TypeScript/Node setup, the existing `.ts` test imports and installed Node types, or supply explicit source/options in the script. The current manual check passed; the configured `npm run typecheck` command still fails. Accept when that normal project command checks the source and exits successfully.

6. **Write the submission README and refresh evidence.** Describe why Playwright/TypeScript was chosen, the Page Object Model and fixture, synthetic data, locator strategy, response synchronization, pagination/count interpretation, assertions, setup and browser requirements. Explain the reporting artifacts, how to distinguish deterministic defects from flaky behavior, and how traces/repeated runs would be used to investigate intermittent failures. Document retries `0` as the current policy; do not increase retries/timeouts to conceal an incorrect locator or response predicate. Record limitations and trade-offs, including request-contract coupling, one browser project and any unresolved application/brief differences. Prepare the requested repository or ZIP without generated dependencies/artifacts unless intentionally needed. Review local configuration before packaging; this handoff has not inspected `.env` contents.

The normal commands available to the next person are:

```powershell
Set-Location C:\Repos\MABAssignment2

# Install the locked dependencies on a fresh checkout.
npm ci

# All three scenarios, or a browser-visible run.
npm test
npm run test:headed -- tests/search.spec.ts

# Run only one scenario when investigating a change.
npx playwright test tests/search.spec.ts --project=chrome --grep "A user can search for available mortgages"
npx playwright test tests/search.spec.ts --project=chrome --grep "A user can sort their returned available mortgages"
npx playwright test tests/search.spec.ts --project=chrome --grep "A user can filter their returned available mortgages"

# Interactive debugging and existing evidence.
npm run test:debug -- tests/search.spec.ts
npm run report
npx playwright show-trace "test-results/search-Returning-available-251f0-rch-for-available-mortgages-chrome/trace.zip"

# This currently fails until the configuration gap is addressed.
npm run typecheck
```

These commands are supplied for continuation; dependency installation, browser runs, debug sessions and viewers were not launched during this handoff. A fresh environment must provide Chrome because the configuration explicitly selects its channel. The installed dependencies already exist in this workspace.

Several previous issues are resolved in the current source and should not be diagnosed again from old screenshots: invalid `input` roles; `page.goTo` instead of `page.goto`; calling `expect`/`dismissConsent` on Playwright `Page`; numeric arguments passed to string-only form methods; initial term/income label swaps; page-wide duplicate-label matches; an unawaited response promise; a duplicate search click; the misspelled `content-type;` header key; the page-root monthly-payment selector; copied `sortBy` comparisons for other filters; and the missing `feesTotal` type property. Always read the newest error and its saved source alongside current files, because an old report can describe code that has since changed.

Implementation is ready for submission when the update scenario and current fee assertions pass, sorting/filter results have the required logical validation, overall count/pagination coverage is justified against the actual application, the normal type-check command works, and the required README accompanies the source. Any claim about passing tests should identify the source snapshot and saved run used as evidence.
