import { Component, OnInit } from '@angular/core';
import {
  EmptyStateComponent,
  IBaseCustomEvent,
  ModelRendererComponent,
  NgxModelPageDirective,
  TableComponent,
} from '@decaf-ts/for-angular';
import { ComponentEventNames } from '@decaf-ts/ui-decorators';
import { IonContent } from '@ionic/angular/standalone';
import { TranslatePipe } from '@ngx-translate/core';
import { Audit } from '@pharmaledgerassoc/ptp-toolkit/shared';
import { AppCardTitleComponent } from 'src/app/components/card-title/card-title.component';
import { ContainerComponent } from 'src/app/components/container/container.component';
import { HeaderComponent } from 'src/app/components/header/header.component';
import { downloadAsCsv, getAuditModel } from 'src/app/handlers/AuditHandler';

@Component({
  selector: 'app-enrollments',
  templateUrl: './enrollments.page.html',
  styleUrls: ['./enrollments.page.scss'],
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
export class EnrollmentsPage extends NgxModelPageDirective implements OnInit {
  override _data: Audit[] = [];

  async ngOnInit(): Promise<void> {
    this.locale = 'admin.enrollments';
    this.model = getAuditModel();
    this.operations = [];
    this.title = `${this.locale}.title`;
    await super.initialize();
  }

  override async handleEvent(event: IBaseCustomEvent): Promise<void> {
    const { name, data } = event;
    if (name === ComponentEventNames.Refresh) {
      this._data = data as Audit[];
    }
  }

  async exportCsvFile(): Promise<void> {
    downloadAsCsv(this._data as Audit[], `${Date.now()}`, ['User', 'Group', 'Table', 'Transaction', 'Action']);
  }
}
