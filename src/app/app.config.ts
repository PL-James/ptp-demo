/**
 * @module ew-frontend/app-config
 * @description This module provides the application configuration for the ew-frontend.
 * @summary It configures the application's providers, including the router, database adapter, and internationalization.
 * @category Application
 */

import { isDevMode as angularDevMode, ApplicationConfig, InjectionToken, provideAppInitializer } from '@angular/core';
import {
  PreloadAllModules,
  provideRouter,
  RouteReuseStrategy,
  withComponentInputBinding,
  withPreloading,
} from '@angular/router';
import { provideServiceWorker } from '@angular/service-worker';
import { RamFlavour } from '@decaf-ts/core/ram';
import {
  getLogger,
  I18nResourceConfigType,
  provideDecafDbAdapter,
  provideDecafDynamicComponents,
  provideDecafI18nConfig,
  provideDecafPageTransition,
} from '@decaf-ts/for-angular';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular/standalone';
import { RootTranslateServiceConfig } from '@ngx-translate/core';
import { routes } from './app.routes';

import { Model } from '@decaf-ts/decorator-validation';
import { RamAdapter } from '@decaf-ts/core/ram';
import { AxiosFlavour } from '@decaf-ts/for-http';
import { Audit, Batch, Leaflet, Product, ProductStrength } from '@pharmaledgerassoc/ptp-toolkit/shared';
import { Environment } from 'src/environments/environment';
import pkg from '../../package.json';
import { AppExpiryDateFieldComponent } from './components/expiry-date/expiry-date-field.component';
import { AppModalDiffsComponent } from './components/modal-diffs/modal-diffs.component';
import { AppSelectFieldComponent } from './components/select-field/select-field.component';
import { populateSampleData } from './utils/FakerRepository';
import { DecafAxiosHttpAdapter } from './utils/overrides';

// export const isLocalDevelopmentMode = isDevelopmentMode('local');
// export const DbAdapterFlavour = !isLocalDevelopmentMode ? AxiosFlavour : RamFlavour;

export const isLocalDevelopmentMode = false;
export const DbAdapterFlavour = AxiosFlavour;
export const AppModels = [] as Model[];
export const AppName = pkg.description;
export const APP_MODEL_TOKENS = new InjectionToken<Model[]>('AppLoadedModels', {
  providedIn: 'root',
  factory: () => AppModels,
});
getLogger('').setConfig({ style: false });

export const appConfig: ApplicationConfig = {
  providers: [
    // provide locale components for decaf rendering engine
    // provideKeycloakAngular(),
    // provideZoneChangeDetection({ eventCoalescing: true }),
    provideAppInitializer(async () => {
      const logger = getLogger(provideAppInitializer);
      const isDevMode = isLocalDevelopmentMode && DbAdapterFlavour.includes(RamFlavour);
      if (isDevMode) {
        try {
          AppModels.push(new Product(), new ProductStrength(), new Batch(), new Leaflet(), new Audit());
          logger.debug(`AppConfig: Loaded ${AppModels.length} models. Initializing sample data...`);
          await populateSampleData(AppModels, ['Product', 'Batch', 'Leaflet', 'Audit']);
        } catch (error: unknown) {
          logger.error((error as Error)?.message);
        }
      }
    }),
    provideDecafDynamicComponents(AppModalDiffsComponent, AppSelectFieldComponent, AppExpiryDateFieldComponent),
    provideDecafDbAdapter(
      DecafAxiosHttpAdapter,
      {
        protocol: Environment.ptp.protocol,
        host: Environment.ptp.host,
      },
      'hlf-fabric'
    ),
    provideIonicAngular(),
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideRouter(routes, withPreloading(PreloadAllModules), withComponentInputBinding()),
    // provide dark theme
    // provideDecafDarkMode(),
    provideDecafPageTransition(),
    provideDecafI18nConfig(
      {
        fallbackLang: 'en',
        lang: 'en',
      } as RootTranslateServiceConfig,
      // optionally provide I18nLoader configuration, otherwise it will use default (same as setted below)
      {
        prefix: './assets/i18n/',
        suffix: '.json',
      } as I18nResourceConfigType
    ),
    provideServiceWorker('ngsw-worker.js', {
      enabled: !angularDevMode(),
      registrationStrategy: 'registerWhenStable:30000',
    }),
  ],
};
