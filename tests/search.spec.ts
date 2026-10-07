import { test } from '../fixtures/fixtures.ts';
import { mortgageTestData } from '../test-assets/mortgageTestData.ts';

test.describe('Returning available mortgage functionality', () => {
    const lowValueData = mortgageTestData.LowValueAndDeposit;
    const highValueData = mortgageTestData.HighValueAndDeposit;

    test.beforeEach(async ({ mortgageCalculatorPage }) => {
        await mortgageCalculatorPage.goTo();
        await mortgageCalculatorPage.assertFormIsVisible();
        await mortgageCalculatorPage.fillMortgageCalculatorForm(lowValueData);
    });

    test('A user can search for available mortgages', async ({ mortgageCalculatorPage }) => {
        await test.step('Assert returned results are correct', async () => {
            await mortgageCalculatorPage.assertGetResults(lowValueData);
        });

        await test.step('Change the property value, deposit, income and mortgage term', async () => {
            await mortgageCalculatorPage.updateMortgageCalculatorForm(highValueData);
        });

        await test.step('Assert that the updated results have returned successfully', async () => {
            await mortgageCalculatorPage.assertUpdatedResults(highValueData);
        });
    });

    test('A user can navigate between mortgage result pages', async ({ mortgageCalculatorPage }) => {
        test.setTimeout(90_000);

        const paginationBaseline = await test.step('Return available mortgage results and verify the first page', async () => {
            return mortgageCalculatorPage.getAndAssertPaginatedResults(lowValueData);
        });

        await test.step('Navigate using Next, Previous and the numbered page controls', async () => {
            await mortgageCalculatorPage.assertPaginationNavigation(
                lowValueData,
                paginationBaseline,
            );
        });
    });

    test('A user can sort their returned available mortgages', async ({ mortgageCalculatorPage }) => {
        await test.step('Return available mortgage results', async () => {
            await mortgageCalculatorPage.assertGetResults(lowValueData);
        });

        await test.step('Sort results by Total Cost and assert the results are ordered correctly', async () => {
            await mortgageCalculatorPage.assertResultsSortedByTotalCost(lowValueData);
        });
    });

    test('A user can filter their returned available mortgages', async ({ mortgageCalculatorPage }) => {
        await test.step('Return available mortgage results', async () => {
            await mortgageCalculatorPage.assertGetResults(lowValueData);
        });

        await test.step('Filter results by fixed term and payment method', async () => {
            await mortgageCalculatorPage.filterResultsByFixedTermAndPaymentMethod(
                lowValueData,
                mortgageTestData.filters,
            );
        });
    });
});
