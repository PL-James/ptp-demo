import { Component, inject, Input, OnDestroy, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { IconComponent, IMenuItem, NgxPageDirective } from '@decaf-ts/for-angular';
import { IonItem, IonLabel, IonList, IonMenuToggle, IonRouterLink } from '@ionic/angular/standalone';
import { TranslatePipe } from '@ngx-translate/core';
import { takeUntil } from 'rxjs';
import { RouteLike } from 'src/app/app.routes';
import { PTPRoles } from 'src/app/utils/constants';
import { IAppMenuItem } from 'src/app/utils/interfaces';
import { MenuLike } from 'src/app/utils/types';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss'],
  standalone: true,
  imports: [
    TranslatePipe,
    RouterLink,
    RouterLinkActive,
    IonList,
    IonMenuToggle,
    IonItem,
    IonLabel,
    IonRouterLink,
    IconComponent,
  ],
})
export class AppMenuComponent extends NgxPageDirective implements OnInit, OnDestroy {
  @Input()
  collapsed: boolean = false;

  private authService: AuthService = inject(AuthService);

  override menu: (IMenuItem & IAppMenuItem)[] = [];
  userRoles!: PTPRoles[];

  async ngOnInit(): Promise<void> {
    this.subscribeEvents();
    this.menu = this.getItems();
    this.initialized = true;
  }

  override async ngOnDestroy() {
    await super.ngOnDestroy();
  }

  subscribeEvents() {
    this.authService.roles$.pipe(takeUntil(this.destroySubscriptions$)).subscribe((roles) => {
      if (this.initialized) {
        this.userRoles = roles as PTPRoles[];
        this.menu = this.getItems();
      }
    });

    this.authService.session$.pipe(takeUntil(this.destroySubscriptions$)).subscribe((logged: boolean) => {
      if (!logged) {
        this.userRoles = [];
        this.menu = [];
      }
    });

    // Debug only
    // this.authService.route$
    //   .pipe(takeUntil(this.destroySubscriptions$))
    //   .subscribe((route) => {
    //     console.log('Rota acessada:', route);
    //   });
  }

  handleCollapseMenu(): void {
    this.changeDetectorRef.detectChanges();
  }

  isMenuActive(item: IMenuItem & { activeWhen: string[] }): boolean {
    const { url, activeWhen } = item;
    return (
      (url?.length && (url === this.currentRoute || (activeWhen || []).includes(this.currentRoute as string))) || false
    );
  }

  private getItems(): MenuLike[] {
    const routes = this.router.config as RouteLike[];
    const items = [] as MenuLike[];

    const getHeader = (route: RouteLike, separator: boolean = false) => {
      const { path, menu } = route || {};
      return {
        ...menu,
        label: !path ? 'core' : `menu.${path}`,
        url: separator ? undefined : path || undefined,
      };
    };
    routes
      .filter((route) => route.path !== '**')
      .map((route) => {
        const { children, menu, path } = route;
        if (!children?.length) {
          if (menu) {
            items.push(getHeader(route));
          }
        } else {
          items.push(getHeader(route, true));
          const parentPath = path;
          children?.map((child: RouteLike) => {
            const { path, menu } = child;
            if (menu) {
              const { label, title, url } = menu || {};
              const route = parentPath ? `${parentPath}/${path || url}` : `${path || url}`;
              items.push({
                ...menu,
                ...{
                  label: title || label || !parentPath ? `menu.${path}` : `menu.${parentPath}.${path}`,
                  url: route,
                },
              });
            }
          });
        }
      });
    return items;
  }
}
