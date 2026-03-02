/**
 * @module ew-frontend
 * @description This is the main entry point for the ew-frontend application.
 * @summary It bootstraps the Angular application.
 * @category Application
 */

import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';

bootstrapApplication(AppComponent, appConfig).catch((err) =>
  console.error(err)
);
