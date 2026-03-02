import { test, expect, Page, Browser, BrowserContext } from '@playwright/test';
import { appBaseUrl, getAuthorizationToken } from '../../login.spec';
import { videoTest } from '../utils/overrides';

const models = ['Products', 'Batches'];

// Optional: video test always call auth method when skiptAuth is false, so we can test the auth flow in a dedicated test
test.describe('Authentication Test', () => {
  videoTest.use({ skipAuth: true });
  videoTest('Must generate token', async ({ page }) => {
    const token = await getAuthorizationToken(page, {
      username: 'test-user',
      password: 'test-123',
    });

    expect(token).toBeDefined();
    expect(token).not.toContain('Bearer ');

    await page.goto(`${appBaseUrl}/dashboard`);
  });
});

for (let modelName of models) {
  test.describe(`Testing ${modelName}`, () => {
    videoTest(`${modelName} - Navigate to page`, async ({ page }) => {
      await page.goto(`${appBaseUrl}/${modelName.toLowerCase()}`, {
        waitUntil: 'load',
      });
      expect(page).toHaveURL(new RegExp(modelName.toLowerCase()));

      await page.waitForTimeout(1000);
    });
  });
}
