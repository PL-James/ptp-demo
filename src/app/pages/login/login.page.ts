import { Component, inject, Input, OnInit } from '@angular/core';
import { IconComponent, NgxPageDirective, NgxSvgDirective } from '@decaf-ts/for-angular';
import { IonButton, IonCard, IonCardContent, IonContent } from '@ionic/angular/standalone';
import { timer } from 'rxjs';
import { AppName } from 'src/app/app.config';
import { AuthService } from 'src/app/services/auth.service';
import { ContainerComponent } from '../../components/container/container.component';
import { LogoComponent } from '../../components/logo/logo.component';

/**
 * @description Login page component for user authentication
 * @summary This component handles the login functionality, including form rendering and event handling.
 * It uses the LoginForm for data binding and interacts with the LoginHandler for authentication logic.
 * The component also manages locale context for internationalization and provides user feedback
 * through toast messages for login operations.
 * @class
 * @param {LoginForm} model - Form model instance for login data binding
 * @param {string} locale - Locale context for internationalization
 * @param {Router} router - Angular Router for navigation
 * @param {ToastController} toastController - Ionic ToastController for displaying messages
 * @example
 * <app-login></app-login>
 * @mermaid
 * sequenceDiagram
 *   participant User
 *   participant LoginPage
 *   participant LoginHandler
 *   participant Router
 *   participant ToastController
 *   User->>LoginPage: Enter credentials
 *   LoginPage->>LoginHandler: Handle login event
 *   LoginHandler-->>LoginPage: Return login result
 *   LoginPage->>ToastController: Create toast message
 *   alt Login successful
 *     LoginPage->>Router: Navigate to dashboard
 *   end
 *   LoginPage->>ToastController: Present toast
 */
@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [
    NgxSvgDirective,
    IconComponent,
    IonContent,
    IonCard,
    IonCardContent,
    IonButton,
    LogoComponent,
    ContainerComponent,
  ],
})
export class LoginPage extends NgxPageDirective implements OnInit {
  authService = inject(AuthService);

  @Input()
  loggedOut: boolean = false;

  AppName: string = AppName;

  image: string = 'assets/images/favicon-contrast.svg';

  error: boolean = false;

  authenticated: boolean = false;

  constructor() {
    super('LoginPage', false);
  }

  async ngOnInit(): Promise<void> {
    if (!this.loggedOut) {
      this.authenticated = await this.authService.isLoggedIn();
      const initializeSubscription = timer(3000).subscribe(() => {
        this.initialized = true;
        if (this.authenticated) {
          this.router.navigate(['/dashboard']);
        }
        initializeSubscription.unsubscribe();
      });
    } else {
      await this.authService.logout();
    }
  }

  async authenticate(): Promise<void> {
    this.initialized = false;
    this.authenticated = await this.authService.isLoggedIn();
    if (!this.authenticated) {
      await this.authService.openSsoLogin();
    } else {
      this.router.navigate(['/dashboard']);
    }
    this.initialized = true;
  }
}
