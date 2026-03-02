import { Component, OnInit } from '@angular/core';
import { CardComponent, IBaseCustomEvent, ModelRendererComponent, NgxModelPageDirective } from '@decaf-ts/for-angular';
import { IonContent } from '@ionic/angular/standalone';
import { ContainerComponent } from 'src/app/components/container/container.component';
import { EnrollForm } from 'src/app/forms/admin/EnrollForm';

@Component({
  selector: 'app-enroll',
  templateUrl: './enroll.page.html',
  styleUrls: ['./enroll.page.scss'],
  standalone: true,
  imports: [IonContent, ContainerComponent, CardComponent, ModelRendererComponent],
})
export class EnrollPage extends NgxModelPageDirective implements OnInit {
  constructor() {
    super('organizationEnroll', false);
  }

  async ngOnInit(): Promise<void> {
    await super.initialize();
    this.title = 'organizationEnroll.title';
    this.model = new EnrollForm({});
    this.hasMenu = false;
  }

  override async handleEvent(event: IBaseCustomEvent): Promise<void> {
    const result = await this.handleEvent(event);
    console.log(result);
  }
}
