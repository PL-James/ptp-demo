import { Component, OnInit } from '@angular/core';
import {
  EmptyStateComponent,
  ModelRendererComponent,
  NgxModelPageDirective,
  TableComponent
} from '@decaf-ts/for-angular';
import { IonContent } from '@ionic/angular/standalone';
import { TranslatePipe } from '@ngx-translate/core';
import { AppCardTitleComponent } from 'src/app/components/card-title/card-title.component';
import { ContainerComponent } from 'src/app/components/container/container.component';
import { HeaderComponent } from 'src/app/components/header/header.component';
import { getAuditModel } from 'src/app/handlers/AuditHandler';

@Component({
  selector: 'app-accounts',
  templateUrl: './accounts.page.html',
  styleUrls: ['./accounts.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    ModelRendererComponent,
    TranslatePipe,
    TableComponent,
    HeaderComponent,
    ContainerComponent,
    AppCardTitleComponent,
    TableComponent,
    EmptyStateComponent,
  ],
})
export class AccountsPage extends NgxModelPageDirective implements OnInit {
  async ngOnInit(): Promise<void> {
    this.locale = 'admin.accounts';
    this.model = getAuditModel();
    this.operations = [];
    this.title = `${this.locale}.title`;
    await super.initialize();
  }
}
