import { OperationKeys } from '@decaf-ts/db-decorators';
import { Model, model, ModelArg } from '@decaf-ts/decorator-validation';
import { CrudFieldComponent } from '@decaf-ts/for-angular';
import {
  DecafComponent,
  hideOn,
  uielement,
  uilayoutprop,
  uionclick,
  uiorder,
  uitablecol,
  UIKeys,
} from '@decaf-ts/ui-decorators';
import { Product } from '@pharmaledgerassoc/ptp-toolkit/shared';
import { createProductOnClickShowBarcodeModal, DatamatrixModalHandler } from '../handlers/DatamatrixModalHandler';

@model()
export class ProductForm extends Product {
  @uielement('ngx-decaf-crud-field', {
    label: 'batch.dataMatrix.label',
    placeholder: 'batch.dataMatrix.placeholder',
    propsMapperFn: {
      ngOnInit: async (instance: CrudFieldComponent) => {
        await createProductOnClickShowBarcodeModal(instance);
      },
    },
  })
  @hideOn(OperationKeys.CREATE, OperationKeys.UPDATE)
  @uitablecol(5, async (instance: DecafComponent<Model>, value: string) => {
    return `<span class="ti ti-qrcode"></span> ${await instance.translate('batch.dataMatrix.view')} `;
  })
  @uionclick(() => DatamatrixModalHandler)
  @uiorder(UIKeys.LAST)
  @uilayoutprop(1)
  dataMatrix!: string;

  // eslint-disable-next-line @typescript-eslint/no-useless-constructor
  constructor(model?: ModelArg<ProductForm>) {
    super(model);
  }
}
