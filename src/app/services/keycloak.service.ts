import { Injectable } from '@angular/core';
import { LoggedClass } from '@decaf-ts/logging';
import KeyCloak, { KeycloakInitOptions, KeycloakInstance } from 'keycloak-js';
import { Environment } from 'src/environments/environment';

const loggedInPage = window.location.origin + '/dashboard';
const KeycloakService = new (KeyCloak as any)({
  url: Environment.keycloak.host,
  realm: Environment.keycloak.realm,
  clientId: Environment.keycloak.clientId,
  redirectUri: loggedInPage,
}) as KeycloakInstance;

@Injectable({
  providedIn: 'root',
})
export class KeyCloakService extends LoggedClass {
  keyCloack: KeycloakInstance = KeycloakService;

  async initialize(): Promise<string> {
    if (!Environment.keycloak.host) {
      return '';
    }
    try {
      (await this.keyCloack.init({
        onLoad: 'check-sso',
        silentCheckSsoRedirectUri: window.location.origin + '/assets/silent-sso.html',
        // checkLoginIframe: false,
        // redirectUri: window.location.origin + '/authenticated',
      } as KeycloakInitOptions)) as unknown as Promise<boolean>;
      return this.keyCloack.createLoginUrl({
        redirectUri: loggedInPage,
      }) as unknown as Promise<string>;
    } catch (error: unknown) {
      this.log.for(this.initialize).error(`Keycloak init failed. ${(error as Error).message || error}`);
      return `${Environment.ptp.protocol}://${Environment.ptp.host}/auth/login`;
    }
  }

  async openSsoLogin(): Promise<void> {
    const keyCloackUrl = await this.initialize();
    if (keyCloackUrl) {
      const ssoWindow = window.open(await keyCloackUrl);
      if (!ssoWindow) {
        alert('O navegador bloqueou o pop-up.');
      } else {
        ssoWindow.focus();
        const monitor = setInterval(() => {
          if (ssoWindow.closed) {
            clearInterval(monitor);
            window.location.reload();
          }
          // if (ssoWindow.document.hasFocus() && !focus) {
          //   clearInterval(monitor); // Stop monitoring when the new window gains focus
          //   focus = true;
          // }
        }, 500);
      }
    }
  }
}
