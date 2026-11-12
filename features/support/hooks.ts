import { After, Before, Status, setDefaultTimeout } from '@cucumber/cucumber';
import { CustomWorld } from './world';

setDefaultTimeout(30_000);

// Scenarios tagged @api get an API client only; everything else gets a browser.
Before(async function (this: CustomWorld, { pickle }) {
  if (pickle.tags.some((t) => t.name === '@api')) {
    await this.startApi();
  } else {
    await this.startBrowser();
  }
});

After(async function (this: CustomWorld, { result, pickle }) {
  const failed = result?.status === Status.FAILED;
  const safeName = pickle.name.replace(/[^a-z0-9]+/gi, '_');

  if (this.page) {
    if (failed) {
      this.attach(await this.page.screenshot({ fullPage: true }), 'image/png');
      await this.context.tracing.stop({ path: `reports/traces/${safeName}.zip` });
    } else {
      await this.context.tracing.stop();
    }
    await this.context.close();
    await this.browser.close();
  }
  await this.apiContext?.dispose();
});
