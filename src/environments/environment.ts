// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.
import { LoggedEnvironment, LogLevel } from '@decaf-ts/logging';
import { EWConfig } from './types';
const env: EWConfig = (window as Record<string, any>)['ENV'] || {};
const ewConfig: EWConfig = {
  app: env.app || 'AstraLabel Core',
  env: env.env || 'development',

  ptp: {
    host: env.ptp.host || 'localhost:3000',
    protocol: env.ptp.protocol || 'http',
  },
  keycloak: {
    host: env.keycloak.host || '',
    realm: env.keycloak.realm || '',
    clientId: env.keycloak.clientId || '',
  },
  level: LogLevel.debug,
} as EWConfig;

export const Environment = LoggedEnvironment.accumulate(ewConfig);

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
