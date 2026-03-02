import { Repository } from '@decaf-ts/core';
import { Constructor, Metadata } from '@decaf-ts/decoration';
import { Model, Primitives } from '@decaf-ts/decorator-validation';
import { Logger, Logging } from '@decaf-ts/logging';
import { Page } from '@playwright/test';
import { EWConfig } from 'src/environments/types';

export const testLogger = (function (): Logger {
  return Logging.for('PlaywrightTests');
})();

export let testEnvironment: EWConfig;
export let apiUrl: string;

export async function geTestEnvironment(page: Page): Promise<EWConfig> {
  if (testEnvironment) {
    return testEnvironment;
  }
  testEnvironment = await page.evaluate(() => (window as any)?.['ENV']);
  apiUrl = `${testEnvironment.ptp.protocol}://${testEnvironment.ptp.host}`;
  return testEnvironment;
}
