import { BasePage } from "./base/BasePage";
import { expect, Locator, Response, test } from '@playwright/test';

type MortgageSearchCriteria = {
    propertyValue: number;
    deposit: number;
    mortgageTerm: number;
    income: number;
};

type MortgageFilters = {
    fixedTerm: { label: string; value: number };
    paymentMethod: { label: string; value: number };
};

type PaginationBaseline = {
    readonly totalPages: number;
    readonly firstPageProductCodes: readonly string[];
};

type MortgageProduct = {
    productCode: string;
    initialMonthlyPayment: number;
    initialPayRate: number;
    trueCostFullTerm: number;
    feesTotal: number;
};

type ExpectedResultCriteria = {
    sortBy?: number;
    fixedTerm?: number;
    paymentMethod?: number;
    pageNumber?: number;
};

export class MortgageCalculatorPage extends BasePage {

    private get purchaseForm() { return this.page.locator('form.quick-quote-calculator__purchase'); }
    private get getResultsButton() { return this.purchaseForm.getByRole('button', { name: 'Get results', exact: true }); }
    private get reviewedGetResultsButton() { return this.purchaseForm.getByRole('button', { name: 'Find mortgage results', exact: true }); }
    private get getResultsFallbackButton() { return this.purchaseForm.locator('button[type="submit"].js-submit-form-button'); }
    private get updatedPurchaseForm() { return this.page.locator('form.js-product-results-update'); }
    private get resultsFilterForm() { return this.page.locator('form.js-product-results-filter'); }
    private get propertyValue() { return this.purchaseForm.getByLabel('Property Value', { exact: true }); }
    private get depositValue() { return this.purchaseForm.getByLabel('Deposit', { exact: true }); }
    private get mortgageTermValue() { return this.purchaseForm.getByLabel('Mortgage Term', { exact: true }); }
    private get applicantsIncomeValue() { return this.purchaseForm.getByLabel('Income of all applicants', { exact: true }); }
    private get updatePropertyValue() { return this.updatedPurchaseForm.getByLabel('Property Value', { exact: true }); }
    private get updateDepositValue() { return this.updatedPurchaseForm.getByLabel('Deposit', { exact: true }); }
    private get updateMortgageTermValue() { return this.updatedPurchaseForm.getByLabel('Mortgage Term', { exact: true }); }
    private get updateApplicantsIncomeValue() { return this.updatedPurchaseForm.getByLabel('Income', { exact: true }); }
    private get productCards() { return this.page.locator('.js-quick-quote-results').locator('.js-product-wrapper[data-product-code]:visible'); }
    private get sortByDropdown() { return this.page.getByRole('combobox', { name: 'Sort by' }); }
    private get fixedTermDropdown() { return this.page.getByRole('combobox', { name: 'Fixed term' }); }
    private get paymentMethodDropdown() { return this.page.getByRole('combobox', { name: 'Payment method' }); }
    private get resultsPagination() { return this.page.getByRole('navigation', { name: 'Quick quote result pages', exact: true }); }
    private get previousResultsPage() { return this.resultsPagination.getByTitle('Previous results page', { exact: true }); }
    private get nextResultsPage() { return this.resultsPagination.getByTitle('Next results page', { exact: true }); }

    async goTo() {
        await this.page.goto('/find-a-mortgage');
        await this.dismissConsent();
    }

    async assertFormIsVisible() {
        await expect(this.purchaseForm).toBeVisible();
    }

    async assertUpdateFormIsVisible() {
        await expect(this.updatedPurchaseForm).toBeVisible();
    }

    async fillMortgageCalculatorForm(criteria: MortgageSearchCriteria) {
        await this.propertyValue.fill(String(criteria.propertyValue));
        await this.depositValue.fill(String(criteria.deposit));
        await this.mortgageTermValue.fill(String(criteria.mortgageTerm));
        await this.applicantsIncomeValue.fill(String(criteria.income));
    }

    async updateMortgageCalculatorForm(criteria: MortgageSearchCriteria) {
        await this.updatePropertyValue.fill(String(criteria.propertyValue));
        await this.updateDepositValue.fill(String(criteria.deposit));
        await this.updateMortgageTermValue.fill(String(criteria.mortgageTerm));
        await this.updateApplicantsIncomeValue.fill(String(criteria.income));
    }

