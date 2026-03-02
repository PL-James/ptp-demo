import { LoggingConfig } from '@decaf-ts/logging';

export type EWConfig = LoggingConfig & {
  app: string;
  ptp: {
    host: string;
    protocol: string;
  };
  keycloak: {
    host: string;
    realm: string;
    clientId: string;
  };
};
