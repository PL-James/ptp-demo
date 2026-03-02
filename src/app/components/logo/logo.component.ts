import { Component, inject, Input, OnInit  } from '@angular/core';
import { IonImg } from '@ionic/angular/standalone';
import { ElementPosition, NgxMediaService } from '@decaf-ts/for-angular';
import { AppName } from 'src/app/app.config';

@Component({
  selector: 'app-logo',
  templateUrl: './logo.component.html',
  styleUrls: ['./logo.component.scss'],
  imports: [IonImg],
  standalone: true,

})
export class LogoComponent implements OnInit {

  @Input()
  className: string = '';

  @Input()
  showAngularLogo = false;

  @Input()
  logo = '/assets/images/pharmaledger.svg';

  @Input()
  logoContrast = '/assets/images/pharmaledger-contrast.svg';

  @Input()
  width: number | string = 180;

  mediaService = inject(NgxMediaService);

  @Input()
  alt?: string;

  @Input()
  position?: Extract<ElementPosition, 'left' | 'right' | 'center'> = 'center';

  activeLogo!: string;

  async ngOnInit(): Promise<void> {
    this.mediaService.isDarkMode().subscribe(isDark => {
      this.activeLogo = (isDark ? this.logoContrast : this.logo ) as string;
    });
    if(!this.alt)
      this.alt = AppName;
  }
}
