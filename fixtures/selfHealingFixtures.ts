import { expect, Page } from '@playwright/test';
import { test as base } from './fixtures.ts';

export { expect } from '@playwright/test';

// Fault injection belongs to the demo fixture, not the application's page object.
class SearchButtonDrift {
    constructor(private readonly page: Page) {}

    private get purchaseForm() { return this.page.locator('form.quick-quote-calculator__purchase'); }

    async renameGetResultsButton() {
        const originalButton = this.purchaseForm.getByRole('button', {
            name: 'Get results',
            exact: true,
        });

        await expect(originalButton).toHaveCount(1);
        await expect(originalButton).toBeVisible();
        await originalButton.evaluate(button => {
            button.setAttribute('aria-label', 'Find mortgage results');
        });

        await expect(originalButton).toHaveCount(0);
        await expect(this.purchaseForm.getByRole('button', {
            name: 'Find mortgage results',
            exact: true,
        })).toHaveCount(1);
    }

    async prepareLocalForm(state: 'missing' | 'ambiguous') {
        const submitButtons = state === 'ambiguous'
            ? '<button type="submit" class="js-submit-form-button">Find mortgage results</button>' +
              '<button type="submit" class="js-submit-form-button">Show mortgage results</button>'
            : '<button type="button">Help</button>';

        await this.page.setContent(
            '<form class="quick-quote-calculator__purchase" data-submission-count="0">' +
                submitButtons +
            '</form>' +
            '<button type="submit" class="js-submit-form-button">Submit another form</button>',
        );

        await this.purchaseForm.evaluate(form => {
            form.addEventListener('submit', event => {
                event.preventDefault();
                const currentCount = Number(form.getAttribute('data-submission-count'));
                form.setAttribute('data-submission-count', String(currentCount + 1));
            });
        });
    }

    async assertNoSubmission() {
        await expect(this.purchaseForm).toHaveAttribute('data-submission-count', '0');
    }
}

type SelfHealingFixtures = {
    searchButtonDrift: SearchButtonDrift;
};

export const test = base.extend<SelfHealingFixtures>({
    searchButtonDrift: async ({ page }, use) => {
        await use(new SearchButtonDrift(page));
    },
});
