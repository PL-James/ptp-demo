import { Component, OnInit } from '@angular/core';
import { IBaseCustomEvent, NgxModelPageDirective, TableComponent } from '@decaf-ts/for-angular';
import { ComponentEventNames } from '@decaf-ts/ui-decorators';
import { IonContent } from '@ionic/angular/standalone';
import { TranslatePipe } from '@ngx-translate/core';
import { Audit } from '@pharmaledgerassoc/ptp-toolkit/shared';
import { AppCardTitleComponent } from 'src/app/components/card-title/card-title.component';
import { HeaderComponent } from 'src/app/components/header/header.component';
import { downloadAsCsv, getAuditModel } from 'src/app/handlers/AuditHandler';
import { ContainerComponent } from '../../components/container/container.component';

@Component({
  selector: 'app-audit',
  templateUrl: './audit.page.html',
  styleUrls: ['./audit.page.scss'],
  standalone: true,
  imports: [TranslatePipe, HeaderComponent, TableComponent, AppCardTitleComponent, IonContent, ContainerComponent],
})
export class AuditPage extends NgxModelPageDirective implements OnInit {
  override _data: Audit[] = [];

  constructor() {
    super('Audit', false);
  }

  async ngOnInit(): Promise<void> {
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
