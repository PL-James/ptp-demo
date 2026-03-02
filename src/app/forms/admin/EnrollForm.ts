import { column } from '@decaf-ts/core';
import { readonly } from '@decaf-ts/db-decorators';
import { list, Model, model, ModelArg, required } from '@decaf-ts/decorator-validation';
import {
  hidden,
  HTML5InputTypes,
  uichild,
  uielement,
  uihandlers,
  UIKeys,
  uilayoutprop,
  uilistmodel,
  uimodel,
  uiorder,
} from '@decaf-ts/ui-decorators';
import { Account, AccountType } from '@pharmaledgerassoc/ptp-toolkit/shared';
import { OrganizationEnrollHandler } from 'src/app/handlers/admin/OrganizationEnrollHandler';

const commonProps = {
  borders: false,
  required: true,
  ordenable: false,
  editable: false,
  multiple: false,
};

// KeycloakClientRoleConfig
@model()
@uimodel('ngx-decaf-crud-form', { multiple: false })
export class KeycloakClientRole extends Model {
  // @pk()
  @uielement('ngx-decaf-crud-field', {
    label: 'keyCloack.roleName.label',
    placeholder: 'keyCloack.roleName.placeholder',
  })
  @required()
  @uilayoutprop(1)
  roleName!: string;

  @uielement('ngx-decaf-crud-field', {
    label: 'keyCloack.claimValue.label',
    placeholder: 'keyCloack.claimValue.placeholder',
  })
  @required()
  @uilayoutprop(1)
  claimValue!: string;

  // @uielement('ngx-decaf-crud-field', {
  //   label: 'keyCloack.description.label',
  //   placeholder: 'keyCloack.description.placeholder',
  // })
  // @required()
  // @uilayoutprop(1)
  // description!: string;

  // eslint-disable-next-line @typescript-eslint/no-useless-constructor
  constructor(model?: ModelArg<KeycloakClientRole>) {
    super(model);
  }
}

@uimodel('ngx-decaf-crud-form')
@uihandlers({
  enroll: OrganizationEnrollHandler,
})
@model()
export class EnrollForm extends Account {
  // @required()
  // @minlength(4)
  // @uielement('ngx-decaf-crud-field', {
  //   label: 'organizationEnroll.name.label',
  //   placeholder: 'organizationEnroll.name.placeholder',
  // })
  // name!: string;

  @hidden()
  override id!: string;

  @required()
  @column()
  @readonly()
  @uielement('ngx-decaf-crud-field', {
    label: 'admin.token.orgName.label',
    placeholder: 'admin.token.orgName.placeholder',
    readonly: true,
  })
  @uiorder(UIKeys.FIRST)
  override orgName!: string;

  @required()
  @uilistmodel('title') // ui
  @uielement('ngx-decaf-crud-field', {
    label: 'admin.token.mspId.label',
    placeholder: 'admin.token.mspId.placeholder',
    type: HTML5InputTypes.TEXTAREA,
    // readonly: true,
  })
  @uiorder(UIKeys.FIRST)
  override mspId!: string;

  @required()
  @column()
  @uielement('ngx-decaf-crud-field', {
    label: 'admin.token.legalName.label',
    placeholder: 'admin.token.legalName.placeholder',
    // readonly: true,
  })
  @uiorder(UIKeys.FIRST)
  override legalName!: string;

  // TODO: pensar em como relacionar num modelo,
  @list(String)
  @required()
  @uielement('ngx-decaf-crud-field', {
    label: 'organizationEnroll.modules.label',
    placeholder: 'organizationEnroll.modules.placeholder',
    options: () => {
      return ['Epi'].map((s) => ({
        text: `organizationEnroll.modules.options.${s.toLowerCase()}`,
        value: s,
      }));
    },
    multiple: true,
    type: HTML5InputTypes.CHECKBOX,
  })
  modules!: string[]; // epi

  @list(String)
  @required()
  @uielement('ngx-decaf-crud-field', {
    label: 'organizationEnroll.features.epi.label',
    placeholder: 'organizationEnroll.features.epi.placeholder',
    options: () => {
      return ['recall', 'expiry'].map((s) => ({
        text: `organizationEnroll.features.epi.options.${s.toLowerCase()}`,
        value: s,
      }));
    },
    multiple: true,
    type: HTML5InputTypes.CHECKBOX,
  })
  features!: string[]; // epi

  @uichild(
    KeycloakClientRole.name,
    'ngx-decaf-fieldset',
    {
      title: 'organizationEnroll.epiAdmin.label',
      showTitle: false,
      ...commonProps,
      name: 'epiAdmin',
    },
    true
  )
  epiAdmin?: KeycloakClientRole;

  @uichild(
    KeycloakClientRole.name,
    'ngx-decaf-fieldset',
    {
      title: 'organizationEnroll.epiWriter.label',
      showTitle: false,
      ...commonProps,
      name: 'epiWriter',
    },
    true
  )
  epiWriter?: KeycloakClientRole;

  @uichild(
    KeycloakClientRole.name,
    'ngx-decaf-fieldset',
    {
      title: 'organizationEnroll.epiReader.label',
      showTitle: false,
      ...commonProps,
      name: 'epiReader',
    },
    true
  )
  epiReader?: KeycloakClientRole;

  @uielement('ngx-decaf-crud-field', {
    label: 'account.classification.label',
    placeholder: 'account.classification.placeholder',
    readonly: true,
  })
  @uiorder(UIKeys.LAST)
  override classification: AccountType = AccountType.MAH;
  @uielement('ngx-decaf-crud-field', {
    label: 'organizationEnroll.onPrem.label',
    placeholder: 'organizationEnroll.onPrem.placeholder',
    type: HTML5InputTypes.CHECKBOX,
    disabled: true,
  })
  @uiorder(UIKeys.LAST)
  override onPrem: boolean = false;

  // features:

  //   export const epiFeatures = [
  //   {
  //     name: "recall",
  //     description: "supports signalling a product/batch is recalled",
  //     module: "epi",
  //   },
  //   {
  //     name: "expiry",
  //     description: "supports signalling the batch is expired",
  //     module: "epi",
  //   },
  // ].map((f) => new PTPModuleFeature(f));

  constructor(args: ModelArg<EnrollForm> = {}) {
    super(args);
  }
}
