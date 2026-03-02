import { model, Model, ModelArg } from '@decaf-ts/decorator-validation';
import {
  ComponentEventNames,
  TransactionHooks,
  uichild,
  uihandlers,
  uilayout,
  uilayoutprop,
  UIMediaBreakPoints,
  uimodel,
} from '@decaf-ts/ui-decorators';
import { Leaflet } from '@pharmaledgerassoc/ptp-toolkit/shared';
import { BatchForm } from '../forms/BatchForm';
import { BatchHandler } from '../handlers/BatchHandler';
import { getLeafletEpiProps } from '../handlers/LeafletHandler';

@uimodel('', {})
@model()
class BatchEpiLayout {
  @uichild(Leaflet.name, 'ngx-decaf-list', getLeafletEpiProps('batchNumber'))
  document!: Leaflet;
}

@uilayout('ngx-decaf-crud-form', true, 1, {
  borders: true,
  breakpoint: UIMediaBreakPoints.XLARGE,
})
@uihandlers({
  [TransactionHooks.BeforeUpdate]: BatchHandler,
  [TransactionHooks.BeforeCreate]: BatchHandler,
  [ComponentEventNames.Submit]: BatchHandler,
  [ComponentEventNames.Render]: BatchHandler,
})
@model()
export class BatchLayout extends Model {
  @uichild(BatchForm.name, 'ngx-decaf-fieldset', {
    borders: false,
    required: true,
    breakpoint: UIMediaBreakPoints.XLARGE,
    ordenable: false,
  })
  @uilayoutprop(2)
  batch!: BatchForm;

  @uichild(BatchEpiLayout.name, 'app-switcher', {
    type: 'column',
    leafletParam: 'batchNumber',
  })
  @uilayoutprop(1)
  epi!: BatchEpiLayout;

  // eslint-disable-next-line @typescript-eslint/no-useless-constructor
  constructor(args?: ModelArg<BatchLayout>) {
    super(args);
  }
}
