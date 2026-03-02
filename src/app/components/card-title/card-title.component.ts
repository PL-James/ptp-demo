import { Component, Input, OnInit } from '@angular/core';
import { OperationKeys } from '@decaf-ts/db-decorators';
import { NgxComponentDirective } from '@decaf-ts/for-angular';
import { TranslatePipe } from '@ngx-translate/core';
import { ITabItem } from 'src/app/utils/interfaces';
import { AppSwitcherComponent } from '../switcher/switcher.component';

@Component({
  selector: 'app-card-title',
  templateUrl: './card-title.component.html',
  styleUrls: ['./card-title.component.scss'],
  standalone: true,
  imports: [TranslatePipe, AppSwitcherComponent],
})
export class AppCardTitleComponent extends NgxComponentDirective implements OnInit {
  @Input({ required: true })
  title?: string = '';

  @Input()
  subtitle?: string = '';

  @Input()
  allowCreate: boolean = true;

  @Input()
  tabs: ITabItem[] = [];

  @Input()
  override borders: boolean = true;

  @Input()
  override operation: OperationKeys | undefined = undefined;

  @Input()
  createButton = {
    text: 'create',
    color: 'primary',
    visible: true,
    handle: async () => await this.handleRedirect(),
  };

  constructor() {
    super('AppCardTitleComponent');
  }

  async ngOnInit(): Promise<void> {
    // await this.initProps(this.props);
    if (this.allowCreate) {
      this.allowCreate = this.isAllowed(this.operation || OperationKeys.CREATE);
    }
  }

  async handleRedirect(): Promise<void> {
    await this.router.navigateByUrl(`${this.route}/create`);
  }
}
