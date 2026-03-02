import { TaskStatus } from '@decaf-ts/core';

export interface ITaskEventItem {
  className: string;
  msg: string;
  classification: string;
  status: TaskStatus;
  currentStep?: number;
  totalSteps?: number;
}
export interface IAppMenuItem {
  label?: string;
  title?: string;
  url?: string;
  icon?: string;
  color?: string;
  activeWhen?: string[];
  roles?: string[];
}

export interface ITabItem {
  title?: string;
  description?: string;
  url?: string;
  value?: string;
  icon?: string;
}

interface IKeycloakResourceAccess {
  roles: string[];
}

export interface IKeycloakIdToken {
  exp: number;
  iat: number;
  auth_time: number;
  jti: string;
  iss: string;
  aud: string;
  sub: string;
  typ: string;
  azp: string;
  sid: string;
  at_hash: string;
  acr: string;
  resource_access: {
    account?: IKeycloakResourceAccess;
    'pharmaledgerassoc-oauth'?: IKeycloakResourceAccess;
    [resource: string]: IKeycloakResourceAccess | undefined;
  };
  email_verified: boolean;
  name: string;
  preferred_username: string;
  given_name: string;
  family_name: string;
  email: string;
}