    private async waitForResultsResponse(criteria: MortgageSearchCriteria, action: () => Promise<unknown>, expectedCriteria: ExpectedResultCriteria = {}) {
        const resultsPath = '/umbraco/surface/quickquoteresults/getresults';

        const responsePromise = this.page.waitForResponse(response => {
            const request = response.request();

            if (
                new URL(response.url()).pathname !== resultsPath ||
                request.method() !== 'POST'
            ) {
                return false;
            }

            const requestCriteria = request.postDataJSON();

            return (
                requestCriteria?.propertyValue === criteria.propertyValue &&
                requestCriteria?.deposit === criteria.deposit &&
                requestCriteria?.income === criteria.income &&
                requestCriteria?.mortgageTerm === criteria.mortgageTerm &&
                requestCriteria?.mortgagePurpose === 0 &&
                requestCriteria?.mortgageType === 0 &&
                (
                    expectedCriteria.sortBy === undefined ||
                    requestCriteria?.sortBy === expectedCriteria.sortBy
                ) &&
                (
                    expectedCriteria.fixedTerm === undefined ||
                    requestCriteria?.fixedTerm === expectedCriteria.fixedTerm
                ) &&
                (
                    expectedCriteria.paymentMethod === undefined ||
                    requestCriteria?.paymentMethod === expectedCriteria.paymentMethod
                ) &&
                (
                    expectedCriteria.pageNumber === undefined ||
                    requestCriteria?.pageNumber === expectedCriteria.pageNumber
                )
            );
        });

        const [response] = await Promise.all([
            responsePromise,
            action(),
        ]);

        return response;
    }

    async assertGetResults(criteria: MortgageSearchCriteria) {
        return this.submitAndAssertGetResults(criteria, this.getResultsButton);
    }

    async assertGetResultsAfterReviewedLocatorRepair(criteria: MortgageSearchCriteria) {
        return this.submitAndAssertGetResults(criteria, this.reviewedGetResultsButton);
    }

    private async submitAndAssertGetResults(criteria: MortgageSearchCriteria, button: Locator) {
        const response = await this.waitForResultsResponse(
            criteria,
            () => button.click(),
        );

        await this.assertProductsMatchResponse(response, criteria);

        return response;
    }

    async assertGetResultsWithLocatorRecovery(criteria: MortgageSearchCriteria) {
        await expect(this.purchaseForm).toBeVisible();

        const preferredCount = await this.getResultsButton.count();

        if (preferredCount !== 0) {
            throw new Error(
                `Locator recovery requires the original Get results locator to be missing; found ${preferredCount} matches`,
            );
        }

        const fallback = this.getResultsFallbackButton;
        const fallbackCount = await fallback.count();

        if (fallbackCount !== 1) {
            throw new Error(
                `Get results recovery requires exactly one approved submit button; found ${fallbackCount} matches`,
            );
        }

        await expect(fallback).toBeVisible();
        await expect(fallback).toBeEnabled();
        await expect(fallback).not.toHaveClass(/\b(disabled|loading)\b/);

        const evidence = {
            action: 'Submit the initial mortgage search',
            preferredLocator: 'purchaseForm.getByRole(button, name: Get results, exact: true)',
            preferredMatches: preferredCount,
            recoveredLocator: 'purchaseForm.locator(button[type="submit"].js-submit-form-button)',
            recoveredMatches: fallbackCount,
            recoveredAccessibleLabel: await fallback.getAttribute('aria-label'),
        };

        test.info().annotations.push({
            type: 'locator-recovery',
            description: 'Get results label changed; using the single approved submit button inside the purchase form',
        });
        await test.info().attach('get-results-locator-recovery', {
            body: JSON.stringify(evidence, null, 2),
            contentType: 'application/json',
        });

        return this.submitAndAssertGetResults(criteria, fallback);
    }

    async getAndAssertPaginatedResults(criteria: MortgageSearchCriteria): Promise<PaginationBaseline> {
        const response = await this.assertGetResults(criteria);

        const { totalPages } = await this.assertResultsPagination(response, 1);

        expect(totalPages, 'Pagination requires more than one results page')
            .toBeGreaterThan(1);

        const body = await response.json();
        const products = body.resultsViewModel.results as MortgageProduct[];

        return {
            totalPages,
            firstPageProductCodes: products.map(product => String(product.productCode)),
        };
    }

