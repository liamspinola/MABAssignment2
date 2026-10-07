import { Page } from "@playwright/test";

export class BasePage {
    protected page: Page;

    constructor (page: Page) {
        this.page = page;
    }

    private get consentButton() {
        return this.page.getByRole('button', { name: 'Reject All', exact: true });
    }

    private get filterHidden() {
        return this.page.locator('.onetrust-pc-dark-filter');
    }

    async dismissConsent() {
        await this.consentButton.click();
        await this.filterHidden.waitFor ({ state: 'hidden' });
    }
}