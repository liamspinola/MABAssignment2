# Mortgage calculator tests

Playwright and TypeScript tests for the [Mortgage Advice Bureau calculator](https://www.mortgageadvicebureau.com/find-a-mortgage/), written for the Senior QA Automation assignment.

## Run the tests

You need Node.js 20+, npm, Google Chrome and an internet connection.

```powershell
npm ci
npm run typecheck
npm test
```

- `npm run test:headed` — watch the browser.
- `npm run test:debug` — step through a test.
- `npm run report` — open the results.
- `npm test -- --grep @self-healing` — run the four optional maintainability cases.
- `npm test -- --grep @ai-repair` — run the scenario repaired through the recorded AI review.

## What is tested

| Test | Checks |
|---|---|
| Search and update | Search, change the mortgage details and check the new results |
| Sorting | Total Cost goes from lowest to highest on the returned page |
| Filters | Apply `2 years` and `Interest Only`; wait for each update and check both final dropdowns, server settings and returned results |
| Page navigation | Use Next, Previous and numbered buttons; check page 2 changes the products and returning to page 1 restores the original order |
| Optional maintainability | Verify a reviewed locator repair, recover a renamed search button and reject missing or ambiguous replacements |

The mortgage scenarios wait for the response matching each action. They check the loan amount and compare the screen with the server's data: product count, product codes/order, payments, rates and fees. Money is compared as a number, so extra trailing zeros do not cause a failure. The two recovery safety checks use local HTML and make no server calls.

## How the code is organised

Playwright was chosen for browser and API checks, test isolation and built-in failure reports.

The Page Object Model separates scenarios in `tests/` from shared actions and checks in `pages/`. `fixtures/` provides an isolated page for each test. Methods take named criteria and filter objects, so new scenarios reuse the same actions and data without long lists of numbers.

Made-up mortgage details are stored in `test-assets/mortgageTestData.ts`.

| Search | Property | Deposit | Income | Term |
|---|---:|---:|---:|---:|
| Starting details | £350,000 | £70,000 | £80,000 | 25 years |
| Updated details | £1,000,000 | £150,000 | £160,000 | 35 years |

## Known gaps

- **Overall count:** no overall count on screen or `totalCount` field in the server response was found. The tests check each page's product count. The assignment's exact overall-count check is not implemented.
- **Filter rules:** verified checks cover selected values, final request/response settings and displayed products matching the response. The test does not assume that “2 years” means exactly 24 months or that a search setting proves product eligibility. Stronger checks need documented term categories, repayment eligibility and rules for payment and fee calculations.
- **Filtered pages:** a separate browser check found that clicking Next after selecting Interest Only leaves the payment method out of the request. The server returns Repayment while the dropdown still shows Interest Only. The tests do not cover this issue.
- **Other limits:** only Chrome is tested. Sorting covers one returned page; navigation does not visit every page. The tests assume available products and more than one page for navigation. Invalid inputs, empty results and every mortgage calculation are not covered.

## Reports and failures

Run `npm test` to generate the HTML report in `playwright-report/`, then `npm run report` to open it. Failed tests save screenshots and traces in `test-results/`.

Investigate failures using the trace, selectors and matching server response. Repeat intermittent failures to check for flakiness before changing time limits. AI can assist trace analysis; suggestions must match the evidence.

The [recorded AI-assisted repair](docs/ai-repair/REPORT.md) includes a real failed run, trace analysis, a reviewed POM fix and the same assertions passing afterwards. The [optional cases](OPTIONAL_SELF_HEALING.md) also demonstrate one approved runtime fallback and keep traces on success. AI analysis happens during development; tests do not call an AI model. The four main mortgage tests keep their strict locators.

Tests use one worker and zero retries, with response and page-state waits. Most tests have 45 seconds; navigation has 90 because it makes five server requests.

## Last full run

**7 October 2026:** code checks passed and **all seven Chrome tests passed in 2.6 minutes**, including the optional demo, with no automatic reruns. The known gaps above remain.

## Q & A

**Any decisions or trade-offs you made**
- I had to decide if I wanted to use BDD or not, since this a simple test framework I deemed it would be a bit much and prefered simplicity
- Wanted to add better report software and if I had the time possible could have included something such as Allure or Monocart
- Didnt seem necessary to add any tagging
- Couldn't find the pagecount in the UI or the API that the assignment was asking for, which I wrote about in the known gaps
