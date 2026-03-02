import { Component, OnInit } from '@angular/core';
import { CardComponent, ModelRendererComponent, NgxPageDirective } from '@decaf-ts/for-angular';
import { IonContent } from '@ionic/angular/standalone';
import { ContainerComponent } from 'src/app/components/container/container.component';
import { LogoComponent } from 'src/app/components/logo/logo.component';
import { TokenForm } from 'src/app/forms/admin/TokenForm';

@Component({
  selector: 'app-enroll-token',
  templateUrl: './enroll-token.page.html',
  styleUrls: ['./enroll-token.page.scss'],
  standalone: true,
  imports: [IonContent, CardComponent, LogoComponent, ContainerComponent, ModelRendererComponent],
})
export class EnrollTokenPage extends NgxPageDirective implements OnInit {
  constructor() {
    super('EnrollTokenPage', false);
  }

  async ngOnInit(): Promise<void> {
    const model = new TokenForm({});

    this.model = model;
    console.log(this.model);
    await super.initialize();
    this.hasMenu = false;
  }
}
