import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { DB_ADAPTER_PROVIDER_TOKEN, DecafRepositoryAdapter, KeyValue } from '@decaf-ts/for-angular';
import { BehaviorSubject, firstValueFrom, Subject } from 'rxjs';
import { shareReplay } from 'rxjs/operators';
import { PTPRoles, SessionKeys } from '../utils/constants';
import { IKeycloakIdToken } from '../utils/interfaces';
import { DecafAxiosHttpAdapter } from '../utils/overrides';
import { KeyCloakService } from './keycloak.service';
import { SessionService } from './session.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService extends KeyCloakService {
  private sessionService = inject(SessionService);

  private axiosAdapter = inject(DB_ADAPTER_PROVIDER_TOKEN) as DecafRepositoryAdapter & DecafAxiosHttpAdapter;

  private router = inject(Router);
  private rolesSubject = new BehaviorSubject<PTPRoles[]>([]);
  roles$ = this.rolesSubject.asObservable().pipe(shareReplay(1));

  private routeSubject = new Subject<string>();
  route$ = this.routeSubject.asObservable().pipe(shareReplay(1));

  private sessionSubject = new Subject<boolean>();
  session$ = this.sessionSubject.asObservable().pipe(shareReplay(1));

  get axios(): DecafAxiosHttpAdapter {
    return this.axiosAdapter;
  }

  async emitRoles(roles: PTPRoles[]) {
    this.rolesSubject.next(roles);
    this.sessionService.set(SessionKeys.roles, roles);
  }

  async emitRoute(route: string) {
    this.routeSubject.next(route);
  }

  async emitSession(logged: boolean = true, roles: PTPRoles[] = []) {
    this.sessionSubject.next(logged);
    if (logged && roles.length) {
      await this.emitRoles(roles);
    }
  }

  async isAdmin(): Promise<boolean> {
    // TODO: get on account info mspId === pla
    return true;
  }

  async getUserRoles(): Promise<PTPRoles[]> {
    const roles = await firstValueFrom(this.roles$);
    if (roles?.length) {
      return roles;
    }
    return ((await this.sessionService.get(SessionKeys.roles)) as PTPRoles[]) || [];
  }

  async getUserAccount(): Promise<KeyValue> {
    return this.getToken(true) as Promise<KeyValue>;
    //TODO: request account info from backend
    // const { data } = await this.axios.client.request({
    //   url: 'account/info',
    //   method: 'GET',
    //   withCredentials: true,
    // });
    // return data;
  }

  async isLoggedIn(redirect: boolean = false): Promise<boolean> {
    // DEMO MODE: always authenticated with all roles
    const demoToken = btoa(JSON.stringify({ alg: 'none' })) + '.' +
      btoa(JSON.stringify({
        sub: 'demo-user-001',
        name: 'James Gannon',
        email: 'james@pharmaledger.org',
        preferred_username: 'james.gannon',
        given_name: 'James',
        family_name: 'Gannon',
        realm_access: { roles: ['admin', 'writer', 'reader'] },
        org: 'PharmaLedger Association',
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 86400,
      })) + '.demo-signature';
    this.emitSession(true, Object.values(PTPRoles));
    await this.storeToken(demoToken);
    if (redirect) {
      await this.router.navigateByUrl('/dashboard');
    }
    return true;
  }

  async storeToken(token: string): Promise<void> {
    if (token.includes('Bearer ')) {
      token = token.split('Bearer ')[1];
    }
    this.axios.token = token;
    await this.sessionService.set(SessionKeys.token, token);
  }

  async getToken(decoded: boolean = false): Promise<string | IKeycloakIdToken> {
    const token = await this.sessionService.get(SessionKeys.token);
    if (!token) {
      return '';
    }
    if (decoded) {
      try {
        const base64Array = (token as string).split('.')[1];
        const base64 = base64Array.replace(/-/g, '+').replace(/_/g, '/');
        const payload = decodeURIComponent(
          window
            .atob(base64)
            .split('')
            .map(function (c) {
              return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            })
            .join('')
        );
        return JSON.parse(payload) as IKeycloakIdToken;
      } catch (error: unknown) {
        this.log.for(this).warn('Invalid token' + (error as Error)?.message || (JSON.stringify(error) as string));
        return '';
      }
    }
    return token as string;
  }

  async logout(redirect: boolean = false): Promise<void> {
    await this.sessionService.delete();
    this.axios.token = undefined;
    this.emitSession(false);
    if (redirect) {
      await this.router.navigateByUrl('/logout');
    }
  }
}
