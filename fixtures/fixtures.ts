import { test as base } from '@playwright/test';
import { MortgageCalculatorPage } from '../pages/mortgageCalculatorPage';
export { expect } from '@playwright/test';

type Fixtures = {
    mortgageCalculatorPage: MortgageCalculatorPage;
}

export const test = base.extend<Fixtures>({

    mortgageCalculatorPage: async ({ page }, use) => {
        const mortgageCalculatorPage = new MortgageCalculatorPage(page);

        await use(mortgageCalculatorPage);
    },
}
)