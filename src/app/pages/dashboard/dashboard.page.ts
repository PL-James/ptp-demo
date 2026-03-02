import { Component } from '@angular/core';
import { IconComponent, NgxPageDirective } from '@decaf-ts/for-angular';
import { IonCard, IonCardContent, IonCardTitle, IonContent, IonImg } from '@ionic/angular/standalone';
import { TranslatePipe } from '@ngx-translate/core';
import { addIcons } from 'ionicons';
import { cardOutline, documentAttachOutline, peopleOutline } from 'ionicons/icons';
import { AppCardTitleComponent } from 'src/app/components/card-title/card-title.component';
import { ContainerComponent } from 'src/app/components/container/container.component';
import { HeaderComponent } from 'src/app/components/header/header.component';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  standalone: true,
  imports: [
    TranslatePipe,
    HeaderComponent,
    ContainerComponent,
    AppCardTitleComponent,
    IonContent,
    IonCard,
    IonCardTitle,
    IonCardContent,
    IonImg,
    IconComponent,
  ],
})
export class DashboardPage extends NgxPageDirective {
  cards: { title: string; icon: string; url: string }[] = [
    { title: 'product', icon: 'ti-package', url: '/products' },
    { title: 'task', icon: 'ti-subtask', url: '/tasks' },
    { title: 'batch', icon: 'ti-package', url: '/batches' },
    { title: 'account', icon: 'ti-user', url: '/account' },
    { title: 'leaflet', icon: 'ti-file-search', url: '/leaflets' },
  ];
  // model!: DashboardLayout;
  constructor() {
    super('Dashboard', true);
    addIcons({
      cardOutline,
      peopleOutline,
      documentAttachOutline,
    });
  }

  handleClick(page: string) {
    this.router.navigateByUrl(`${page}`);
  }
}
