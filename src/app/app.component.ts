import { Component, inject, OnInit } from '@angular/core';
import { IconComponent, IWindowResizeEvent, NgxPageDirective } from '@decaf-ts/for-angular';
import { IonApp, IonContent, IonMenu, IonRouterOutlet, IonSplitPane } from '@ionic/angular/standalone';
import { TranslateModule } from '@ngx-translate/core';
import { addIcons } from 'ionicons';
import * as IonicIcons from 'ionicons/icons';
import { shareReplay, takeUntil, timer } from 'rxjs';
import { AppName } from './app.config';
import { LogoComponent } from './components/logo/logo.component';
import { AppMenuComponent } from './components/menu/menu.component';
import { AuthService } from './services/auth.service';

/**
 * @description Root component of the Decaf-ts for Angular application
 * @summary This component serves as the main entry point for the application.
 * It sets up the navigation menu, handles routing events, and initializes
 * the application state. It also manages the application title and menu visibility.
 * @class
 * @param {Platform} platform - Ionic Platform service
 * @param {Router} router - Angular Router service
 * @param {MenuController} menuController - Ionic MenuController service
 * @param {Title} titleService - Angular Title service
 * @example
 * <app-root></app-root>
 * @mermaid
 * sequenceDiagram
 *   participant App as AppComponent
 *   participant Router
 *   participant MenuController
 *   participant TitleService
 *   participant Repository
 *   App->>App: constructor()
 *   App->>App: ngOnInit()
 *   App->>Router: Subscribe to events
 *   Router-->>App: Navigation events
 *   App->>MenuController: Enable/Disable menu
 *   App->>TitleService: Set page title
 *   App->>App: initializeApp()
 *   alt isDevelopmentMode
 *     App->>Repository: Initialize repositories
 *   end
 */
@Component({
  standalone: true,
  selector: 'app-root',
  imports: [
    IonApp,
    IonSplitPane,
    IonMenu,
    IonContent,
    IonRouterOutlet,
    TranslateModule,
    IconComponent,
    LogoComponent,
    AppMenuComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  schemas: [],
  providers: [],
})
export class AppComponent extends NgxPageDirective implements OnInit {
  private authService = inject(AuthService);

  menuCollapsed: boolean = false;

  showCollapseButton: boolean = true;

  appDescription: string = 'Product Trust Platform';

  loggedIn: boolean = false;

  constructor() {
    super('', true);
    this.appName = AppName;
    addIcons(IonicIcons);
  }

  /**
   * @description Lifecycle hook that is called after data-bound properties of a directive are initialized
   * @summary Sets up router event subscriptions and initializes the application
   * @return {Promise<void>}
   */
  async ngOnInit(): Promise<void> {
    this.title = 'PTP Frontend';
    this.appName = AppName;
    await this.initialize();
  }

  /**
   * @description Initializes the application
   * @summary Sets the initialized flag and sets up repositories if in development mode
   * @return {Promise<void>}
   */
  override async initialize(): Promise<void> {
    if (!this.showCollapseButton) {
      this.menuCollapsed = false;
    }

    this.authService.session$.pipe(takeUntil(this.destroySubscriptions$)).subscribe((logged: boolean) => {
      const timerSubscription = timer(500).subscribe(() => {
        this.hasMenu = this.loggedIn = logged;
        timerSubscription.unsubscribe();
      });
    });
    await super.initialize();
    if (this.showCollapseButton) {
      this.mediaService
        .windowResizeObserver()
        .pipe(takeUntil(this.destroySubscriptions$), shareReplay(1))
        .subscribe((size: IWindowResizeEvent) => {
          if (this.menuCollapsed && size.width < 1200) {
            this.menuCollapsed = false;
          }
        });
    }
    this.initialized = true;
  }

  handleCollapseMenu() {
    this.menuCollapsed = !this.menuCollapsed;
    this.changeDetectorRef.detectChanges();
  }
}
