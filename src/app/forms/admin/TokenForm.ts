import { OperationKeys } from '@decaf-ts/db-decorators';
import { ModelArg } from '@decaf-ts/decorator-validation';
import { hideOn, uihandlers, uimodel } from '@decaf-ts/ui-decorators';
import { AccountType, Token } from '@pharmaledgerassoc/ptp-toolkit/shared';
import { OrganizationTokenHandler } from 'src/app/handlers/admin/OrganizationTokenHandler';

@uimodel('ngx-decaf-crud-form', { operation: OperationKeys.CREATE })
@uihandlers({
  validate: OrganizationTokenHandler,
})
export class TokenForm extends Token {
  @hideOn(OperationKeys.CREATE)
  override classification: AccountType = AccountType.MAH;
  constructor(args: ModelArg<TokenForm> = {}) {
    super(args);
  }
}

// @uimodel('ngx-decaf-crud-form')
// @uihandlers({
//   validate: OrganizationTokenHandler,
// })
// @model()
// export class TokenForm extends Model {
//   @required()
//   @uielement('ngx-decaf-crud-field', {
//     label: 'admin.token.mspid.label',
//     placeholder: 'admin.token.mspid.placeholder',
//     type: HTML5InputTypes.TEXTAREA,
//     // readonly: true,
//   })
//   mspid!: string;

//   @uielement('ngx-decaf-crud-field', {
//     label: 'admin.token.classification.label',
//     placeholder: 'admin.token.classification.placeholder',
//     disabled: true,
//     // readonly: true,
//     options: [{ label: 'account.classification.mah', value: AccountType.MAH }],
//   })
//   classification: AccountType = AccountType.MAH;
//   constructor(args: ModelArg<TokenForm> = {}) {
//     super(args);
//   }
// }
