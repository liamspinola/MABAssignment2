import { test, expect } from '../fixtures/selfHealingFixtures.ts';
import { mortgageTestData } from '../test-assets/mortgageTestData.ts';

// Keep the trace even when recovery succeeds, so the change and click can be reviewed.
test.use({ trace: 'on' });

test.describe('Controlled search locator recovery', { tag: '@self-healing' }, () => {
    const searchCriteria = mortgageTestData.LowValueAndDeposit;

    test('A reviewed locator repair preserves the mortgage result checks', { tag: '@ai-repair' }, async ({ mortgageCalculatorPage, searchButtonDrift }) => {
        await test.step('Prepare the mortgage search using the shared criteria', async () => {
            await mortgageCalculatorPage.goTo();
            await mortgageCalculatorPage.assertFormIsVisible();
            await mortgageCalculatorPage.fillMortgageCalculatorForm(searchCriteria);
        });

        await test.step('Simulate a changed label and prove the original locator no longer matches', async () => {
            await searchButtonDrift.renameGetResultsButton();
        });

        await test.step('Submit using the reviewed POM locator and verify the UI against the API', async () => {
            await mortgageCalculatorPage.assertGetResultsAfterReviewedLocatorRepair(searchCriteria);
        });
    });

    test('A user can search after the Get results button label changes', async ({ mortgageCalculatorPage, searchButtonDrift }) => {
        await test.step('Prepare the mortgage search using the shared criteria', async () => {
            await mortgageCalculatorPage.goTo();
            await mortgageCalculatorPage.assertFormIsVisible();
            await mortgageCalculatorPage.fillMortgageCalculatorForm(searchCriteria);
        });

        await test.step('Simulate a changed label and prove the original locator no longer matches', async () => {
            await searchButtonDrift.renameGetResultsButton();
        });

        await test.step('Recover the submit button and verify the returned UI against the API', async () => {
            await mortgageCalculatorPage.assertGetResultsWithLocatorRecovery(searchCriteria);
        });
    });

    test('Recovery stops when the purchase form has no approved submit button', async ({ mortgageCalculatorPage, searchButtonDrift }) => {
        await test.step('Prepare a local form with the only submit button outside the purchase form', async () => {
            await searchButtonDrift.prepareLocalForm('missing');
        });

        await test.step('Reject the missing control and confirm nothing was submitted', async () => {
            await expect(mortgageCalculatorPage.assertGetResultsWithLocatorRecovery(searchCriteria))
                .rejects.toThrow('Get results recovery requires exactly one approved submit button; found 0 matches');
            await searchButtonDrift.assertNoSubmission();
        });
    });

    test('Recovery stops when the purchase form has two approved submit buttons', async ({ mortgageCalculatorPage, searchButtonDrift }) => {
        await test.step('Prepare a local form with two possible submit buttons', async () => {
            await searchButtonDrift.prepareLocalForm('ambiguous');
        });

        await test.step('Reject the ambiguous controls and confirm nothing was submitted', async () => {
            await expect(mortgageCalculatorPage.assertGetResultsWithLocatorRecovery(searchCriteria))
                .rejects.toThrow('Get results recovery requires exactly one approved submit button; found 2 matches');
            await searchButtonDrift.assertNoSubmission();
        });
    });
});
