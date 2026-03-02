import {
  NgxEventHandler,
  ICrudFormEvent,
  KeyValue,
} from '@decaf-ts/for-angular';

export class OrganizationEnrollHandler extends NgxEventHandler {
  /**
   * @description Handles the login event
   * @summary This method extracts the username and password from the event data
   * and checks if both are truthy values. It returns true if both username and
   * password are present, false otherwise.
   * @param {ICrudFormEvent} event - The event object containing login data
   * @return {Promise<boolean>} A promise that resolves to true if login is valid, false otherwise
   */
  override async handle(event: ICrudFormEvent): Promise<void> {
    const { active } = event.data as KeyValue;
    //TODO: make request to activate organization
  }
}
