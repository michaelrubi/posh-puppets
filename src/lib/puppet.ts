import { chromium, type Browser, type Page } from 'playwright';
import { User } from './';

interface Posher {
    name: string;
    password: string;
}

export class Puppet {
    headless;
    posher: Posher;
    browser: Browser | null = null;
    page: Page | null = null;

    constructor(user: User, headless = true) {
        this.posher = { name: user.getUserName(), password: user.getPassword() };
        this.headless = headless;
    }

    async init() {
        this.browser = await chromium.launch({ headless: this.headless });
        const context = await this.browser.newContext();
        this.page = await context.newPage();
        if (!this.page) throw new Error('Failed to create new page');
    }

    async login(showUrl = 'https://poshmark.com/shows/') {
        const page = this.page;
        if (!page) return;

        await page.goto('https://poshmark.com/login');
        await page.fill('#login_form_username_email', this.posher.name);
        await page.fill('#login_form_password', this.posher.password);
        await page.click('button.btn');
        await page.waitForURL('**/feed**');
        await page.goto(showUrl);
        await page.waitForURL(showUrl);

        if (page.url() == showUrl) this.navigateAway(showUrl);

    }

    navigateAway(showUrl: string) {
        if (!this.page) return

        this.page.on('framenavigated', async (frame) => {
            if (frame.parentFrame()) return;

            const newUrl = frame.url();
            console.log(`Page navigated to: ${newUrl}`);

            if (!newUrl.startsWith(showUrl)) {
                console.log('❌ Navigated away from target URL. Closing browser...');
                await this.close();
            }
        });
    }

    async close() {
        if (this.browser) {
            await this.browser.close();
            this.browser = null;
        }
    }

    async screenshot() {
        if (this.page && !this.page.isClosed()) {
            await this.page.waitForSelector('body');
            await this.page.screenshot({ path: `${this.posher.name}.png`, fullPage: true });
        }
    }
}