import { index, OrderDirection, table } from '@decaf-ts/core';
import { OperationKeys } from '@decaf-ts/db-decorators';
import { description } from '@decaf-ts/decoration';
import { Model, model, ModelArg, required } from '@decaf-ts/decorator-validation';
import { CrudFieldComponent } from '@decaf-ts/for-angular';
import {
  ComponentEventNames,
  DecafComponent,
  hideOn,
  HTML5InputTypes,
  uielement,
  uihandlers,
  UIKeys,
  uilayout,
  uilayoutprop,
  uilistmodel,
  uionclick,
  uionrender,
  uiorder,
  uitablecol,
} from '@decaf-ts/ui-decorators';
import { Batch, Product, TableNames } from '@pharmaledgerassoc/ptp-toolkit/shared';
import { BatchHandler } from '../handlers/BatchHandler';
import { createOnClickShowBarcodeModal, DatamatrixModalHandler } from '../handlers/DatamatrixModalHandler';

//@uses(FabricFlavour)
@table(TableNames.Batch)
@uilistmodel('ngx-decaf-list-item', { icon: 'ti-package' })
@uilayout('ngx-decaf-crud-form', true, 1, { empty: { showButton: false } })
@uihandlers({
  [ComponentEventNames.Render]: BatchHandler,
})
@model()
export class BatchForm extends Batch {
  @index([OrderDirection.ASC, OrderDirection.DSC])
  @uielement('app-select-field', {
    label: 'batch.productCode.label',
    placeholder: 'batch.productCode.placeholder',
    type: HTML5InputTypes.SELECT,
    translatable: false,
    propsMapperFn: {
      readonly: (instance: CrudFieldComponent) => {
        return instance.operation !== OperationKeys.CREATE;
      },
    },
    optionsMapper: (item: Product) => ({
      text: `${item.nameMedicinalProduct} (${item.inventedName})`,
      value: `${item.productCode}`,
    }),
    options: () => Product,
  })
  @uilayoutprop('half')
  @required()
  @uitablecol(2)
  @uiorder(2)
  override productCode!: string;

  // //@cache()
  // @column()
  // // @readonly()
  // @required()
  // // @pattern(BatchPattern)
  @index([OrderDirection.ASC, OrderDirection.DSC])
  @uielement('ngx-decaf-crud-field', {
    label: 'batch.batchNumber.label',
    placeholder: 'batch.batchNumber.placeholder',
    propsMapperFn: {
      readonly: (instance: CrudFieldComponent) => {
        return instance.operation !== OperationKeys.CREATE;
      },
    },
  })
  @uilayoutprop('half')
  @uitablecol(3)
  @uiorder(3)
  override batchNumber!: string;

  @required()
  @uielement('app-expiry-date-field', {
    label: 'batch.expiryDate.label',
    placeholder: 'batch.expiryDate.placeholder',
    type: HTML5InputTypes.TEXT,
  })
  @uilayoutprop('half')
  @uitablecol(4)
  @uiorder(6)
  @uionrender(() => BatchHandler)
  override expiryDate!: Date;

  // Only for ui
  @uielement('app-expiry-date-field', {
    label: 'batch.dayselection.label',
    placeholder: 'batch.dayselection.placeholder',
    type: HTML5InputTypes.CHECKBOX,
  })
  @uilayoutprop('half')
  @uiorder(8)
  @hideOn(OperationKeys.READ, OperationKeys.DELETE)
  @uionrender(() => BatchHandler)
  enableDaySelection: boolean = true;

  //only for ui (table view)
  @uielement('ngx-decaf-crud-field', {
    label: 'batch.dataMatrix.label',
    placeholder: 'batch.dataMatrix.placeholder',
    propsMapperFn: {
      ngOnInit: async (instance: CrudFieldComponent) => {
        await createOnClickShowBarcodeModal(instance);
      },
    },
  })
  @hideOn(OperationKeys.CREATE, OperationKeys.UPDATE)
  @uitablecol(5, async (instance: DecafComponent<Model>, value: string) => {
    return `<span class="ti ti-qrcode"></span> ${await instance.translate('batch.dataMatrix.view')} `;
  })
  @uionclick(() => DatamatrixModalHandler)
  @uiorder(7)
  @uilayoutprop('half')
  dataMatrix!: string;

  @index([OrderDirection.ASC, OrderDirection.DSC])
  @description('Indicates whether this batch has been recalled.')
  @uielement('ngx-decaf-crud-field', {
    label: 'batch.batchRecall.label',
    placeholder: 'batch.batchRecall.placeholder',
    type: HTML5InputTypes.CHECKBOX,
  })
  @uilayoutprop(1)
  @uiorder(UIKeys.LAST)
  override batchRecall: boolean = false;

  @uielement('app-select-field', {
    label: 'batch.nameMedicinalProduct.label',
    placeholder: 'batch.nameMedicinalProduct.placeholder',
    readonly: true,
  })
  @uilayoutprop('half')
  @uiorder(0)
  @uitablecol(1)
  @uionrender(() => BatchHandler)
  nameMedicinalProduct?: string;

  // Only for ui
  @uielement('app-select-field', {
    label: 'batch.inventedName.label',
    placeholder: 'batch.inventedName.placeholder',
    readonly: true,
  })
  @uilayoutprop('half')
  @uitablecol(0)
  @uiorder(1)
  @uionrender(() => BatchHandler)
  inventedName?: string;

  // eslint-disable-next-line @typescript-eslint/no-useless-constructor
  constructor(model?: ModelArg<BatchForm>) {
    super(model);
  }
}
