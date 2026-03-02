import { ITabItem } from './interfaces';

export enum PTPRoles {
  ADMIN_ROLE = 'admin',
  WRITER_ROLE = 'writer',
  READER_ROLE = 'reader',
}

export const AdminTableNames = {
  tasks: 'tasks',
  tasksEvents: 'task_event',
};

export const AdminAccountTypes = {
  admin: 'admin',
  organization: 'organization',
} as const;

export const AdminDefaultPages = {
  authToken: 'auth-token',
  logged: 'enrollments',
  enroll: 'enroll',
} as const;

export const SessionKeys = {
  account: 'account',
  token: 'token',
  orgMspId: 'orgMspId',
  roles: 'roles',
  accountType: 'accountType',
} as const;

export const EpiTabs: ITabItem[] = [
  {
    title: 'epiTabs.products',
    url: 'products',
  },
  {
    title: 'epiTabs.batches',
    url: 'batches',
  },
] as const;

export const LogTabs: ITabItem[] = [
  {
    title: 'logTabs.actions',
    value: 'actions',
    icon: 'assets/images/icons/lock.svg',
  },
  {
    title: 'logTabs.access',
    value: 'access',
    icon: 'assets/images/icons/users.svg',
  },
] as const;
