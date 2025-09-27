import { type Browser, type Page, type Locator } from 'playwright';
import { chromium } from 'playwright-extra';
import stealth from 'puppeteer-extra-plugin-stealth';
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
        chromium.use(stealth())
        this.browser = await chromium.launch({ headless: this.headless });
        const context = await this.browser.newContext({
            viewport: { width: 1920, height: 1080 },
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36'
        });
        this.page = await context.newPage();
        if (!this.page) throw new Error('Failed to create new page');
    }

    async login(showUrl = 'https://poshmark.com/shows/') {
        const page = this.page;
        if (!page) return;

        await page.goto('https://poshmark.com/login');
        const usernameInput = page.locator('#login_form_username_email');
        await this.typing(usernameInput, this.posher.name);
        const passwordInput = page.locator('#login_form_password');
        await this.typing(passwordInput, this.posher.password);
        await page.getByRole('button', { name: /Login/i }).click();

        try {
            // Wait for the OTP modal to appear
            await page.waitForSelector('[name="otp"]', { timeout: 10000 });

            // Call the simple OTP function with the built-in delay
            await this.fillOTP();

            // After submitting, wait for either success or a known error
            console.log('OTP submitted. Waiting for page to redirect...');
            await Promise.race([
                page.waitForURL('**/feed**', { timeout: 15000 }),
                page.locator('text="Whoops! Please check your verification code"').waitFor({ timeout: 15000 })
            ]);

            // If the URL didn't change to the feed, it means the error appeared
            if (!page.url().includes('/feed')) {
                throw new Error('Detected an error message after OTP submission.');
            }

        } catch (error) {
            console.error("Login process failed.", error);
            await this.screenshot('debug-login-failure');
            await this.close();
            throw error;
        }

        console.log('✅ Successfully logged in and redirected to feed.');
        await page.goto(showUrl);
        await page.waitForURL(showUrl);
        if (page.url() == showUrl) this.navigateAway(showUrl);
    }

    async fillOTP() {
        const page = this.page;
        if (!page) return;

        console.log('Waiting for 5 seconds for new OTP to arrive...');
        await page.waitForTimeout(5000); // 5-second delay

        const otpResponse = await fetch(`https://n8n.biztosite.com/webhook/8b2bbec9-4e17-413f-809b-e2308ff3b092?name=${this.posher.name.toLowerCase()}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
        });

        if (!otpResponse.ok) throw new Error('Failed to fetch OTP');
        const otpJson = await otpResponse.json();
        const otpCode: string = otpJson.code;

        await page.locator('[name="otp"]').fill(otpCode);
        await page.getByRole('button', { name: 'Done' }).click();
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

    async screenshot(filename?: string) {
        const path = filename ? `${filename}.png` : `${this.posher.name}.png`;
        console.log('📸 Taking screenshot:', path);
        if (this.page && !this.page.isClosed()) {
            await this.page.waitForSelector('body');
            await this.page.screenshot({ path, fullPage: true });
        }
    }

    async typing(locator: Locator, text: string) {
        for (const char of text) {
            await locator.press(char, { delay: 50 + Math.random() * 100 });
        }
    }
}