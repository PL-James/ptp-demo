import dotenv from 'dotenv';
const envFile = process.env?.['CONTEXT']
  ? `.env.${process.env?.['CONTEXT']}`
  : '.env.docker';
dotenv.config({ path: '../.env' });
dotenv.config({ path: `../${envFile}`, override: true });
dotenv.config({ path: '../.env.secret' });
dotenv.config({ path: '../.env.sso' });

import {
  apiUrl,
  geTestEnvironment,
  testLogger,
} from './playwright/utils/helpers';
import { expect, test, Page } from '@playwright/test';
import { EWConfig } from 'src/environments/types';
import { videoTest } from './playwright/utils/overrides';

export let authToken: string | undefined;

export const appBaseUrl = 'https://ew-frontend.ptp.internal';

type UserCredentials = {
  username: string;
  password: string;
};

export async function apiAuthorization(
  page: Page
): Promise<string | undefined> {
  try {
    if (authToken) {
      return authToken;
    }
    const response = await page.request.get(`${apiUrl}/auth/login`, {
      headers: { Accept: 'application/json' },
    });
    if (response.ok()) {
      const { token } = await response.json();
      return token;
    }
    return undefined;
  } catch (error) {}
  return undefined;
}

export async function keycloakAuthorization(
  page: Page,
  userData: UserCredentials
): Promise<string> {
  await page.goto(`${apiUrl}/auth/login`, {
    waitUntil: 'load',
  });
  const { username, password } = userData;
  await page.waitForSelector('input[name="username"]', { state: 'visible' });
  await page.waitForSelector('input[name="password"]', { state: 'visible' });
  await page.fill('input[name="username"]', username);
  await page.fill('input[name="password"]', password);
  await Promise.all([
    await page.waitForURL('**/*'),
    await page.click('#kc-login'),
  ]);
  await page.waitForLoadState('networkidle');
  const response = await page.request.get(`${apiUrl}/auth/login`, {
    headers: { Accept: 'application/json' },
  });

  expect(response).toBeOK();

  const { token } = await response.json();
  return token;
  // await Promise.all([
  //   await page.waitForURL('**/*'),
  //   await page.click('#social-pla_oidc'),
  // ]);

  // await page.waitForLoadState('networkidle');
  //   await page.waitForSelector('input[name="loginfmt"]', { state: 'visible' });
  // await page.fill('input[name="loginfmt"]', userData.username);
}

export async function getAuthorizationToken(
  page: Page,
  userData: {
    username: string;
    password: string;
  }
): Promise<string | void> {
  await page.goto(`${appBaseUrl}/login`);

  try {
    await geTestEnvironment(page);
    authToken = await apiAuthorization(page);
    if (!authToken) {
      authToken = await keycloakAuthorization(page, userData);
      authToken = authToken.split('Bearer ')[1];
    }
    expect(authToken).toBeDefined();
    expect(typeof authToken).toBe('string');
    expect(authToken).not.toContain('Bearer ');
    return authToken;
  } catch (error) {
    const message = `LOGIN Failed: ${(error as Error)?.message || error}`;
    testLogger.error(message);
    process.exit(1);
  }
}

// test.describe('Authentication Test', () => {
//   videoTest('Must Login', async ({ page }) => {
//     const token = await getAuthorizationToken(page, {
//       username: 'test-user',
//       password: 'test-123',
//     });

//     expect(token).toBeDefined();
//     expect(token).not.toContain('Bearer ');

//     await page.goto(`${appBaseUrl}/dashboard`);

//     expect(page).toHaveURL(/dashboard/);

//     await page.waitForTimeout(1000);
//   });
// });