    async assertPaginationNavigation(criteria: MortgageSearchCriteria, baseline: PaginationBaseline) {
        const navigationSteps = [
            { label: 'Use Next to reach page 2', pageNumber: 2, navigation: 'next' },
            { label: 'Use Previous to return to page 1', pageNumber: 1, navigation: 'previous' },
            { label: 'Use the numbered button to reach the last page', pageNumber: baseline.totalPages, navigation: 'numbered' },
            { label: 'Use the numbered button to return to page 1', pageNumber: 1, navigation: 'numbered' },
        ] as const;

        for (const step of navigationSteps) {
            await test.step(step.label, async () => {
                const pagination = await this.navigateAndAssertResultsPage(
                    step.pageNumber,
                    criteria,
                    step.navigation,
                );

                expect(pagination.totalPages, 'The number of pages should stay the same during navigation')
                    .toBe(baseline.totalPages);

                if (step.pageNumber === 1) {
                    expect(pagination.productCodes, 'Returning to page 1 should restore its original products and order')
                        .toEqual(baseline.firstPageProductCodes);
                } else if (step.pageNumber === 2) {
                    expect(
                        [...pagination.productCodes].sort(),
                        'Page 2 should contain a different group of products from page 1',
                    ).not.toEqual([...baseline.firstPageProductCodes].sort());
                }
            });
        }
    }

    private async assertResultsPagination(response: Response, expectedPageNumber: number): Promise<{ pageNumber: number; totalPages: number }> {
        const body = await response.json();

        expect(body).toHaveProperty('formModel');

        const { pageNumber, totalPages } = body.formModel;

        expect(pageNumber).toBe(expectedPageNumber);
        expect(Number.isInteger(totalPages)).toBe(true);
        expect(totalPages).toBeGreaterThan(0);
        expect(expectedPageNumber).toBeGreaterThan(0);
        expect(expectedPageNumber).toBeLessThanOrEqual(totalPages);

        await expect(this.resultsPagination.locator('.js-pagination-item'))
            .toHaveCount(totalPages > 1 ? totalPages : 0);

        if (totalPages > 1) {
            await expect(this.resultsPagination).toBeVisible();
            await expect(this.resultsPagination.locator('.current-page'))
                .toHaveText(String(expectedPageNumber));
        }

        if (expectedPageNumber === 1) {
            await expect(this.previousResultsPage).toBeHidden();
        } else {
            await expect(this.previousResultsPage).toBeVisible();
        }

        if (expectedPageNumber === totalPages) {
            await expect(this.nextResultsPage).toBeHidden();
        } else {
            await expect(this.nextResultsPage).toBeVisible();
        }

        return { pageNumber, totalPages };
    }

    private async navigateAndAssertResultsPage(pageNumber: number, criteria: MortgageSearchCriteria, navigation: 'next' | 'previous' | 'numbered' = 'numbered') {
        const pageControl = navigation === 'next'
            ? this.nextResultsPage
            : navigation === 'previous'
                ? this.previousResultsPage
                : this.resultsPagination.getByRole('button', {
                    name: String(pageNumber),
                    exact: true,
                });

        const response = await this.waitForResultsResponse(
            criteria,
            () => pageControl.click(),
            { pageNumber },
        );

        const products = await this.assertProductsMatchResponse(response, criteria);
        const pagination = await this.assertResultsPagination(response, pageNumber);

        return {
            ...pagination,
            productCodes: products.map(product => String(product.productCode)),
        };
    }

    async assertUpdatedResults(criteria: MortgageSearchCriteria) {
        const response = await this.waitForResultsResponse(
            criteria,
            () => this.updatedPurchaseForm
                .getByRole('button', {
                    name: 'Update results',
                    exact: true,
                })
                .click(),
        );

        await this.assertProductsMatchResponse(response, criteria);
    }

    private async assertResultsResponse(response: Response, criteria: MortgageSearchCriteria) {
        expect(response.status()).toBe(200);

        expect(response.headers()['content-type'])
            .toContain('application/json');

        const body = await response.json();

        const expectedLoanAmount = criteria.propertyValue - criteria.deposit;

        expect(body.loanAmount).toBe(expectedLoanAmount);

        expect(body).toHaveProperty('resultsViewModel');

        const resultsModel = body.resultsViewModel;

        expect(resultsModel).toMatchObject({
            errorType: 0,
            error: '',
        });

        expect(Array.isArray(resultsModel.results)).toBe(true);

        expect(resultsModel.results.length).toBeGreaterThan(0);

        return body;
    }

