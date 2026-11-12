import { IWorldOptions, World, setWorldConstructor } from '@cucumber/cucumber';
import {
  APIRequestContext,
  Browser,
  BrowserContext,
  Page,
  chromium,
  firefox,
  request,
  webkit,
} from '@playwright/test';
import { Env } from '@config/Env';
import { HomePage } from '@pages/HomePage';
import { ApiClient } from '@api/ApiClient';

const launchers = { chromium, firefox, webkit };

/** Per-scenario state shared by all steps. Browser/API resources are created lazily by hooks. */
export class CustomWorld extends World {
  browser!: Browser;
  context!: BrowserContext;
  page!: Page;
  apiContext!: APIRequestContext;
  api!: ApiClient;
  homePage!: HomePage;

  /** Scratch space for passing values between steps of one scenario. */
  data: Record<string, unknown> = {};

  constructor(options: IWorldOptions) {
    super(options);
  }

  async startBrowser(): Promise<void> {
    const requested = process.env.PW_BROWSER ?? 'chromium';
    const name = (requested in launchers ? requested : 'chromium') as keyof typeof launchers;
    this.browser = await launchers[name].launch({ headless: process.env.HEADLESS !== 'false' });
    this.context = await this.browser.newContext({ baseURL: Env.baseUrl });
    await this.context.tracing.start({ screenshots: true, snapshots: true });
    this.page = await this.context.newPage();
    this.homePage = new HomePage(this.page);
  }

  async startApi(): Promise<void> {
    this.apiContext = await request.newContext({ baseURL: Env.apiBaseUrl });
    this.api = new ApiClient(this.apiContext);
  }
}

setWorldConstructor(CustomWorld);
