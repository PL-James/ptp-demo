import { Component, OnInit } from '@angular/core';
import {
  EmptyStateComponent,
  ModelRendererComponent,
  NgxModelPageDirective,
  TableComponent
} from '@decaf-ts/for-angular';
import { IonContent } from '@ionic/angular/standalone';
import { TranslatePipe } from '@ngx-translate/core';
// import { BatchLayout } from 'src/app/layouts/BatchLayout';
import { OperationKeys } from '@decaf-ts/db-decorators';
import { AppCardTitleComponent } from 'src/app/components/card-title/card-title.component';
import { ContainerComponent } from 'src/app/components/container/container.component';
import { AppExpiryDateFieldComponent } from 'src/app/components/expiry-date/expiry-date-field.component';
import { HeaderComponent } from 'src/app/components/header/header.component';
import { AppSelectFieldComponent } from 'src/app/components/select-field/select-field.component';
import { BatchForm } from 'src/app/forms/BatchForm';
import { BatchLayout } from 'src/app/layouts/BatchLayout';
import { EpiTabs } from 'src/app/utils/constants';
import { ITabItem } from 'src/app/utils/interfaces';

@Component({
  selector: 'app-batches',
  templateUrl: './batches.page.html',
  styleUrls: ['./batches.page.scss'],
  standalone: true,
  providers: [AppSelectFieldComponent, AppExpiryDateFieldComponent],
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
export class BatchesPage extends NgxModelPageDirective implements OnInit {
  tabs: ITabItem[] = EpiTabs;

  constructor() {
    super('batch');
  }

  async ngOnInit(): Promise<void> {
    this.model = !this.operation ? new BatchForm() : new BatchLayout();
    this.enableCrudOperations([OperationKeys.DELETE]);
    // keep init after model selection
    this.locale = 'batch';
    this.title = `${this.locale}.title`;
    this.route = 'batches';
    await this.initialize();
  }

  // override async ionViewWillEnter(): Promise<void> {
  //   await super.ionViewWillEnter();
  //   if (this.operation && this.operation !== OperationKeys.CREATE) {
  //     this._data = (this.model as KeyValue)['batch'];
  //     console.log(this._data);
  //   }
  // }
}
