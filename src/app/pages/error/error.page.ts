import { Component, Input, OnInit } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { IonContent, IonButton } from '@ionic/angular/standalone';
import {
  CardComponent,
  IconComponent,
  NgxModelPageDirective,
} from '@decaf-ts/for-angular';
import { ContainerComponent } from 'src/app/components/container/container.component';
import { timer } from 'rxjs';

@Component({
  selector: 'app-error',
  templateUrl: './error.page.html',
  styleUrls: ['./error.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonButton,
    IconComponent,
    CardComponent,
    IconComponent,
    TranslatePipe,
    ContainerComponent,
  ],
})
export class ErrorPage extends NgxModelPageDirective implements OnInit {
  @Input()
  message: string | undefined;

  constructor() {
    super('error', false);
  }

  async ngOnInit(): Promise<void> {
    await super.initialize();
    if (!this.message)
      this.message = (await this.translate('error.message')) as string;
    const menuSubsctiption = timer(1200).subscribe(async () => {
      await this.menuController.enable(false);
      menuSubsctiption.unsubscribe();
    });
  }

  handleBack() {
    this.location.back();
  }
}
