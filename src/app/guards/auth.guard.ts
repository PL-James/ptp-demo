import { inject, Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, RouterStateSnapshot } from '@angular/router';
import { getOnWindow, NgxRouterService } from '@decaf-ts/for-angular';
import { LoggedClass } from '@decaf-ts/logging';
import { TranslateService } from '@ngx-translate/core';
import { firstValueFrom } from 'rxjs';
import { RouteLike } from '../app.routes';
import { AuthService } from '../services/auth.service';
import { getNgxToastComponent, PTPRoles, SessionKeys } from '../utils';

@Injectable({
  providedIn: 'root',
})
export class GuardClass extends LoggedClass {
  // private keycloak = inject(Keycloak);
  private authService = inject(AuthService);
  private toast = getNgxToastComponent();
  private translateService = inject(TranslateService);
  private routerService: NgxRouterService = inject(NgxRouterService);
  private userRoles!: PTPRoles[];

  async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {
    const isAllowed = await this.isAllowed(state.url.replace('/', ''));
    return isAllowed;
  }

  async canActivateChild(
    route: ActivatedRouteSnapshot & { readonly routeConfig: RouteLike | null },
    state: RouterStateSnapshot
  ): Promise<boolean> {
    const isAllowed = await this.canActivate(route, state);
    if (!isAllowed) {
      return await this.handleDeny('error.login');
    }
    const { roles } = route.routeConfig?.menu || {};
    if (!roles?.length) {
      return true;
    }
    const userRoles = await this.authService.getUserRoles();
    if (!userRoles?.length) {
      return false;
    }
    const isAdmin = await this.authService.isAdmin();
    if (isAdmin) {
      return true;
    }
    const allowedRole = roles.every((role) => userRoles.includes(role as PTPRoles));
    return allowedRole;
  }

  async isAllowed(url: string): Promise<boolean> {
    // DEMO MODE: bypass auth
    return true;
  }

  async canSelfEnroll(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {
    const url = state.url.split('/').pop() as string;
    const token = getOnWindow(SessionKeys.orgMspId);
    const isAllowed = !!token;
    if (['token', ''].includes(url) && !isAllowed) {
      return true;
    }
    if (!isAllowed) {
      await this.handleDeny('admin.error.mspId', false);
      await this.routerService.navigateTo('admin/token');
    }
    return isAllowed;
  }

  async handleDeny(message: string, logout = true): Promise<boolean> {
    if (logout) {
      await this.authService.logout(true);
    }
    this.toast.error(await firstValueFrom(this.translateService.instant(message)));
    return false;
  }
}

// const canActivateAuthRole = async (
//   route: ActivatedRouteSnapshot,
//   _: RouterStateSnapshot,
//   authData: AuthGuardData
// ): Promise<boolean> => {
//   const { authenticated, grantedRoles } = authData;
//   return authenticated;
// };

export const canActivate: CanActivateFn = async (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
): Promise<boolean> => {
  return await inject(GuardClass).canActivate(route, state);
};

export const canActivateChild: CanActivateFn = async (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
): Promise<boolean> => {
  return await inject(GuardClass).canActivateChild(route, state);
};

export const canSelfEnroll: CanActivateFn = async (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
): Promise<boolean> => {
  return await inject(GuardClass).canSelfEnroll(route, state);
};
