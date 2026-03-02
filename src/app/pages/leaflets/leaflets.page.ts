import { Component, OnInit } from '@angular/core';
import { OperationKeys } from '@decaf-ts/db-decorators';
import {
  EmptyStateComponent,
  ModelRendererComponent,
  NgxModelPageDirective,
  TableComponent,
} from '@decaf-ts/for-angular';
import { IonContent } from '@ionic/angular/standalone';
import { TranslatePipe } from '@ngx-translate/core';
import { AppCardTitleComponent } from 'src/app/components/card-title/card-title.component';
import { ContainerComponent } from 'src/app/components/container/container.component';
import { HeaderComponent } from 'src/app/components/header/header.component';
import { getLeafletModel } from 'src/app/handlers/LeafletHandler';

@Component({
  selector: 'app-leaflets',
  templateUrl: './leaflets.page.html',
  styleUrls: ['./leaflets.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    ModelRendererComponent,
    AppCardTitleComponent,
    TranslatePipe,
    TableComponent,
    HeaderComponent,
    ContainerComponent,
    EmptyStateComponent,
  ],
})
export class LeafletsPage extends NgxModelPageDirective implements OnInit {
  constructor() {
    super('leaflet');
  }

  async ngOnInit(): Promise<void> {
    this.title = 'leaflet.title';
    this.route = 'leaflets';
    this.model = getLeafletModel();
    this.enableCrudOperations([OperationKeys.UPDATE]);
    await super.initialize();
  }
}
