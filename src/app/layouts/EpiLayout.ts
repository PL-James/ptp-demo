import { Condition } from '@decaf-ts/core';
import { list, model, Model, ModelArg } from '@decaf-ts/decorator-validation';
import { ComponentEventNames, uichild, uihandlers, uimodel } from '@decaf-ts/ui-decorators';
import { Leaflet, ProductMarket, ProductStrength } from '@pharmaledgerassoc/ptp-toolkit/shared';
import { getLeafletEpiProps } from '../handlers/LeafletHandler';
import { ProductHandler } from '../handlers/ProductHandler';

const filter = Condition.attribute<Leaflet>('productCode');
const commonProps = {
  borders: false,
  required: false,
  ordenable: false,
  editable: false,
  multiple: true,
  filter,
};

// forcing the application of handlers to the child components, as they are rendered dynamically and the decorators won't be applied otherwise
uihandlers({ [ComponentEventNames.Submit]: ProductHandler })(ProductStrength);
uihandlers({ [ComponentEventNames.Submit]: ProductHandler })(ProductMarket);

@uimodel('ngx-decaf-crud-form', {})
@model()
export class EpiLayout extends Model {
  @uichild(Leaflet.name, 'ngx-decaf-list', getLeafletEpiProps('productCode'))
  document!: Leaflet;

  @list(ProductStrength, 'Array')
  @uichild(
    ProductStrength.name,
    'ngx-decaf-fieldset',
    {
      title: 'product.strengths.label',
      showTitle: false,
      ...commonProps,
    },
    true
  )
  // @uionrender(() => EpiHandler)
  strengths!: ProductStrength;

  @list(ProductMarket, 'Array')
  @uichild(
    ProductMarket.name,
    'ngx-decaf-fieldset',
    {
      title: 'product.markets.label',
      showTitle: false,
      ...commonProps,
    },
    true
  )
  // @uionrender(() => EpiHandler)
  markets!: ProductMarket;

  // eslint-disable-next-line @typescript-eslint/no-useless-constructor
  constructor(args?: ModelArg<EpiLayout>) {
    super(args);
  }
}