    private async assertProductsMatchResponse(response: Response, criteria: MortgageSearchCriteria): Promise<MortgageProduct[]> {
        const body = await this.assertResultsResponse(response, criteria);
        const products = body.resultsViewModel.results as MortgageProduct[];

        await expect(this.productCards).toHaveCount(products.length);

        for (let index = 0; index < products.length; index++) {
            const apiProduct = products[index];
            const card = this.productCards.nth(index);

            await expect(card).toHaveAttribute(
                'data-product-code',
                String(apiProduct.productCode),
            );

            expect(typeof apiProduct.initialMonthlyPayment).toBe('number');

            const monthlyPayment = card
                .locator(':scope > .product-data')
                .locator('.js-product-result-initialMonthlyPayment');

            await expect(monthlyPayment).toBeVisible();
            await expect(monthlyPayment).not.toHaveText('');

            await expect.poll(async () => {
                const displayedText = await monthlyPayment.innerText();

                return Number(
                    displayedText.replaceAll(',', '').trim()
                );
            }).toBe(apiProduct.initialMonthlyPayment);

            expect(typeof apiProduct.initialPayRate).toBe('number');

            const initialRate = card
                .locator(':scope > .product-data')
                .locator('.js-product-result-initialRate');

            await expect(initialRate).toBeVisible();
            await expect(initialRate).not.toHaveText('');

            await expect.poll(async () => {
                const displayedText = await initialRate.innerText();

                return Number.parseFloat(
                    displayedText.replace('%', '').trim()
                );
            }).toBe(apiProduct.initialPayRate);

            const productFees = card
                .locator(':scope > .product-data')
                .locator('.js-product-result-productFee');

            expect(typeof apiProduct.feesTotal).toBe('number');

            await expect(productFees).toBeVisible();
            await expect(productFees).not.toHaveText('');

            await expect.poll(async () => {
                const displayedText = await productFees.innerText();
                return Number(displayedText.replaceAll(',', ''));
            }).toBe(apiProduct.feesTotal);
        }

        return products;
    }

    async assertResultsSortedByTotalCost(criteria: MortgageSearchCriteria) {
        const response = await this.waitForResultsResponse(
            criteria,
            () => this.sortByDropdown.selectOption({
                label: 'Total Cost',
            }),
            {
                sortBy: 1,
            }
        );

        const products = await this.assertProductsMatchResponse(response, criteria);

        for (let index = 1; index < products.length; index++) {
            const previousProduct = products[index - 1];
            const currentProduct = products[index];

            expect(typeof currentProduct.trueCostFullTerm).toBe('number');

            expect(
                currentProduct.trueCostFullTerm,
                `Expected ${currentProduct.productCode} with total cost ` +
                `${currentProduct.trueCostFullTerm} to be greater than or equal to ` +
                `${previousProduct.productCode} with total cost ` +
                `${previousProduct.trueCostFullTerm}`,
            ).toBeGreaterThanOrEqual(
                previousProduct.trueCostFullTerm,
            );
        }
    }

    private async waitForFiltersReady() {
        await expect(this.resultsFilterForm).toBeVisible();
        await expect(this.resultsFilterForm, 'The previous filter update should finish before selecting another filter')
            .not.toHaveClass(/\bjs-form-submitting\b/);
    }

    async filterResultsByFixedTermAndPaymentMethod(criteria: MortgageSearchCriteria, filters: MortgageFilters) {
        await this.waitForFiltersReady();

        const fixedTermResponse = await this.waitForResultsResponse(
            criteria,
            () => this.fixedTermDropdown.selectOption({
                label: filters.fixedTerm.label,
            }),
            {
                fixedTerm: filters.fixedTerm.value,
            },
        );

        const fixedTermBody = await this.assertResultsResponse(fixedTermResponse, criteria);
        expect(fixedTermBody.formModel).toMatchObject({ fixedTerm: filters.fixedTerm.value });
        await this.waitForFiltersReady();

        await expect(this.fixedTermDropdown)
            .toHaveValue(String(filters.fixedTerm.value));

        const response = await this.waitForResultsResponse(
            criteria,
            () => this.paymentMethodDropdown.selectOption({
                label: filters.paymentMethod.label,
            }),
            {
                fixedTerm: filters.fixedTerm.value,
                paymentMethod: filters.paymentMethod.value,
            },
        );

        await this.assertProductsMatchResponse(response, criteria);
        await this.waitForFiltersReady();

        await expect(this.fixedTermDropdown)
            .toHaveValue(String(filters.fixedTerm.value));
        await expect(this.paymentMethodDropdown)
            .toHaveValue(String(filters.paymentMethod.value));

        const body = await response.json();

        expect(body.formModel).toMatchObject({
            fixedTerm: filters.fixedTerm.value,
            paymentMethod: filters.paymentMethod.value,
        });
    }
}
