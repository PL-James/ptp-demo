import { ICrudFormEvent, NgxEventHandler, setOnWindow } from '@decaf-ts/for-angular';
import { TokenForm } from 'src/app/forms/admin/TokenForm';
import { getNgxToastComponent } from 'src/app/utils/NgxToastComponent';
import { AdminDefaultPages, SessionKeys } from 'src/app/utils/constants';

export class OrganizationTokenHandler extends NgxEventHandler {
  override async handle(event: ICrudFormEvent): Promise<void> {
    const { mspid } = event.data as TokenForm;
    //TODO: make request to validate token
    const isValid = !!mspid;
    if (isValid) {
      setOnWindow(SessionKeys.orgMspId, mspid);
      await this.router.navigateByUrl(`admin/${AdminDefaultPages.enroll}`);
    }
    const toast = await getNgxToastComponent().show({
      message: isValid ? 'Auth token validated' : 'Invalid auth token.',
      duration: 3000,
      color: isValid ? 'dark' : 'danger',
      position: 'top',
    });
    await toast.present();
  }
}
