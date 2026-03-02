import { Route } from '@angular/router';
import { canActivate, canActivateChild, canSelfEnroll } from './guards/auth.guard';
import { IAppMenuItem, PTPRoles } from './utils';

export type RouteLike = Route & {
  roles?: PTPRoles[];
  menu?: IAppMenuItem;
  children?: RouteLike[];
};

export const routes: RouteLike[] = [
  {
    path: '',
    loadComponent: () => import('./pages/login/login.page').then((m) => m.LoginPage),
  },

  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.page').then((m) => m.LoginPage),
  },

  {
    path: 'dashboard',
    canActivate: [canActivate],
    loadComponent: () => import('./pages/dashboard/dashboard.page').then((m) => m.DashboardPage),
    menu: {
      icon: 'ti-layout-dashboard',
    },
  },

  {
    path: '',
    canActivateChild: [canActivateChild],
    children: [
      {
        path: 'products',
        loadComponent: () => import('./pages/products/products.page').then((m) => m.ProductsPage),

        menu: {
          activeWhen: ['products', 'batches'],
          icon: 'ti-package',
          roles: [PTPRoles.READER_ROLE, PTPRoles.WRITER_ROLE],
        },
      },
      {
        path: 'products/:operation',
        loadComponent: () => import('./pages/products/products.page').then((m) => m.ProductsPage),
      },
      {
        path: 'products/:operation/:modelId',
        loadComponent: () => import('./pages/products/products.page').then((m) => m.ProductsPage),
      },
      {
        path: 'batches',
        loadComponent: () => import('./pages/batches/batches.page').then((m) => m.BatchesPage),
        roles: [PTPRoles.ADMIN_ROLE, PTPRoles.READER_ROLE, PTPRoles.WRITER_ROLE],
      },
      {
        path: 'batches/:operation',
        loadComponent: () => import('./pages/batches/batches.page').then((m) => m.BatchesPage),
      },
      {
        path: 'batches/:operation/:modelId',
        loadComponent: () => import('./pages/batches/batches.page').then((m) => m.BatchesPage),
      },

      {
        path: 'leaflets',
        loadComponent: () => import('./pages/leaflets/leaflets.page').then((m) => m.LeafletsPage),

        menu: {
          icon: 'ti-file-barcode',
          roles: [PTPRoles.READER_ROLE, PTPRoles.WRITER_ROLE],
        },
      },
      {
        path: 'leaflets/:operation',
        loadComponent: () => import('./pages/leaflets/leaflets.page').then((m) => m.LeafletsPage),
      },
      {
        path: 'leaflets/:operation/:modelId',
        loadComponent: () => import('./pages/leaflets/leaflets.page').then((m) => m.LeafletsPage),
      },
      {
        path: 'audit',
        loadComponent: () => import('./pages/audit/audit.page').then((m) => m.AuditPage),
        menu: {
          icon: 'ti-file-search',
          roles: [PTPRoles.ADMIN_ROLE, PTPRoles.READER_ROLE, PTPRoles.WRITER_ROLE],
        },
      },
      {
        path: 'tasks',
        loadComponent: () => import('./pages/tasks/tasks.page').then((m) => m.TasksPage),
        menu: {
          icon: 'ti-subtask',
          roles: [PTPRoles.ADMIN_ROLE, PTPRoles.WRITER_ROLE],
        },
      },
      {
        path: 'tasks/:operation/',
        loadComponent: () => import('./pages/tasks/tasks.page').then((m) => m.TasksPage),
        roles: [PTPRoles.ADMIN_ROLE, PTPRoles.WRITER_ROLE],
      },
      {
        path: 'tasks/:operation/:modelId',
        loadComponent: () => import('./pages/tasks/tasks.page').then((m) => m.TasksPage),
        roles: [PTPRoles.ADMIN_ROLE, PTPRoles.WRITER_ROLE],
      },
      {
        path: 'account',
        loadComponent: () => import('./pages/account/account.page').then((m) => m.AccountPage),

        menu: {
          icon: 'ti-user',
        },
      },
    ],
  },
  {
    path: 'admin',
    children: [
      {
        path: 'token',
        canActivate: [canSelfEnroll],
        loadComponent: () => import('./pages/admin/enroll-token/enroll-token.page').then((m) => m.EnrollTokenPage),
      },
      {
        path: 'enroll',
        canActivate: [canSelfEnroll],
        loadComponent: () => import('./pages/admin/enroll/enroll.page').then((m) => m.EnrollPage),
      },
      {
        path: 'enrollments',
        canActivateChild: [canActivateChild],

        loadComponent: () => import('./pages/admin/enrollments/enrollments.page').then((m) => m.EnrollmentsPage),
        menu: { icon: 'ti-stack-2', roles: [PTPRoles.ADMIN_ROLE] },
      },
      {
        path: 'accounts',
        canActivateChild: [canActivateChild],

        loadComponent: () => import('./pages/admin/accounts/accounts.page').then((m) => m.AccountsPage),
        menu: { icon: 'ti-user-check', roles: [PTPRoles.ADMIN_ROLE] },
      },
    ],
  },

  {
    path: 'error',
    loadComponent: () => import('./pages/error/error.page').then((m) => m.ErrorPage),
  },
  {
    path: 'logout',
    data: { loggedOut: true },
    menu: {
      icon: 'ti-logout-2',
      color: 'danger',
    },
    loadComponent: () => import('./pages/login/login.page').then((m) => m.LoginPage),
  },
  {
    path: '**',
    redirectTo: 'login',
  },
];
